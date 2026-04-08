import { logger } from '@/utils/logger';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './config';

/**
 * Uploads an image for a feedback ticket.
 * @param feedbackId The ID of the feedback/ticket
 * @param file The file to upload
 * @returns The download URL of the uploaded image
 */
export async function uploadFeedbackImage(feedbackId: string, file: File): Promise<string> {
    const timestamp = Date.now();
    const storageRef = ref(storage, `feedback-attachments/${feedbackId}/${timestamp}_${file.name}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        logger.error('[Storage] Error uploading feedback image:', error);
        throw error;
    }
}

/**
 * Deletes all attachments associated with a feedback ID.
 * @param feedbackId The ID of the feedback/ticket
 */
export async function deleteFeedbackImages(feedbackId: string): Promise<void> {
    const folderRef = ref(storage, `feedback-attachments/${feedbackId}`);

    try {
        const res = await listAll(folderRef);
        const deletePromises = res.items.map((itemRef) => deleteObject(itemRef));
        await Promise.all(deletePromises);
        logger.log(`[Storage] Cleaned up attachments for feedback: ${feedbackId}`);
    } catch (error) {
        logger.error('[Storage] Error deleting feedback images:', error);
        throw error;
    }
}

/**
 * Deletes all files in a user-specific storage folder.
 * Used during account deletion.
 * @param userId The UID of the user
 */
export async function deleteUserStorage(userId: string): Promise<void> {
    const folders = [`avatars/${userId}`, `users/${userId}`];

    for (const folderPath of folders) {
        try {
            await deleteFolderRecursive(folderPath);
            logger.log(`[Storage] Cleaned up folder: ${folderPath}`);
        } catch (error) {
            // Log but don't fail the whole process if a folder doesn't exist
            logger.warn(`[Storage] Skip/Error cleaning up folder ${folderPath}:`, error);
        }
    }
}

async function deleteFolderRecursive(folderPath: string): Promise<void> {
    const folderRef = ref(storage, folderPath);
    const res = await listAll(folderRef);

    // Delete all files in this folder
    const fileDeletions = res.items.map((itemRef) => deleteObject(itemRef));
    await Promise.all(fileDeletions);

    // Recursively delete subfolders
    const folderDeletions = res.prefixes.map((prefixRef) => deleteFolderRecursive(prefixRef.fullPath));
    await Promise.all(folderDeletions);
}
