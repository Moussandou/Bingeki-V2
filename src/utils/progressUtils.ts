import { useLibraryStore } from '@/store/libraryStore';
import { useGamificationStore, XP_REWARDS } from '@/store/gamificationStore';

/**
 * Handles progress updates with XP calculation (gain or loss) and boundary checks.
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
    const { addXp, recordActivity, incrementStat } = useGamificationStore.getState();

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

    // 4. XP Logic
    const diff = newProgress - oldProgress;

    if (diff > 0) {
        // Progressing: Add XP
        addXp(XP_REWARDS.UPDATE_PROGRESS * diff);
        for (let i = 0; i < diff; i++) {
            if (work.type === 'manga') {
                incrementStat('chapters');
            } else if (work.type === 'anime') {
                if (work.format === 'Movie') {
                    incrementStat('movies');
                } else {
                    incrementStat('episodes');
                }
            } else {
                // Default fallback
                incrementStat('chapters');
            }
        }
        recordActivity(); // Maintain streak

        // Check completion
        if (totalChapters && newProgress >= totalChapters) {
            updateStatus(workId, 'completed');
            incrementStat('completed');
            addXp(XP_REWARDS.COMPLETE_WORK);
        }
    } else {
        // Regressing: Remove XP (Penalty)
        // Note: addXp handles adding, so we pass negative amount.
        // We might want to cap deduction to not go below 0 total XP? 
        // For now, simple deduction.
        const penalty = XP_REWARDS.UPDATE_PROGRESS * Math.abs(diff);
        addXp(-penalty);
    }

    return true;
};
