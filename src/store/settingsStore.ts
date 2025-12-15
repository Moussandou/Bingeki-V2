import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'amoled';

interface SettingsState {
    theme: Theme;
    reducedMotion: boolean;
    soundEnabled: boolean;
    notifications: boolean;

    setTheme: (theme: Theme) => void;
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
            toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
        }),
        {
            name: 'bingeki-settings',
        }
    )
);
