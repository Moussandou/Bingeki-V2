import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'amoled';

interface SettingsState {
    theme: Theme;
    reducedMotion: boolean;
    soundEnabled: boolean;
    notifications: boolean;

    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    toggleReducedMotion: () => void;
    toggleSound: () => void;
    toggleNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'dark',
            reducedMotion: false,
            soundEnabled: true,
            notifications: true,

            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => {
                const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
                // We simplify to toggle between dark/light for the header button for now
                return { theme: nextTheme };
            }),
            toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
        }),
        {
            name: 'bingeki-settings',
        }
    )
);
