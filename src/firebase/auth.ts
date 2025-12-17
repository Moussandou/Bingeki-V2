import { auth } from './config';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    type User
} from 'firebase/auth';
import { saveLibraryToFirestore, saveGamificationToFirestore } from './firestore';
import { useLibraryStore } from '@/store/libraryStore';
import { useGamificationStore } from '@/store/gamificationStore';

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error logging in with Google", error);
        return null;
    }
};

export const loginWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error: any) {
        console.error("Error logging in with email", error);
        let errorMessage = "Une erreur est survenue";
        if (error.code === 'auth/user-not-found') errorMessage = "Aucun compte trouvé avec cet email";
        else if (error.code === 'auth/wrong-password') errorMessage = "Mot de passe incorrect";
        else if (error.code === 'auth/invalid-email') errorMessage = "Email invalide";
        else if (error.code === 'auth/invalid-credential') errorMessage = "Email ou mot de passe incorrect";
        return { user: null, error: errorMessage };
    }
};

export const registerWithEmail = async (email: string, password: string, displayName: string): Promise<{ user: User | null; error: string | null }> => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update the user's display name
        if (result.user && displayName) {
            await updateProfile(result.user, { displayName });
        }
        return { user: result.user, error: null };
    } catch (error: any) {
        console.error("Error registering with email", error);
        let errorMessage = "Une erreur est survenue";
        if (error.code === 'auth/email-already-in-use') errorMessage = "Cet email est déjà utilisé";
        else if (error.code === 'auth/weak-password') errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
        else if (error.code === 'auth/invalid-email') errorMessage = "Email invalide";
        return { user: null, error: errorMessage };
    }
};

export const logout = async (): Promise<void> => {
    try {
        // Sync data to Firestore before logging out
        const currentUser = auth.currentUser;
        if (currentUser) {
            const libraryState = useLibraryStore.getState();
            const gamificationState = useGamificationStore.getState();

            // Save current data to cloud
            await saveLibraryToFirestore(currentUser.uid, libraryState.works);
            await saveGamificationToFirestore(currentUser.uid, {
                level: gamificationState.level,
                xp: gamificationState.xp,
                xpToNextLevel: gamificationState.xpToNextLevel,
                streak: gamificationState.streak,
                lastActivityDate: gamificationState.lastActivityDate,
                badges: gamificationState.badges,
                totalChaptersRead: gamificationState.totalChaptersRead,
                totalWorksAdded: gamificationState.totalWorksAdded,
                totalWorksCompleted: gamificationState.totalWorksCompleted
            });

            console.log("Data synced before logout");
        }

        await signOut(auth);
    } catch (error) {
        console.error("Error logging out", error);
    }
};
