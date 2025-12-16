import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
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
        const docRef = doc(db, 'users', userId, 'data', 'gamification');
        await setDoc(docRef, {
            ...data,
            lastUpdated: Date.now()
        });
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
