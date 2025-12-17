import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, limit, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from './config';
import type { Work } from '@/store/libraryStore';
import type { Badge } from '@/types/badge';
import type { ActivityEvent } from '@/types/activity';
import type { Comment, CommentWithReplies } from '@/types/comment';
import type { Challenge } from '@/types/challenge';

// Types for Firestore data
interface LibraryData {
    works: Work[];
    lastUpdated: number;
}

interface GamificationData {
    level: number;
    xp: number;
    xpToNextLevel: number;
    streak: number;
    lastActivityDate: string | null;
    badges: Badge[];
    totalChaptersRead: number;
    totalWorksAdded: number;
    totalWorksCompleted: number;
    lastUpdated: number;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    lastLogin: number;
    xp?: number;
    level?: number;
    streak?: number;
    badges?: { id: string; name: string; description: string; icon: string; rarity: string; unlockedAt?: number }[];
    totalChaptersRead?: number;
    totalWorksAdded?: number;
    totalWorksCompleted?: number;
    banner?: string;
    bio?: string;
    themeColor?: string;
    cardBgColor?: string;
    borderColor?: string;
    favoriteManga?: string;
    top3Favorites?: string[];
    featuredBadge?: string;
}

// Save user profile to Firestore
// Save user profile to Firestore
export async function saveUserProfileToFirestore(user: Partial<UserProfile>): Promise<void> {
    try {
        if (!user.uid) return;

        const docRef = doc(db, 'users', user.uid);

        // Prepare data to save - filter out undefined but Keep null/empty strings to allow clearing
        const dataToSave: any = {
            lastLogin: Date.now()
        };

        // List of allowed fields to sync
        const allowedFields: (keyof UserProfile)[] = [
            'email', 'displayName', 'photoURL', 'banner', 'bio',
            'themeColor', 'cardBgColor', 'borderColor',
            'favoriteManga', 'top3Favorites', 'featuredBadge'
        ];

        allowedFields.forEach(field => {
            if (user[field] !== undefined) {
                dataToSave[field] = user[field];
            }
        });

        await setDoc(docRef, dataToSave, { merge: true });
        console.log('[Firestore] User profile saved:', dataToSave);
    } catch (error) {
        console.error('[Firestore] Error saving user profile:', error);
        throw error; // Re-throw to let UI know
    }
}

// Save library data to Firestore
export async function saveLibraryToFirestore(userId: string, works: Work[]): Promise<void> {
    try {
        const docRef = doc(db, 'users', userId, 'data', 'library');
        await setDoc(docRef, {
            works,
            lastUpdated: Date.now()
        } as LibraryData);
        console.log('[Firestore] Library saved');
    } catch (error: any) {
        console.error('[Firestore] Error saving library:', error);
        if (error.code === 'permission-denied') {
            console.error('[Firestore] PERMISSION DENIED: Check your Firestore Security Rules in Firebase Console.');
        }
    }
}

// Load library data from Firestore
export async function loadLibraryFromFirestore(userId: string): Promise<Work[] | null> {
    try {
        const docRef = doc(db, 'users', userId, 'data', 'library');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as LibraryData;
            console.log('[Firestore] Library loaded');
            return data.works;
        }
        return null; // No data in Firestore
    } catch (error) {
        console.error('[Firestore] Error loading library:', error);
        return null;
    }
}

// Save gamification data to Firestore
export async function saveGamificationToFirestore(
    userId: string,
    data: Omit<GamificationData, 'lastUpdated'>
): Promise<void> {
    try {
        // 1. Save detailed gamification data to sub-collection
        const docRef = doc(db, 'users', userId, 'data', 'gamification');
        await setDoc(docRef, {
            ...data,
            lastUpdated: Date.now()
        });

        // 2. Sync essential stats to root user document for Leaderboards & Profile Viewing
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, {
            xp: data.xp,
            level: data.level,
            streak: data.streak,
            badges: data.badges,
            totalChaptersRead: data.totalChaptersRead,
            totalWorksAdded: data.totalWorksAdded,
            totalWorksCompleted: data.totalWorksCompleted
        }, { merge: true });

        console.log('[Firestore] Gamification saved');
    } catch (error: any) {
        console.error('[Firestore] Error saving gamification:', error);
        if (error.code === 'permission-denied') {
            console.error('[Firestore] PERMISSION DENIED: Check your Firestore Security Rules in Firebase Console.');
        }
    }
}

