import { create } from 'zustand';
import { type Badge, MOCK_BADGES } from '@/types/badge';

interface GamificationState {
    level: number;
    xp: number;
    xpToNextLevel: number;
    streak: number;
    badges: Badge[];
    recentUnlock: Badge | null;

    addXp: (amount: number) => void;
    unlockBadge: (badgeId: string) => void;
    clearRecentUnlock: () => void;
}

const LEVEL_base = 100;
const LEVEL_MULTIPLIER = 1.5;

export const useGamificationStore = create<GamificationState>((set, get) => ({
    level: 1,
    xp: 0,
    xpToNextLevel: LEVEL_base,
    streak: 5,
    badges: [MOCK_BADGES[0]], // Initially have one badge
    recentUnlock: null,

    addXp: (amount) => {
        const { xp, xpToNextLevel, level } = get();
        let newXp = xp + amount;
        let newLevel = level;
        let newXpToNext = xpToNextLevel;

        // Level up logic
        if (newXp >= xpToNextLevel) {
            newXp = newXp - xpToNextLevel;
            newLevel++;
            newXpToNext = Math.floor(newXpToNext * LEVEL_MULTIPLIER);
        }

        set({ xp: newXp, level: newLevel, xpToNextLevel: newXpToNext });
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

    clearRecentUnlock: () => set({ recentUnlock: null })
}));
