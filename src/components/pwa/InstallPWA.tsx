
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPWAProps {
    className?: string;
    style?: React.CSSProperties;
    variant?: 'icon' | 'full' | 'footer' | 'landing';
}

export function InstallPWA({ variant = 'icon', className, style }: InstallPWAProps) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            if (variant === 'footer') {
                alert("Pour installer l'app : \nSur Chrome : Clic sur l'icône dans la barre d'adresse.\nSur iOS : Partager > Sur l'écran d'accueil.");
            }
            return;
        }

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible && variant !== 'footer' && variant !== 'landing') return null;

    if (variant === 'full') {
        return (
            <Button onClick={handleInstallClick} variant="primary" icon={<Download size={18} />} className={className} style={style}>
                {t('pwa.install_app')}
            </Button>
        );
    }

    if (variant === 'landing') {
        return (
            <button
                onClick={handleInstallClick}
                className={className}
                style={{
                    marginTop: '2rem',
                    background: 'var(--color-primary)',
                    color: '#000',
                    border: '3px solid #000',
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    boxShadow: '6px 6px 0 #000',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                    ...style
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                    e.currentTarget.style.boxShadow = '8px 8px 0 #000';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '6px 6px 0 #000';
                }}
            >
                <Download size={24} strokeWidth={3} />
                {t('pwa.install_app_promo') || "INSTALLER L'APP"}
            </button>
        );
    }

    if (variant === 'footer') {
        return (
            <button
                onClick={handleInstallClick}
                className={className} // Allows hover effects from parent
                style={{
                    color: 'var(--color-text)',
                    padding: '0.5rem 1rem',
                    border: '2px solid var(--color-text)',
                    borderRadius: '20px',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-heading)',
                    ...style
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={t('pwa.install_app')}
            >
                <Download size={18} />
                <span>APP MOBILE</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleInstallClick}
            className={className}
            style={{
                background: 'transparent',
                border: '2px solid var(--color-primary)',
                color: 'var(--color-primary)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem',
                ...style
            }}
            title={t('pwa.install_app')}
        >
            <Download size={20} />
        </button>
    );
}
