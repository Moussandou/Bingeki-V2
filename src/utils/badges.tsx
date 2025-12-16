import {
    Award, BookOpen, CheckCircle, Library, Trophy, Flame, 
    Flag, Book, Zap, Layers, Database, Timer, CalendarCheck, Crown, Target, Star, Medal
} from 'lucide-react';
import React from 'react';

export const BADGE_ICONS: Record<string, React.ReactNode> = {
    'flag': <Flag size={32} />,
    'book': <Book size={32} />,
    'book-open': <BookOpen size={32} />,
    'flame': <Flame size={32} />,
    'zap': <Zap size={32} />,
    'library': <Library size={32} />,
    'layers': <Layers size={32} />,
    'database': <Database size={32} />,
    'timer': <Timer size={32} />,
    'calendar-check': <CalendarCheck size={32} />,
    'crown': <Crown size={32} />,
    'check-circle': <CheckCircle size={32} />,
    'target': <Target size={32} />,
    'star': <Star size={32} />,
    'medal': <Medal size={32} />,
    'award': <Award size={32} />,
    'trophy': <Trophy size={32} />,
};
