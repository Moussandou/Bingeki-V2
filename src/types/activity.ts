// Activity Event Types for Social Feed

export interface ActivityEvent {
    id: string;
    userId: string;
    userName: string;
    userPhoto: string;
    type: 'watch' | 'read' | 'complete' | 'add_work' | 'level_up' | 'badge';
    workId?: number;
    workTitle?: string;
    workImage?: string;
    episodeNumber?: number;
    badgeName?: string;
    newLevel?: number;
    timestamp: number;
}

// Activity type labels in French
export const ACTIVITY_LABELS: Record<ActivityEvent['type'], string> = {
    'watch': 'a regardé',
    'read': 'a lu',
    'complete': 'a terminé',
    'add_work': 'a ajouté',
    'level_up': 'est passé au niveau',
    'badge': 'a débloqué le badge',
};

// Activity type emojis
export const ACTIVITY_EMOJIS: Record<ActivityEvent['type'], string> = {
    'watch': '🎬',
    'read': '📚',
    'complete': '🏆',
    'add_work': '➕',
    'level_up': '⬆️',
    'badge': '🏅',
};
