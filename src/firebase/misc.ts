import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, setDoc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { logger } from '@/utils/logger';
import type { ActivityEvent } from '@/types/activity';
import type { UserProfile } from './users';

// ==================== ACTIVITY & TRENDS (MISC/DASHBOARD) ====================

export interface EngagementBreakdown {
    watch: number;
    read: number;
    add_work: number;
    level_up: number;
    badge: number;
    complete: number;
}

export interface ContentStat {
    title: string;
    count: number;
    id: number;
    image?: string;
}

export interface FunnelStep {
    name: string;
    value: number;
}

export interface HistoricalTrend {
    date: string;
    inscriptions: number;
    activities: number;
    activeUsers: number;
}

export async function getSevenDayActivityStats() {
    try {
        const q = query(
            collection(db, 'activities'),
            orderBy('timestamp', 'desc'),
            limit(500)
        );
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as ActivityEvent);

        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const statsMap = new Map<string, { name: string, active: number, new: number, activities: number, index: number }>();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            statsMap.set(dayName, { name: dayName, active: 0, new: 0, activities: 0, index: 6 - i });
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startTime = sevenDaysAgo.getTime();

        const usersQuery = query(
            collection(db, 'users'),
            where('createdAt', '>=', startTime)
        );
        const usersSnap = await getDocs(usersQuery);
        const newUsers = usersSnap.docs.map(doc => doc.data() as UserProfile);

        activities.forEach(act => {
            const date = new Date(act.timestamp);
            const dayName = days[date.getDay()];

            if (date > sevenDaysAgo && statsMap.has(dayName)) {
                const stat = statsMap.get(dayName)!;
                stat.activities += 1;
                stat.active += 1;
            }
        });

        newUsers.forEach(u => {
            const date = new Date(u.createdAt || 0);
            const dayName = days[date.getDay()];
            if (statsMap.has(dayName)) {
                statsMap.get(dayName)!.new += 1;
            }
        });

        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            result.push(statsMap.get(dayName));
        }

        return result;

    } catch (error) {
        logger.error('Error fetching chart stats:', error);
        return [];
    }
}

export async function getEngagementBreakdown(daysCount = 7): Promise<EngagementBreakdown> {
    try {
        const startTime = Date.now() - (daysCount * 24 * 60 * 60 * 1000);
        const q = query(
            collection(db, 'activities'),
            where('timestamp', '>=', startTime)
        );
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as ActivityEvent);

        const breakdown = {
            watch: activities.filter(a => a.type === 'watch').length,
            read: activities.filter(a => a.type === 'read').length,
            add_work: activities.filter(a => a.type === 'add_work').length,
            level_up: activities.filter(a => a.type === 'level_up').length,
            badge: activities.filter(a => a.type === 'badge').length,
            complete: activities.filter(a => a.type === 'complete').length,
        };

        return breakdown;
    } catch (error) {
        logger.error('[Firestore] Error getting engagement breakdown:', error);
        return { watch: 0, read: 0, add_work: 0, level_up: 0, badge: 0, complete: 0 };
    }
}

export async function getTopContentStats(limitCount = 5, daysCount = 30): Promise<ContentStat[]> {
    try {
        const startTime = Date.now() - (daysCount * 24 * 60 * 60 * 1000);
        const q = query(
            collection(db, 'activities'),
            where('timestamp', '>=', startTime)
        );
        const snapshot = await getDocs(q);
        const counts: Record<string, { title: string, count: number, id: number, image?: string }> = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data() as ActivityEvent;
            if (['add_work', 'watch', 'read', 'complete'].includes(data.type)) {
                const workId = data.workId?.toString();
                const workTitle = data.workTitle || 'Unknow Work';

                if (workId) {
                    if (!counts[workId]) {
                        counts[workId] = { title: workTitle, count: 0, id: Number(workId), image: data.workImage };
                    }
                    counts[workId].count += 1;
                }
            }
        });

        return Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limitCount);
    } catch (error) {
        logger.error('[Firestore] Error getting top content stats:', error);
        return [];
    }
}

export async function getFunnelStats(): Promise<FunnelStep[]> {
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const total = usersSnap.size;

        const activitiesSnap = await getDocs(collection(db, 'activities'));
        const activities = activitiesSnap.docs.map(d => d.data() as ActivityEvent);
        const userIdsWithActivity = new Set(activities.map(a => a.userId));

        const usersWithAdd = new Set(activities.filter(a => a.type === 'add_work').map(a => a.userId));
        const usersWithProgress = new Set(activities.filter(a => ['watch', 'read', 'complete'].includes(a.type)).map(a => a.userId));

        return [
            { name: 'Inscription', value: total },
            { name: 'Ajout Premier Work', value: usersWithAdd.size },
            { name: 'Mise à jour Progression', value: usersWithProgress.size },
            { name: 'Engagement Actif', value: userIdsWithActivity.size }
        ];
    } catch (error) {
        logger.error('[Firestore] Error getting funnel stats:', error);
        return [];
    }
}

