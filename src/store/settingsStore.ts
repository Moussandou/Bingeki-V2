import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface SettingsState {
    theme: Theme;
    reducedMotion: boolean;
    soundEnabled: boolean;
    notifications: boolean;

    streamingUrlPattern: string;
    spoilerMode: boolean;
    nsfwMode: boolean;
    accentColor: string;

    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    toggleReducedMotion: () => void;
    toggleSound: () => void;
    toggleNotifications: () => void;
    setStreamingUrlPattern: (pattern: string) => void;
    toggleSpoilerMode: () => void;
    toggleNsfwMode: () => void;
    setAccentColor: (color: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'dark',
            reducedMotion: false,
            soundEnabled: true,
            notifications: true,

            streamingUrlPattern: 'https://www.google.com/search?q={title}+episode+{number}+streaming', // Default
            setStreamingUrlPattern: (pattern) => set({ streamingUrlPattern: pattern }),

            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => {
                const nextTheme = state.theme === 'light' ? 'dark' : 'light';
                return { theme: nextTheme };
            }),
            toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
            spoilerMode: false,
            toggleSpoilerMode: () => set((state) => ({ spoilerMode: !state.spoilerMode })),
            nsfwMode: false,
            toggleNsfwMode: () => set((state) => ({ nsfwMode: !state.nsfwMode })),
            accentColor: '#FF2E63',
            setAccentColor: (color) => set({ accentColor: color }),
        }),
        {
            name: 'bingeki-settings',
        }
    )
);
