export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: number; // Timestamp
}

export const MOCK_BADGES: Badge[] = [
    // Starter badges
    { id: 'first_steps', name: 'Premiers Pas', description: 'Créer un compte Bingeki', icon: '🌱', rarity: 'common' },
    { id: 'first_work', name: 'Bibliophile', description: 'Ajouter votre première œuvre', icon: '📖', rarity: 'common' },

    // Progress badges
    { id: 'reader_5', name: 'Lecteur Assidu', description: 'Lire 5 chapitres', icon: '📚', rarity: 'common' },
    { id: 'reader_25', name: 'Dévoreur', description: 'Lire 25 chapitres', icon: '🔥', rarity: 'rare' },
    { id: 'reader_100', name: 'Binge Reader', description: 'Lire 100 chapitres', icon: '⚡', rarity: 'epic' },

    // Collection badges
    { id: 'collector_5', name: 'Collectionneur', description: 'Ajouter 5 œuvres', icon: '📕', rarity: 'common' },
    { id: 'collector_10', name: 'Amateur', description: 'Ajouter 10 œuvres', icon: '📗', rarity: 'rare' },
    { id: 'collector_25', name: 'Otaku', description: 'Ajouter 25 œuvres', icon: '📘', rarity: 'epic' },

    // Streak badges
    { id: 'streak_3', name: 'Régulier', description: 'Maintenir un streak de 3 jours', icon: '🔥', rarity: 'common' },
    { id: 'streak_7', name: 'Motivé', description: 'Maintenir un streak de 7 jours', icon: '💪', rarity: 'rare' },
    { id: 'streak_30', name: 'Inarrêtable', description: 'Maintenir un streak de 30 jours', icon: '🏆', rarity: 'legendary' },

    // Completion badges
    { id: 'first_complete', name: 'Finisher', description: 'Terminer votre première œuvre', icon: '✅', rarity: 'common' },
    { id: 'complete_5', name: 'Complétiste', description: 'Terminer 5 œuvres', icon: '🎯', rarity: 'rare' },

    // Level badges
    { id: 'level_5', name: 'Novice', description: 'Atteindre le niveau 5', icon: '⭐', rarity: 'common' },
    { id: 'level_10', name: 'Apprenti', description: 'Atteindre le niveau 10', icon: '🌟', rarity: 'rare' },
    { id: 'level_25', name: 'Expert', description: 'Atteindre le niveau 25', icon: '💫', rarity: 'epic' },
    { id: 'level_50', name: 'Légende', description: 'Atteindre le niveau 50', icon: '👑', rarity: 'legendary' },
];

