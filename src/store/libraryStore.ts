import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FavoriteCharacter } from '@/types/character';

export interface Work {
    id: number | string;
    title: string;
    image: string;
    type: 'manga' | 'anime';
    format?: string; // TV, Movie, OVA, Manga, Novel, etc.
    totalChapters?: number | null;
    currentChapter?: number;
    status: 'reading' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_read';
    score?: number;
    synopsis?: string; // Add synopsis field
    rating?: number; // User personal rating (0-10)
    notes?: string;  // User personal notes
    lastUpdated?: number; // Timestamp of last progress update
    dateAdded?: number; // Timestamp of creation
    collections?: string[]; // E.g., "Favorites", "Must Read"
}

interface LibraryState {
    works: Work[];
    favoriteCharacters: FavoriteCharacter[];
    addWork: (work: Work) => void;
    addFavoriteCharacter: (character: FavoriteCharacter) => void;
    removeFavoriteCharacter: (id: number) => void;
    removeWork: (id: number | string) => void;
    updateProgress: (id: number | string, progress: number) => void;
    updateStatus: (id: number | string, status: Work['status']) => void;
    updateWorkDetails: (id: number | string, details: Partial<Work>) => void;
    getWork: (id: number | string) => Work | undefined;
    isFavoriteCharacter: (id: number) => boolean;
    resetStore: () => void;
}

export const useLibraryStore = create<LibraryState>()(
    persist(
        (set, get) => ({
            works: [],
            favoriteCharacters: [],
            addFavoriteCharacter: (character) => set((state) => {
                if (state.favoriteCharacters.some((c) => c.id === character.id)) return state;
                return { favoriteCharacters: [...state.favoriteCharacters, character] };
            }),
            removeFavoriteCharacter: (id) => set((state) => ({
                favoriteCharacters: state.favoriteCharacters.filter((c) => c.id !== id)
            })),
            addWork: (work) => set((state) => {
                if (state.works.some((w) => w.id === work.id)) return state;
                return {
                    works: [...state.works, {
                        ...work,
                        dateAdded: Date.now(),
                        lastUpdated: Date.now(),
                        collections: []
                    }]
                };
            }),
            removeWork: (id) => set((state) => ({
                works: state.works.filter((w) => w.id !== id),
            })),
            updateProgress: (id, progress) => set((state) => ({
                works: state.works.map((w) =>
                    w.id === id ? { ...w, currentChapter: progress, lastUpdated: Date.now() } : w
                ),
            })),
            updateStatus: (id, status) => set((state) => ({
                works: state.works.map((w) =>
                    w.id === id ? { ...w, status } : w
                ),
            })),
            updateWorkDetails: (id, details) => set((state) => ({
                works: state.works.map((w) =>
                    w.id === id ? { ...w, ...details } : w
                ),
            })),
            getWork: (id) => get().works.find((w) => w.id === id),
            isFavoriteCharacter: (id: number) => get().favoriteCharacters.some((c) => c.id === id),
            resetStore: () => set({ works: [], favoriteCharacters: [] }),
        }),
        {
            name: 'bingeki-library-storage',
        }
    )
);
