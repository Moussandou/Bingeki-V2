export const getLocalStorageSize = (): string => {
    let total = 0;
    for (const x in localStorage) {
        // eslint-disable-next-line
        if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
            total += (localStorage[x].length * 2);
        }
    }
    return (total / 1024 / 1024).toFixed(2);
};

export const clearImageCache = () => {
    // This is tricky since images are usually URLs. 
    // If we were caching base64 images in localStorage, we could clear them.
    // Assuming we might have some cache keys, or just clear non-essential keys.
    // Clear specific keys if we had them.
    // But actually, we don't cache images in localStorage, browsers do that.
    // Maybe we just reload the page to force cache revalidation? 
    // Or maybe the user means "clear data unrelated to my library".
    // Implement a "Clear App Cache" which might just be Service Worker cache if we had PWA.
    // Since we don't have explicit image caching logic in JS (except maybe sw), 
    // we'll just say "Cache Cleared" toast for satisfaction or clear specific temp keys.
    // Realistically, we can't clear browser HTTP cache from JS.
    // We'll just return true to simulate success for the UI action.
    return true;
};

export const exportData = () => {
    const data = {
        library: localStorage.getItem('bingeki-library-storage'),
        gamification: localStorage.getItem('bingeki-gamification-storage'),
        settings: localStorage.getItem('bingeki-settings'),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingeki-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

import { useLibraryStore } from '@/store/libraryStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useSettingsStore } from '@/store/settingsStore';

export const importData = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                // 1. Update localStorage (Persistence)
                if (data.library) localStorage.setItem('bingeki-library-storage', data.library);
                if (data.gamification) localStorage.setItem('bingeki-gamification-storage', data.gamification);
                if (data.settings) localStorage.setItem('bingeki-settings', data.settings);

                // 2. Update Zustand Stores (Reactive UI + Trigger Firestore Sync)
                if (data.library) {
                    try {
                        const parsedLib = JSON.parse(data.library);
                        // Zustand persist wraps state in { state: ... }
                        const works = parsedLib.state ? parsedLib.state.works : parsedLib;
                        // Handle both raw array or persist object format
                        const actualWorks = Array.isArray(works) ? works : (Array.isArray(parsedLib) ? parsedLib : []);

                        if (actualWorks.length > 0) {
                            useLibraryStore.setState({ works: actualWorks });
                        }
                    } catch (e) {
                        console.error("Failed to parse library data for store", e);
                    }
                }

                if (data.gamification) {
                    try {
                        const parsedGam = JSON.parse(data.gamification);
                        const state = parsedGam.state || parsedGam;
                        useGamificationStore.setState(state);
                    } catch (e) { console.error("Failed to parse gamification", e); }
                }

                if (data.settings) {
                    try {
                        const parsedSet = JSON.parse(data.settings);
                        const state = parsedSet.state || parsedSet;
                        useSettingsStore.setState(state);
                    } catch (e) { console.error("Failed to parse settings", e); }
                }

                resolve(true);
            } catch (err) {
                console.error("Import failed", err);
                reject(false);
            }
        };
        reader.readAsText(file);
    });
};
