import { useLibraryStore } from '@/store/libraryStore';
import { useGamificationStore } from '@/store/gamificationStore';

/**
 * Handles progress updates and recalculates XP deterministically.
 * @param workId ID of the work
 * @param newProgress New chapter/episode number
 * @param totalChapters Total chapters/episodes (optional)
 * @returns boolean indicating if update was successful
 */
export const handleProgressUpdateWithXP = (
    workId: number | string,
    newProgress: number,
    totalChapters?: number | null
) => {
    const { getWork, updateProgress, updateStatus } = useLibraryStore.getState();
    const { recordActivity, recalculateStats } = useGamificationStore.getState();

    const work = getWork(workId);
    if (!work) return false;

    // 1. Validation: Don't allow negative
    if (newProgress < 0) return false;

    // 2. Validation: Don't allow exceeding total if known
    if (totalChapters && newProgress > totalChapters) {
        newProgress = totalChapters;
    }

    const oldProgress = work.currentChapter || 0;

    // Nothing changed
    if (newProgress === oldProgress) return false;

    // 3. Update Library Progress
    updateProgress(workId, newProgress);

    // Check completion logic BEFORE recalculating stats
    if (newProgress > oldProgress && totalChapters && newProgress >= totalChapters) {
        updateStatus(workId, 'completed');
    }

    // 4. XP and Stats Logic (Deterministic recalculation)
    recordActivity(); // Maintain streak if this is a manual user action
    
    // Get the fresh works array after the updateProgress and updateStatus calls
    const updatedWorks = useLibraryStore.getState().works;
    recalculateStats(updatedWorks);

    return true;
};
