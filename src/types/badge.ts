export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: number; // Timestamp
}

export const MOCK_BADGES: Badge[] = [
    { id: '1', name: 'Premiers Pas', description: 'Créer un compte Bingeki', icon: '🌱', rarity: 'common' },
    { id: '2', name: 'Binge Watcher', description: 'Regarder 10 épisodes d\'affilée', icon: '📺', rarity: 'rare' },
    { id: '3', name: 'Collectionneur', description: 'Ajouter 50 œuvres à la bibliothèque', icon: '📚', rarity: 'epic' },
    { id: '4', name: 'Légende', description: 'Atteindre le niveau 50', icon: '👑', rarity: 'legendary' },
];
