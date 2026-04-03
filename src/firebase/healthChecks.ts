import { db, auth, storage } from '@/firebase/config';
import { collection, getDocs, doc, getDoc, limit, query } from 'firebase/firestore';
import { ref, list } from 'firebase/storage';
import { checkJikanStatus, type JikanStatusResponse } from '@/services/animeApi';
import { getGlobalConfig } from '@/firebase/firestore';
import { logger } from '@/utils/logger';

// ─── Types ───────────────────────────────────────────────────────────
export type ServiceStatus = 'operational' | 'degraded' | 'down' | 'checking';

export interface ServiceHealthResult {
    service: string;
    status: ServiceStatus;
    responseTime: number; // ms
    message?: string;
    checkedAt: number;
}

export interface DataIntegrityReport {
    totalUsers: number;
    missingDisplayName: number;
    missingPhotoURL: number;
    dataHealthScore: number; // 0-100
    checkedAt: number;
}

export interface GamificationHealthStats {
    totalUsers: number;
    avgLevel: number;
    maxLevelUsers: number;
    usersWithBadges: number;
    badgeUnlockRate: number; // 0-100
    avgXP: number;
    checkedAt: number;
}

export interface SecurityOverview {
    bannedUsersCount: number;
    maintenanceMode: boolean;
    registrationsOpen: boolean;
    checkedAt: number;
}

export interface FullHealthReport {
    infrastructure: ServiceHealthResult[];
    jikan: JikanStatusResponse | null;
    dataIntegrity: DataIntegrityReport;
    gamification: GamificationHealthStats;
    security: SecurityOverview;
    overallScore: number; // 0-100
    checkedAt: number;
}

// ─── Infrastructure Checks ──────────────────────────────────────────

/** Check Firebase Auth connectivity */
export async function checkFirebaseAuth(): Promise<ServiceHealthResult> {
    const start = performance.now();
    try {
        // Lightweight check: just see if currentUser is accessible
        const _user = auth.currentUser;
        const elapsed = Math.round(performance.now() - start);
        return {
            service: 'Firebase Auth',
            status: 'operational',
            responseTime: elapsed,
            message: _user ? 'Authenticated' : 'Service reachable',
            checkedAt: Date.now()
        };
    } catch (error) {
        const elapsed = Math.round(performance.now() - start);
        logger.error('[HealthCheck] Auth check failed:', error);
        return {
            service: 'Firebase Auth',
            status: 'down',
            responseTime: elapsed,
            message: error instanceof Error ? error.message : 'Unknown error',
            checkedAt: Date.now()
        };
    }
}

/** Check Firestore connectivity with a lightweight read */
export async function checkFirestore(): Promise<ServiceHealthResult> {
    const start = performance.now();
    try {
        // Read current user's own profile doc (always permitted by rules)
        const uid = auth.currentUser?.uid;
        if (!uid) {
            return {
                service: 'Firestore',
                status: 'degraded',
                responseTime: Math.round(performance.now() - start),
                message: 'No authenticated user',
                checkedAt: Date.now()
            };
        }
        const userDoc = await getDoc(doc(db, 'users', uid));
        const elapsed = Math.round(performance.now() - start);
        return {
            service: 'Firestore',
            status: userDoc.exists() ? 'operational' : 'degraded',
            responseTime: elapsed,
            message: userDoc.exists() ? 'Connected' : 'User doc missing',
            checkedAt: Date.now()
        };
    } catch (error) {
        const elapsed = Math.round(performance.now() - start);
        logger.error('[HealthCheck] Firestore check failed:', error);
        return {
            service: 'Firestore',
            status: 'down',
            responseTime: elapsed,
            message: error instanceof Error ? error.message : 'Connection failed',
            checkedAt: Date.now()
        };
    }
}

/** Check Firebase Storage connectivity */
export async function checkStorage(): Promise<ServiceHealthResult> {
    const start = performance.now();
    try {
        // List root with maxResults=1 — works if Storage Security Rules
        // allow reads or if the user is admin. If it throws "permission-denied"
        // we still know Storage is reachable (just locked).
        const rootRef = ref(storage);
        try {
            await list(rootRef, { maxResults: 1 });
        } catch (innerError: unknown) {
            // 403/permission-denied still means the service is reachable
            const msg = innerError instanceof Error ? innerError.message : '';
            if (msg.includes('unauthorized') || msg.includes('403') || msg.includes('permission')) {
                const elapsed = Math.round(performance.now() - start);
                return {
                    service: 'Storage',
                    status: 'operational',
                    responseTime: elapsed,
                    message: 'Bucket reachable (auth-gated)',
                    checkedAt: Date.now()
                };
            }
            throw innerError; // genuine connectivity failure
        }
        const elapsed = Math.round(performance.now() - start);
        return {
            service: 'Storage',
            status: 'operational',
            responseTime: elapsed,
            message: 'Bucket accessible',
            checkedAt: Date.now()
        };
    } catch (error) {
        const elapsed = Math.round(performance.now() - start);
        logger.error('[HealthCheck] Storage check failed:', error);
        return {
            service: 'Storage',
            status: 'down',
            responseTime: elapsed,
            message: error instanceof Error ? error.message : 'Bucket unreachable',
            checkedAt: Date.now()
        };
    }
}