// Load gamification data from Firestore
export async function loadGamificationFromFirestore(userId: string): Promise<Omit<GamificationData, 'lastUpdated'> | null> {
    try {
        const docRef = doc(db, 'users', userId, 'data', 'gamification');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const { lastUpdated, ...data } = docSnap.data() as GamificationData;
            console.log('[Firestore] Gamification loaded');
            return data;
        }
        return null; // No data in Firestore
    } catch (error) {
        console.error('[Firestore] Error loading gamification:', error);
        return null;
    }
}

// Sync local data to Firestore (for first-time sync)
export async function syncLocalDataToFirestore(
    userId: string,
    library: Work[],
    gamification: Omit<GamificationData, 'lastUpdated'>
): Promise<void> {
    // Check if user has data in Firestore
    const existingLibrary = await loadLibraryFromFirestore(userId);
    const existingGamification = await loadGamificationFromFirestore(userId);

    // If no Firestore data but local data exists, upload local data
    if (!existingLibrary && library.length > 0) {
        await saveLibraryToFirestore(userId, library);
        console.log('[Firestore] Uploaded local library to cloud');
    }

    if (!existingGamification && (gamification.level > 1 || gamification.totalWorksAdded > 0)) {
        await saveGamificationToFirestore(userId, gamification);
        console.log('[Firestore] Uploaded local gamification to cloud');
    }
}

// --- SOCIAL FEATURES ---

export interface Friend {
    uid: string;
    displayName: string;
    photoURL: string;
    status: 'pending' | 'accepted';
    direction?: 'incoming' | 'outgoing';
}

// Search user by email (for adding friends)
export async function searchUserByEmail(email: string): Promise<UserProfile | null> {
    try {
        const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('[Firestore] Error searching user:', error);
        return null;
    }
}

// Search user by exact display name
export async function searchUserByName(name: string): Promise<UserProfile | null> {
    try {
        const q = query(collection(db, 'users'), where('displayName', '==', name), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('[Firestore] Error searching user by name:', error);
        return null;
    }
}

// Get User Profile by UID
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('[Firestore] Error getting user profile:', error);
        return null;
    }
}

// Send Friend Request
export async function sendFriendRequest(currentUserId: string, currentUserData: { displayName: string, photoURL: string }, targetUser: UserProfile): Promise<void> {
    try {
        // 1. Add to current user's friends list as 'outgoing'
        const myFriendRef = doc(db, 'users', currentUserId, 'friends', targetUser.uid);
        await setDoc(myFriendRef, {
            uid: targetUser.uid,
            displayName: targetUser.displayName,
            photoURL: targetUser.photoURL,
            status: 'pending',
            direction: 'outgoing'
        });

        // 2. Add to target user's friends list as 'incoming'
        const theirFriendRef = doc(db, 'users', targetUser.uid, 'friends', currentUserId);
        await setDoc(theirFriendRef, {
            uid: currentUserId,
            displayName: currentUserData.displayName,
            photoURL: currentUserData.photoURL,
            status: 'pending',
            direction: 'incoming'
        });

        console.log('[Firestore] Friend request sent');
    } catch (error) {
        console.error('[Firestore] Error sending friend request:', error);
        throw error;
    }
}

// Accept Friend Request
export async function acceptFriendRequest(currentUserId: string, friendUid: string): Promise<void> {
    try {
        // Update my status
        await updateDoc(doc(db, 'users', currentUserId, 'friends', friendUid), {
            status: 'accepted'
        });

        // Update their status
        await updateDoc(doc(db, 'users', friendUid, 'friends', currentUserId), {
            status: 'accepted'
        });
        console.log('[Firestore] Friend request accepted');
    } catch (error) {
        console.error('[Firestore] Error accepting friend request:', error);
        throw error;
    }
}

