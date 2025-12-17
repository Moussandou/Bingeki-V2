// Challenge Types for Friend Challenges

export interface Challenge {
    id: string;
    title: string;
    type: 'race_to_finish' | 'most_chapters' | 'streak_battle';
    workId?: number;
    workTitle?: string;
    workImage?: string;
    participants: ChallengeParticipant[];
    startDate: number;
    endDate?: number;
    status: 'pending' | 'active' | 'completed';
    createdBy: string;
    winnerId?: string;
}

export interface ChallengeParticipant {
    id: string;
    name: string;
    photo: string;
    progress: number;
    joinedAt: number;
}

// Challenge type labels in French
export const CHALLENGE_LABELS: Record<Challenge['type'], string> = {
    'race_to_finish': 'Course à la fin',
    'most_chapters': 'Plus de chapitres',
    'streak_battle': 'Battle de Streak',
};
