import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Work {
    id: number | string;
    title: string;
    image: string;
    type: 'manga' | 'anime';
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
    addWork: (work: Work) => void;
    removeWork: (id: number | string) => void;
    updateProgress: (id: number | string, progress: number) => void;
    updateStatus: (id: number | string, status: Work['status']) => void;
    updateWorkDetails: (id: number | string, details: Partial<Work>) => void;
    getWork: (id: number | string) => Work | undefined;
}

export const useLibraryStore = create<LibraryState>()(
    persist(
        (set, get) => ({
            works: [],
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
        }),
        {
            name: 'bingeki-library-storage',
        }
    )
);