// Reject/Remove Friend Request
export async function rejectFriendRequest(currentUserId: string, friendUid: string): Promise<void> {
    try {
        // Remove from my list
        await deleteDoc(doc(db, 'users', currentUserId, 'friends', friendUid));

        // Remove from their list
        await deleteDoc(doc(db, 'users', friendUid, 'friends', currentUserId));

        console.log('[Firestore] Friend request rejected/removed');
    } catch (error) {
        console.error('[Firestore] Error rejecting friend request:', error);
        throw error;
    }
}

// Get Friends List (Real-time listener could be better, but we use simple get for now)
export async function getFriends(userId: string): Promise<Friend[]> {
    try {
        const q = query(collection(db, 'users', userId, 'friends'));
        const querySnapshot = await getDocs(q);
        const friends: Friend[] = [];
        querySnapshot.forEach((doc) => {
            friends.push(doc.data() as Friend);
        });
        return friends;
    } catch (error) {
        console.error('[Firestore] Error loading friends:', error);
        return [];
    }
}

// Get Global Leaderboard
export async function getLeaderboard(limitCount: number = 10): Promise<UserProfile[]> {
    try {
        const q = query(
            collection(db, 'users'),
            orderBy('xp', 'desc'),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserProfile);
        });
        return users;
    } catch (error) {
        console.error('[Firestore] Error loading leaderboard:', error);
        return [];
    }
}

// ==================== ACTIVITY FEED FUNCTIONS ====================

// Log an activity event
export async function logActivity(_userId: string, event: Omit<ActivityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
        const activityRef = doc(collection(db, 'activities'));
        const activity: ActivityEvent = {
            ...event,
            id: activityRef.id,
            timestamp: Date.now()
        };
        await setDoc(activityRef, activity);
        console.log('[Firestore] Activity logged:', event.type);
    } catch (error) {
        console.error('[Firestore] Error logging activity:', error);
    }
}

// Get activities from friends
export async function getFriendsActivity(userId: string, limitCount: number = 20): Promise<ActivityEvent[]> {
    try {
        // First get friends list
        const friends = await getFriends(userId);
        const friendIds = friends.filter(f => f.status === 'accepted').map(f => f.uid);

        if (friendIds.length === 0) return [];

        // Get activities from friends (Firestore 'in' query limited to 10 items)
        const batchedIds = friendIds.slice(0, 10); // Take first 10 friends
        const q = query(
            collection(db, 'activities'),
            where('userId', 'in', batchedIds),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const activities: ActivityEvent[] = [];
        querySnapshot.forEach((doc) => {
            activities.push(doc.data() as ActivityEvent);
        });
        return activities;
    } catch (error) {
        console.error('[Firestore] Error loading friends activity:', error);
        return [];
    }
}

// ==================== LIBRARY COMPARISON ====================

// Get user's library (for comparison)
export async function getUserLibrary(userId: string): Promise<Work[]> {
    try {
        const docRef = doc(db, 'users', userId, 'data', 'library');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return (docSnap.data() as LibraryData).works;
        }
        return [];
    } catch (error) {
        console.error('[Firestore] Error loading user library:', error);
        return [];
    }
}

// Compare two users' libraries
export async function compareLibraries(userId1: string, userId2: string): Promise<{ common: Work[]; count: number }> {
    try {
        const [lib1, lib2] = await Promise.all([
            getUserLibrary(userId1),
            getUserLibrary(userId2)
        ]);

        const lib2Ids = new Set(lib2.map(w => w.id));
        const common = lib1.filter(w => lib2Ids.has(w.id));

        return { common, count: common.length };
    } catch (error) {
        console.error('[Firestore] Error comparing libraries:', error);
        return { common: [], count: 0 };
    }
}

// ==================== ENHANCED LEADERBOARD ====================

export type LeaderboardPeriod = 'week' | 'month' | 'all';
export type LeaderboardCategory = 'xp' | 'chapters' | 'streak';

