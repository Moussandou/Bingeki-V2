import { create } from 'zustand';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAState {
    deferredPrompt: BeforeInstallPromptEvent | null;
    isInstalled: boolean;
    setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
    setIsInstalled: (isInstalled: boolean) => void;
    clearPrompt: () => void;
}

export const usePWAStore = create<PWAState>((set) => ({
    deferredPrompt: null,
    isInstalled: false,

    setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt, isInstalled: false }),
    setIsInstalled: (isInstalled) => set({ isInstalled }),
    clearPrompt: () => set({ deferredPrompt: null }),
}));