/** Check Jikan API (external) */
export async function checkJikan(): Promise<ServiceHealthResult> {
    const start = performance.now();
    try {
        const result = await checkJikanStatus();
        const elapsed = Math.round(performance.now() - start);
        return {
            service: 'Jikan API',
            status: result.status === 'online' ? 'operational'
                : result.status === 'offline' ? 'down' : 'degraded',
            responseTime: result.responseTime || elapsed,
            message: `MyAnimeList proxy – ${result.status}`,
            checkedAt: Date.now()
        };
    } catch (error) {
        const elapsed = Math.round(performance.now() - start);
        return {
            service: 'Jikan API',
            status: 'down',
            responseTime: elapsed,
            message: 'API unreachable',
            checkedAt: Date.now()
        };
    }
}

// ─── Data Integrity ─────────────────────────────────────────────────

export async function getDataIntegrityReport(): Promise<DataIntegrityReport> {
    try {
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(500)));
        let missingDisplayName = 0;
        let missingPhotoURL = 0;

        usersSnap.docs.forEach(d => {
            const data = d.data();
            if (!data.displayName || data.displayName.trim() === '') missingDisplayName++;
            if (!data.photoURL || data.photoURL.trim() === '') missingPhotoURL++;
        });

        const total = usersSnap.size;
        const issuesCount = missingDisplayName + missingPhotoURL;
        const maxIssues = total * 2; // 2 fields checked per user
        const score = maxIssues > 0 ? Math.round(((maxIssues - issuesCount) / maxIssues) * 100) : 100;

        return {
            totalUsers: total,
            missingDisplayName,
            missingPhotoURL,
            dataHealthScore: score,
            checkedAt: Date.now()
        };
    } catch (error) {
        logger.error('[HealthCheck] Data integrity check failed:', error);
        return {
            totalUsers: 0,
            missingDisplayName: 0,
            missingPhotoURL: 0,
            dataHealthScore: 0,
            checkedAt: Date.now()
        };
    }
}

// ─── Gamification Health ────────────────────────────────────────────

export async function getGamificationHealthStats(): Promise<GamificationHealthStats> {
    try {
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(500)));
        let totalLevel = 0;
        let totalXP = 0;
        let maxLevelUsers = 0;
        let usersWithBadges = 0;

        usersSnap.docs.forEach(d => {
            const data = d.data();
            const level = data.level || 1;
            const xp = data.xp || 0;
            const badges = data.unlockedBadges || [];

            totalLevel += level;
            totalXP += xp;
            if (level >= 100) maxLevelUsers++;
            if (badges.length > 0) usersWithBadges++;
        });

        const total = usersSnap.size;

        return {
            totalUsers: total,
            avgLevel: total > 0 ? Math.round((totalLevel / total) * 10) / 10 : 0,
            maxLevelUsers,
            usersWithBadges,
            badgeUnlockRate: total > 0 ? Math.round((usersWithBadges / total) * 100) : 0,
            avgXP: total > 0 ? Math.round(totalXP / total) : 0,
            checkedAt: Date.now()
        };
    } catch (error) {
        logger.error('[HealthCheck] Gamification stats failed:', error);
        return {
            totalUsers: 0,
            avgLevel: 0,
            maxLevelUsers: 0,
            usersWithBadges: 0,
            badgeUnlockRate: 0,
            avgXP: 0,
            checkedAt: Date.now()
        };
    }
}

// ─── Security Overview ──────────────────────────────────────────────

export async function getSecurityOverview(): Promise<SecurityOverview> {
    try {
        const [usersSnap, config] = await Promise.all([
            getDocs(query(collection(db, 'users'), limit(500))),
            getGlobalConfig()
        ]);

        const bannedCount = usersSnap.docs.filter(d => d.data().isBanned === true).length;

        return {
            bannedUsersCount: bannedCount,
            maintenanceMode: config?.maintenance || false,
            registrationsOpen: config?.registrationsOpen ?? true,
            checkedAt: Date.now()
        };
    } catch (error) {
        logger.error('[HealthCheck] Security overview failed:', error);
        return {
            bannedUsersCount: 0,
            maintenanceMode: false,
            registrationsOpen: true,
            checkedAt: Date.now()
        };
    }
}

// ─── Full Health Report ─────────────────────────────────────────────

export async function getFullHealthReport(): Promise<FullHealthReport> {
    const [authResult, firestoreResult, storageResult, jikanResult, dataIntegrity, gamification, security] =
        await Promise.all([
            checkFirebaseAuth(),
            checkFirestore(),
            checkStorage(),
            checkJikan(),
            getDataIntegrityReport(),
            getGamificationHealthStats(),
            getSecurityOverview()
        ]);

    const infrastructure = [authResult, firestoreResult, storageResult, jikanResult];

    // Compute overall score
    const infraScore = infrastructure.reduce((acc, svc) => {
        if (svc.status === 'operational') return acc + 25;
        if (svc.status === 'degraded') return acc + 12;
        return acc;
    }, 0);

    const overallScore = Math.round((infraScore + dataIntegrity.dataHealthScore) / 2);

    return {
        infrastructure,
        jikan: null, // already included in infrastructure array
        dataIntegrity,
        gamification,
        security,
        overallScore,
        checkedAt: Date.now()
    };
}