// Get filtered leaderboard
export async function getFilteredLeaderboard(
    category: LeaderboardCategory = 'xp',
    _period: LeaderboardPeriod = 'all',
    limitCount: number = 10
): Promise<UserProfile[]> {
    try {
        // Map category to Firestore field
        const fieldMap: Record<LeaderboardCategory, string> = {
            'xp': 'xp',
            'chapters': 'totalChaptersRead',
            'streak': 'streak'
        };

        const field = fieldMap[category];

        const q = query(
            collection(db, 'users'),
            orderBy(field, 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserProfile);
        });
        return users;
    } catch (error) {
        console.error('[Firestore] Error loading filtered leaderboard:', error);
        return [];
    }
}

// ==================== COMMENTS SYSTEM ====================

// Add a comment to a work
export async function addComment(comment: Omit<Comment, 'id' | 'timestamp' | 'likes'>): Promise<string | null> {
    try {
        const commentRef = await addDoc(collection(db, 'comments'), {
            ...comment,
            timestamp: Date.now(),
            likes: []
        });
        console.log('[Firestore] Comment added:', commentRef.id);
        return commentRef.id;
    } catch (error) {
        console.error('[Firestore] Error adding comment:', error);
        return null;
    }
}

// Get comments for a work
export async function getComments(workId: number, limitCount: number = 50): Promise<Comment[]> {
    try {
        const q = query(
            collection(db, 'comments'),
            where('workId', '==', workId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const comments: Comment[] = [];
        querySnapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() } as Comment);
        });
        return comments;
    } catch (error) {
        console.error('[Firestore] Error loading comments:', error);
        return [];
    }
}

// Get comments organized with replies
export async function getCommentsWithReplies(workId: number): Promise<CommentWithReplies[]> {
    const allComments = await getComments(workId, 100);

    // Separate top-level comments and replies
    const topLevel = allComments.filter(c => !c.replyTo);
    const replies = allComments.filter(c => c.replyTo);

    // Attach replies to their parent comments
    const withReplies: CommentWithReplies[] = topLevel.map(comment => ({
        ...comment,
        replies: replies.filter(r => r.replyTo === comment.id).sort((a, b) => a.timestamp - b.timestamp)
    }));

    return withReplies;
}

// Like/unlike a comment
export async function toggleCommentLike(commentId: string, userId: string): Promise<void> {
    try {
        const commentRef = doc(db, 'comments', commentId);
        const commentSnap = await getDoc(commentRef);

        if (commentSnap.exists()) {
            const comment = commentSnap.data() as Comment;
            const likes = comment.likes || [];

            if (likes.includes(userId)) {
                await updateDoc(commentRef, { likes: likes.filter(id => id !== userId) });
            } else {
                await updateDoc(commentRef, { likes: [...likes, userId] });
            }
        }
    } catch (error) {
        console.error('[Firestore] Error toggling comment like:', error);
    }
}

// ==================== CHALLENGES SYSTEM ====================

// Create a new challenge
export async function createChallenge(challenge: Omit<Challenge, 'id'>): Promise<string | null> {
    try {
        const challengeRef = await addDoc(collection(db, 'challenges'), challenge);
        console.log('[Firestore] Challenge created:', challengeRef.id);
        return challengeRef.id;
    } catch (error) {
        console.error('[Firestore] Error creating challenge:', error);
        return null;
    }
}

// Get user's challenges
export async function getUserChallenges(userId: string): Promise<Challenge[]> {
    try {
        const q = query(
            collection(db, 'challenges'),
            where('participantIds', 'array-contains', userId)
        );

        const querySnapshot = await getDocs(q);
        const challenges: Challenge[] = [];
        querySnapshot.forEach((doc) => {
            challenges.push({ id: doc.id, ...doc.data() } as Challenge);
        });
        return challenges;
    } catch (error) {
        console.error('[Firestore] Error loading challenges:', error);
        return [];
    }
}

