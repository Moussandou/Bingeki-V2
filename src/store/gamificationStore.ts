import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Badge, MOCK_BADGES } from '@/types/badge';
import { type Work } from './libraryStore';

interface GamificationState {
    level: number;
    xp: number;
    xpToNextLevel: number;
    streak: number;
    lastActivityDate: string | null;
    badges: Badge[];
    recentUnlock: Badge | null;

    // Stats for badge tracking
    totalChaptersRead: number;
    totalAnimeEpisodesWatched: number;
    totalMoviesWatched: number;
    totalWorksAdded: number;
    totalWorksCompleted: number;

    addXp: (amount: number) => void;
    recordActivity: () => void;
    unlockBadge: (badgeId: string) => void;
    clearRecentUnlock: () => void;
    incrementStat: (stat: 'chapters' | 'episodes' | 'movies' | 'works' | 'completed') => void;
    checkBadges: () => void;
    resetStore: () => void;
    recalculateStats: (works: Work[]) => void;
}

const LEVEL_BASE = 100;
const LEVEL_MULTIPLIER = 1.5;
const MAX_LEVEL = 100;

// XP Rewards
export const XP_REWARDS = {
    ADD_WORK: 15,
    UPDATE_PROGRESS: 10,
    COMPLETE_WORK: 50,
    DAILY_LOGIN: 5,
};

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            level: 1,
            xp: 0,
            xpToNextLevel: LEVEL_BASE,
            streak: 0,
            lastActivityDate: null,
            badges: [],
            recentUnlock: null,
            totalChaptersRead: 0,
            totalAnimeEpisodesWatched: 0,
            totalMoviesWatched: 0,
            totalWorksAdded: 0,
            totalWorksCompleted: 0,

            addXp: (amount) => {
                const { xp, xpToNextLevel, level } = get();

                // If already at max level, we can still add XP for fun, but no leveling up
                let newXp = Math.max(0, xp + amount);
                let newLevel = level;
                let newXpToNext = xpToNextLevel;

                // Level up logic
                while (newXp >= newXpToNext && newLevel < MAX_LEVEL) {
                    newXp = newXp - newXpToNext;
                    newLevel++;
                    newXpToNext = Math.floor(newXpToNext * LEVEL_MULTIPLIER);
                }

                set({ xp: newXp, level: newLevel, xpToNextLevel: newXpToNext });
            },

            recordActivity: () => {
                const { lastActivityDate, streak, addXp } = get();
                const today = getTodayString();

                if (lastActivityDate === today) {
                    // Already recorded today, do nothing for streak
                    return;
                }

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toISOString().split('T')[0];

                let newStreak = 1;
                if (lastActivityDate === yesterdayString) {
                    // Consecutive day!
                    newStreak = streak + 1;
                }

                set({ streak: newStreak, lastActivityDate: today });

                // Bonus XP for maintaining streak
                if (newStreak > 1) {
                    addXp(XP_REWARDS.DAILY_LOGIN);
                }
            },

            unlockBadge: (badgeId) => {
                const { badges } = get();
                if (badges.find(b => b.id === badgeId)) return; // Already unlocked

                const badge = MOCK_BADGES.find(b => b.id === badgeId);
                if (badge) {
                    set({
                        badges: [...badges, { ...badge, unlockedAt: Date.now() }],
                        recentUnlock: badge
                    });
                }
            },

            clearRecentUnlock: () => set({ recentUnlock: null }),

            incrementStat: (stat) => {
                const { totalChaptersRead, totalAnimeEpisodesWatched, totalMoviesWatched, totalWorksAdded, totalWorksCompleted, checkBadges } = get();

                if (stat === 'chapters') {
                    set({ totalChaptersRead: totalChaptersRead + 1 });
                } else if (stat === 'episodes') {
                    set({ totalAnimeEpisodesWatched: totalAnimeEpisodesWatched + 1 });
                } else if (stat === 'movies') {
                    set({ totalMoviesWatched: totalMoviesWatched + 1 });
                } else if (stat === 'works') {
                    set({ totalWorksAdded: totalWorksAdded + 1 });
                } else if (stat === 'completed') {
                    set({ totalWorksCompleted: totalWorksCompleted + 1 });
                }

                checkBadges();
            },

            checkBadges: () => {
                const { level, streak, totalChaptersRead, totalWorksAdded, totalWorksCompleted, unlockBadge } = get();

                // First work badge
                if (totalWorksAdded >= 1) unlockBadge('first_work');

                // Collection badges
                if (totalWorksAdded >= 5) unlockBadge('collector_5');
                if (totalWorksAdded >= 10) unlockBadge('collector_10');
                if (totalWorksAdded >= 25) unlockBadge('collector_25');

                // Reader badges
                if (totalChaptersRead >= 5) unlockBadge('reader_5');
                if (totalChaptersRead >= 25) unlockBadge('reader_25');
                if (totalChaptersRead >= 100) unlockBadge('reader_100');

                // Streak badges
                if (streak >= 3) unlockBadge('streak_3');
                if (streak >= 7) unlockBadge('streak_7');
                if (streak >= 30) unlockBadge('streak_30');

                // Completion badges
                if (totalWorksCompleted >= 1) unlockBadge('first_complete');
                if (totalWorksCompleted >= 5) unlockBadge('complete_5');

                // Level badges
                if (level >= 5) unlockBadge('level_5');
                if (level >= 10) unlockBadge('level_10');
                if (level >= 25) unlockBadge('level_25');
                if (level >= 50) unlockBadge('level_50');
            },

            resetStore: () => set({
                level: 1,
                xp: 0,
                xpToNextLevel: LEVEL_BASE,
                streak: 0,
                lastActivityDate: null,
                badges: [],
                recentUnlock: null,
                totalChaptersRead: 0,
                totalAnimeEpisodesWatched: 0,
                totalWorksAdded: 0,
                totalWorksCompleted: 0
            }),

            recalculateStats: (works) => {
                let chapters = 0;
                let episodes = 0;
                let movies = 0;
                const worksAdded = works.length;
                let worksCompleted = 0;

                works.forEach(w => {
                    const progress = w.currentChapter || 0;
                    const type = w.type ? w.type.toLowerCase() : 'manga';

                    if (type === 'manga') {
                        chapters += progress;
                    } else if (type === 'anime') {
                        if (w.format === 'Movie') {
                            // Movies are usually 1 unit, but progress tracks it
                            movies += progress;
                        } else {
                            episodes += progress;
                        }
                    } else {
                        chapters += progress;
                    }

                    if (w.status === 'completed') worksCompleted++;
                });

                set({
                    totalChaptersRead: chapters,
                    totalAnimeEpisodesWatched: episodes,
                    totalMoviesWatched: movies,
                    totalWorksAdded: worksAdded,
                    totalWorksCompleted: worksCompleted
                });
            }
        }),
        {
            name: 'bingeki-gamification-storage',
        }
    )
);
