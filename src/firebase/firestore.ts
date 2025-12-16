import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, limit, updateDoc } from 'firebase/firestore';
import { db } from './config';
import type { Work } from '@/store/libraryStore';
import type { Badge } from '@/types/badge';

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
    xp?: number;   // Added for leaderboard
    level?: number; // Added for leaderboard
    banner?: string;      // Custom profile banner
    bio?: string;         // Custom bio
    themeColor?: string;  // Custom theme color (accent)
    cardBgColor?: string; // Custom card background color
    borderColor?: string; // Custom border color
    favoriteManga?: string; // Optional: showcase a favorite work ID
    featuredBadge?: string; // Optional: badge ID to showcase
}

// Save user profile to Firestore
export async function saveUserProfileToFirestore(user: Partial<UserProfile>): Promise<void> {
    try {
        const docRef = doc(db, 'users', user.uid!);
        // Create a data object with only defined values to avoid overwriting with undefined
        const dataToSave: any = {
            uid: user.uid,
            lastLogin: Date.now()
        };

        if (user.email) dataToSave.email = user.email;
        if (user.displayName) dataToSave.displayName = user.displayName;
        if (user.photoURL) dataToSave.photoURL = user.photoURL;
        if (user.banner) dataToSave.banner = user.banner;
        if (user.bio) dataToSave.bio = user.bio;
        if (user.themeColor) dataToSave.themeColor = user.themeColor;
        if (user.cardBgColor) dataToSave.cardBgColor = user.cardBgColor;
        if (user.borderColor) dataToSave.borderColor = user.borderColor;
        if (user.favoriteManga) dataToSave.favoriteManga = user.favoriteManga;
        if (user.featuredBadge) dataToSave.featuredBadge = user.featuredBadge;

        await setDoc(docRef, dataToSave, { merge: true });
        console.log('[Firestore] User profile saved');
    } catch (error) {
        console.error('[Firestore] Error saving user profile:', error);
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

        // 2. Sync essential stats (XP, Level) to root user document for Leaderboards
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, {
            xp: data.xp,
            level: data.level
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