// Update challenge progress
export async function updateChallengeProgress(challengeId: string, participantId: string, progress: number): Promise<void> {
    try {
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeSnap = await getDoc(challengeRef);

        if (challengeSnap.exists()) {
            const challenge = challengeSnap.data() as Challenge;
            const participants = challenge.participants.map(p =>
                p.id === participantId ? { ...p, progress } : p
            );
            await updateDoc(challengeRef, { participants });
        }
    } catch (error) {
        console.error('[Firestore] Error updating challenge progress:', error);
    }
}

// ==================== FRIEND RECOMMENDATIONS ====================

// Get how many friends are reading a specific work
export async function getFriendsReadingWork(userId: string, workId: number): Promise<{ count: number; friends: UserProfile[] }> {
    try {
        const friends = await getFriends(userId);
        const acceptedFriends = friends.filter(f => f.status === 'accepted');

        const friendsReading: UserProfile[] = [];

        for (const friend of acceptedFriends.slice(0, 10)) {
            const library = await getUserLibrary(friend.uid);
            if (library.some(w => w.id === workId)) {
                const profile = await getUserProfile(friend.uid);
                if (profile) friendsReading.push(profile);
            }
        }

        return { count: friendsReading.length, friends: friendsReading };
    } catch (error) {
        console.error('[Firestore] Error getting friends reading work:', error);
        return { count: 0, friends: [] };
    }
}

// ==================== WATCH PARTY FUNCTIONS ====================

import type { WatchParty, PartyParticipant } from '@/types/watchparty';

// Create a watch party
export async function createWatchParty(party: Omit<WatchParty, 'id'>): Promise<string> {
    try {
        const partyRef = doc(collection(db, 'watchparties'));
        const partyData: WatchParty = {
            ...party,
            id: partyRef.id
        };
        await setDoc(partyRef, partyData);
        console.log('[Firestore] Watch party created:', partyData.id);
        return partyRef.id;
    } catch (error) {
        console.error('[Firestore] Error creating watch party:', error);
        throw error;
    }
}

// Get user's watch parties
export async function getUserWatchParties(userId: string): Promise<WatchParty[]> {
    try {
        // Get parties where user is host or participant
        const hostQuery = query(
            collection(db, 'watchparties'),
            where('hostId', '==', userId),
            orderBy('lastActivity', 'desc')
        );
        const hostSnap = await getDocs(hostQuery);

        const parties: WatchParty[] = hostSnap.docs.map(doc => doc.data() as WatchParty);

        // Also get parties where user is a participant (simplified - would need more complex query in production)
        const allParties = query(
            collection(db, 'watchparties'),
            where('status', '==', 'active'),
            orderBy('lastActivity', 'desc'),
            limit(50)
        );
        const allSnap = await getDocs(allParties);

        allSnap.docs.forEach(doc => {
            const party = doc.data() as WatchParty;
            if (party.participants.some(p => p.id === userId) && !parties.find(p => p.id === party.id)) {
                parties.push(party);
            }
        });

        return parties.sort((a, b) => b.lastActivity - a.lastActivity);
    } catch (error) {
        console.error('[Firestore] Error getting user watch parties:', error);
        return [];
    }
}

// Join a watch party
export async function joinWatchParty(partyId: string, participant: PartyParticipant): Promise<void> {
    try {
        const partyRef = doc(db, 'watchparties', partyId);
        const partySnap = await getDoc(partyRef);

        if (!partySnap.exists()) throw new Error('Party not found');

        const party = partySnap.data() as WatchParty;
        if (!party.participants.find(p => p.id === participant.id)) {
            await updateDoc(partyRef, {
                participants: [...party.participants, participant],
                lastActivity: Date.now()
            });
        }
        console.log('[Firestore] Joined watch party:', partyId);
    } catch (error) {
        console.error('[Firestore] Error joining watch party:', error);
        throw error;
    }
}

// Update party progress
export async function updateWatchPartyProgress(partyId: string, newEpisode: number): Promise<void> {
    try {
        await updateDoc(doc(db, 'watchparties', partyId), {
            currentEpisode: newEpisode,
            lastActivity: Date.now()
        });
    } catch (error) {
        console.error('[Firestore] Error updating party progress:', error);
    }
}