export async function getHistoricalTrends(daysCount = 30): Promise<HistoricalTrend[]> {
    try {
        const now = Date.now();
        const startTime = now - (daysCount * 24 * 60 * 60 * 1000);

        const activitiesQuery = query(
            collection(db, 'activities'),
            where('timestamp', '>=', startTime),
            orderBy('timestamp', 'asc')
        );
        const usersQuery = query(
            collection(db, 'users'),
            where('createdAt', '>=', startTime),
            orderBy('createdAt', 'asc')
        );

        const [activitiesSnap, usersSnap] = await Promise.all([
            getDocs(activitiesQuery),
            getDocs(usersQuery)
        ]);

        const activities = activitiesSnap.docs.map(d => d.data() as ActivityEvent);
        const users = usersSnap.docs.map(d => d.data() as UserProfile);

        const dailyData: Record<string, { date: string, inscriptions: number, activities: number, activeUsers: number, uniqueUsers: Set<string> }> = {};

        for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            dailyData[dateStr] = { date: dateStr, inscriptions: 0, activities: 0, activeUsers: 0, uniqueUsers: new Set() };
        }

        users.forEach(u => {
            const dateStr = new Date(u.createdAt || 0).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            if (dailyData[dateStr]) dailyData[dateStr].inscriptions += 1;
        });

        activities.forEach(a => {
            const dateStr = new Date(a.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            if (dailyData[dateStr]) {
                dailyData[dateStr].activities += 1;
                dailyData[dateStr].uniqueUsers.add(a.userId);
            }
        });

        return Object.values(dailyData).map(day => ({
            date: day.date,
            inscriptions: day.inscriptions,
            activities: day.activities,
            activeUsers: day.uniqueUsers.size
        }));
    } catch (error) {
        logger.error('[Firestore] Error getting historical trends:', error);
        return [];
    }
}

export async function getAllActivities(limitCount: number = 50): Promise<ActivityEvent[]> {
    try {
        const q = query(
            collection(db, 'activities'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as ActivityEvent);
    } catch (error) {
        logger.error('[Firestore] Error getting all activities:', error);
        return [];
    }
}

// ==================== GLOBAL CONFIG / ANNOUNCEMENTS ====================

export interface GlobalConfig {
    announcement: {
        message: string;
        active: boolean;
        type: 'info' | 'warning' | 'alert';
        lastUpdated: number;
    };
    maintenance: boolean;
    registrationsOpen: boolean;
}

export async function getGlobalConfig(): Promise<GlobalConfig | null> {
    try {
        const docRef = doc(db, 'config', 'global');
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() as GlobalConfig : null;
    } catch (error) {
        logger.error('[Firestore] Error getting global config:', error);
        return null;
    }
}

export async function setGlobalAnnouncement(message: string, type: 'info' | 'warning' | 'alert', active: boolean): Promise<void> {
    try {
        await setDoc(doc(db, 'config', 'global'), {
            announcement: {
                message,
                type,
                active,
                lastUpdated: Date.now()
            }
        }, { merge: true });
        logger.log('[Firestore] Announcement updated');
    } catch (error) {
        logger.error('[Firestore] Error setting announcement:', error);
        throw error;
    }
}

export async function setGlobalConfig(config: Partial<Omit<GlobalConfig, 'announcement'>>): Promise<void> {
    try {
        await setDoc(doc(db, 'config', 'global'), config, { merge: true });
        logger.log('[Firestore] Global config updated');
    } catch (error) {
        logger.error('[Firestore] Error setting config:', error);
        throw error;
    }
}

export function subscribeToGlobalConfig(callback: (config: GlobalConfig | null) => void): () => void {
    const docRef = doc(db, 'config', 'global');
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as GlobalConfig);
        } else {
            callback(null);
        }
    }, (error) => {
        logger.error('[Firestore] Error subscribing to global config:', error);
        callback(null);
    });
}

// --- DEPLOYMENTS ---

export interface DeploymentEvent {
    id: string;
    channelId: string;
    url: string;
    createdAt: Timestamp;
    expiresAt: Timestamp;
    type: 'preview' | 'live';
    status: 'active' | 'expired';
}

export async function getDeployments(limitCount = 10): Promise<DeploymentEvent[]> {
    try {
        const q = query(
            collection(db, 'deployments'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as DeploymentEvent));
    } catch (error) {
        logger.error('[Firestore] Error fetching deployments:', error);
        return [];
    }
}

// ==================== SURVEY DASHBOARD ====================

export interface SurveyResponse {
    id: string;
    surveyId: string;
    answers: Record<string, unknown>;
    submittedAt: number;
    userAgent: string;
    language: string;
}

export async function getSurveyResponses(): Promise<SurveyResponse[]> {
    try {
        const q = query(collection(db, 'survey_responses'), orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SurveyResponse));
    } catch (error) {
        logger.error('[Firestore] Error getting survey responses:', error);
        return [];
    }
}

export async function deleteSurveyResponse(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'survey_responses', id));
        logger.log('[Firestore] Survey response deleted:', id);
    } catch (error) {
        logger.error('[Firestore] Error deleting survey response:', error);
        throw error;
    }
}
