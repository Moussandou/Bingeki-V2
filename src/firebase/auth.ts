import { auth } from './config';
import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';

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