// ==================== CHALLENGE INVITATION SYSTEM ====================

// Accept challenge invitation
export async function acceptChallengeInvitation(challengeId: string, participantId: string): Promise<void> {
    try {
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeSnap = await getDoc(challengeRef);

        if (challengeSnap.exists()) {
            const challenge = challengeSnap.data() as Challenge;
            const participants = challenge.participants.map(p =>
                p.id === participantId ? { ...p, status: 'accepted' as const } : p
            );

            // Check if all participants have accepted
            const allAccepted = participants.every(p => p.status === 'accepted');

            await updateDoc(challengeRef, {
                participants,
                status: allAccepted ? 'active' : 'pending'
            });
            console.log('[Firestore] Challenge invitation accepted');
        }
    } catch (error) {
        console.error('[Firestore] Error accepting challenge:', error);
        throw error;
    }
}

// Decline challenge invitation
export async function declineChallengeInvitation(challengeId: string, participantId: string): Promise<void> {
    try {
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeSnap = await getDoc(challengeRef);

        if (challengeSnap.exists()) {
            const challenge = challengeSnap.data() as Challenge;
            const participants = challenge.participants.map(p =>
                p.id === participantId ? { ...p, status: 'declined' as const } : p
            );
            const participantIds = challenge.participantIds.filter(id => id !== participantId);

            await updateDoc(challengeRef, { participants, participantIds });
            console.log('[Firestore] Challenge invitation declined');
        }
    } catch (error) {
        console.error('[Firestore] Error declining challenge:', error);
        throw error;
    }
}

// Cancel/End a challenge (only creator can do this)
export async function cancelChallenge(challengeId: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'challenges', challengeId), {
            status: 'cancelled',
            endDate: Date.now()
        });
        console.log('[Firestore] Challenge cancelled');
    } catch (error) {
        console.error('[Firestore] Error cancelling challenge:', error);
        throw error;
    }
}

// Complete a challenge
export async function completeChallenge(challengeId: string, winnerId?: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'challenges', challengeId), {
            status: 'completed',
            endDate: Date.now(),
            winnerId: winnerId || null
        });
        console.log('[Firestore] Challenge completed');
    } catch (error) {
        console.error('[Firestore] Error completing challenge:', error);
        throw error;
    }
}

// ==================== WATCH PARTY CONTROLS ====================

// End a watch party (only host can do this)
export async function endWatchParty(partyId: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'watchparties', partyId), {
            status: 'completed',
            lastActivity: Date.now()
        });
        console.log('[Firestore] Watch party ended');
    } catch (error) {
        console.error('[Firestore] Error ending watch party:', error);
        throw error;
    }
}

// Leave a watch party (for participants)
export async function leaveWatchParty(partyId: string, participantId: string): Promise<void> {
    try {
        const partyRef = doc(db, 'watchparties', partyId);
        const partySnap = await getDoc(partyRef);

        if (partySnap.exists()) {
            const party = partySnap.data() as WatchParty;
            const participants = party.participants.filter(p => p.id !== participantId);

            await updateDoc(partyRef, {
                participants,
                lastActivity: Date.now()
            });
            console.log('[Firestore] Left watch party');
        }
    } catch (error) {
        console.error('[Firestore] Error leaving watch party:', error);
        throw error;
    }
}
// ==================== FEEDBACK SYSTEM ====================

export interface FeedbackData {
    rating: number; // 1-10
    category: 'bug' | 'feature' | 'general';
    message: string;
    userId?: string;
    userName?: string; // Optional if guest
    contactEmail?: string; // Optional for guests
    timestamp: number;
    userAgent: string;
}

export async function submitFeedback(feedback: Omit<FeedbackData, 'timestamp'>): Promise<boolean> {
    try {
        const feedbackRef = await addDoc(collection(db, 'feedback'), {
            ...feedback,
            timestamp: Date.now()
        });
        console.log('[Firestore] Feedback submitted:', feedbackRef.id);
        return true;
    } catch (error) {
        console.error('[Firestore] Error submitting feedback:', error);
        return false;
    }
}
