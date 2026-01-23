import { Layout } from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useSettingsStore } from '@/store/settingsStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Trash2, Palette, HardDrive, Download, Upload, Info, Github, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { getWorkDetails } from '@/services/animeApi';
import { RefreshCw } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { useToast } from '@/context/ToastContext';
import { getLocalStorageSize, exportData, importData, clearImageCache } from '@/utils/storageUtils';
import { useAuthStore } from '@/store/authStore';
import { saveLibraryToFirestore, saveGamificationToFirestore, deleteUserData } from '@/firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { NotificationTester } from '@/components/debug/NotificationTester';
import { MALImportModal } from '@/components/library/MALImportModal';

function SyncButton() {
    const { t } = useTranslation();
    // ... existing SyncButton code ...
    const { works, updateWorkDetails } = useLibraryStore();

    const { addToast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleSync = async () => {
        if (works.length === 0) {
            addToast(t('settings.sync.no_works'), 'info');
            return;
        }

        setIsSyncing(true);
        setProgress(0);
        let updatedCount = 0;

        try {
            for (let i = 0; i < works.length; i++) {
                const work = works[i];
                try {
                    const details = await getWorkDetails(Number(work.id), work.type);
                    if (details) {
                        updateWorkDetails(work.id, {
                            score: details.score || undefined,
                            synopsis: details.synopsis || undefined,
                            image: details.images.jpg.image_url,
                            totalChapters: work.type === 'manga' ? details.chapters : details.episodes,
                        });
                        updatedCount++;
                    }
                } catch {
                    // Ignore error
                }
                setProgress(Math.round(((i + 1) / works.length) * 100));
            }
            addToast(t('settings.sync.complete', { count: updatedCount }), 'success');
        } catch (error) {
            addToast(t('settings.sync.error'), 'error');
            console.error(error);
        } finally {
            setIsSyncing(false);
            setProgress(0);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            style={{
                borderColor: 'var(--color-border-heavy)',
                color: 'var(--color-text)',
                minWidth: '130px'
            }}
        >
            {isSyncing ? (
                <>
                    <RefreshCw size={16} className="animate-spin" /> {progress}%
                </>
            ) : (
                <>
                    <RefreshCw size={16} /> {t('settings.sync.button')}
                </>
            )}
        </Button>
    );
}

function RecalculateButton() {
    const { t } = useTranslation();
    const { works } = useLibraryStore();
    const { recalculateStats } = useGamificationStore();
    const { addToast } = useToast();
    const [isCalculating, setIsCalculating] = useState(false);
    const { user } = useAuthStore();

    const handleRecalculate = async () => {
        setIsCalculating(true);
        try {
            recalculateStats(works);

            // Force save to Firestore if user is logged in
            if (user) {
                const { level, xp, xpToNextLevel, streak, lastActivityDate, badges, totalChaptersRead, totalAnimeEpisodesWatched, totalMoviesWatched, totalWorksAdded, totalWorksCompleted } = useGamificationStore.getState();
                await saveGamificationToFirestore(user.uid, {
                    level, xp, xpToNextLevel, streak, lastActivityDate, badges,
                    totalChaptersRead, totalAnimeEpisodesWatched, totalMoviesWatched, totalWorksAdded, totalWorksCompleted
                });
            }

            addToast(t('settings.data.recalculate_success'), 'success');
        } catch (error) {
            console.error(error);
            addToast(t('settings.data.recalculate_error'), 'error');
        } finally {
            setTimeout(() => setIsCalculating(false), 500);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={isCalculating}
            style={{
                borderColor: 'var(--color-border-heavy)',
                color: 'var(--color-text)',
                minWidth: '130px'
            }}
        >
            {isCalculating ? (
                <>
                    <RefreshCw size={16} className="animate-spin" /> ...
                </>
            ) : (
                <>
                    <RefreshCw size={16} /> {t('settings.data.recalculate_button')}
                </>
            )}
        </Button>
    );
}

export default function Settings() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [storageSize] = useState(() => getLocalStorageSize());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuthStore();

    const {
        reducedMotion,
        soundEnabled,
        notifications,
        spoilerMode,
        accentColor,
        toggleReducedMotion,
        toggleSound,
        toggleNotifications,
        toggleSpoilerMode,
        setAccentColor
    } = useSettingsStore();



    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const resetAll = async () => {
        try {
            // Reset Zustand stores
            useLibraryStore.getState().resetStore();
            useGamificationStore.getState().resetStore();

            // Save empty data to Firestore
            if (user) {
                await saveLibraryToFirestore(user.uid, []);
                await saveGamificationToFirestore(user.uid, {
                    level: 1,
                    xp: 0,
                    xpToNextLevel: 100,
                    streak: 0,
                    lastActivityDate: null,
                    badges: [],
                    totalChaptersRead: 0,
                    totalWorksAdded: 0,
                    totalWorksCompleted: 0,
                    totalAnimeEpisodesWatched: 0,
                    totalMoviesWatched: 0
                });
            }

            // Clear localStorage
            localStorage.clear();

            addToast(t('settings.toast.reset_success'), 'success');

            // Reload after a short delay to show the toast
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            addToast(t('settings.toast.reset_error'), 'error');
            console.error(error);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await importData(file);
            addToast(t('settings.toast.import_success'), 'success');
        } catch {
            addToast(t('settings.toast.import_error'), 'error');
        }
    };

    const [showConfirmAccountDelete, setShowConfirmAccountDelete] = useState(false);
    const [showMALImportModal, setShowMALImportModal] = useState(false);

    const handleDeleteAccount = async () => {
        if (!user) return;

        try {
            // 1. Delete Firestore Data
            await deleteUserData(user.uid);

            // 2. Delete Auth Account
            await deleteUser(user);

            // 3. Clear Local State
            useLibraryStore.getState().resetStore();
            useGamificationStore.getState().resetStore();
            localStorage.clear();

            addToast(t('settings.toast.account_deleted'), 'success');
            navigate('/');
        } catch (error) {
            console.error('Delete account error:', error);
            if ((error as { code?: string }).code === 'auth/requires-recent-login') {
                addToast(t('settings.toast.relogin_required'), 'error');
            } else {
                addToast(t('settings.toast.delete_error'), 'error');
            }
        }
    };

    const handleClearCache = () => {
        clearImageCache();
        addToast(t('settings.toast.cache_cleared'), 'success');
    };

    const COLORS = [
        { name: t('settings.colors.red'), value: '#FF2E63' },
        { name: t('settings.colors.cyan'), value: '#08D9D6' },
        { name: t('settings.colors.green'), value: '#10B981' },
        { name: t('settings.colors.yellow'), value: '#F59E0B' },
        { name: t('settings.colors.purple'), value: '#8B5CF6' },
    ];

    return (
        <Layout>
            <SEO title={t('settings.title', 'Settings')} />
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem', maxWidth: '800px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <Button variant="manga" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                            {t('settings.title')}
                        </h1>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Personnalisation */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)' }}>
                                <Palette size={20} /> {t('settings.appearance.title')}
                            </h2>
                            <div className="manga-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{t('settings.appearance.accent_color')}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => setAccentColor(c.value)}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: c.value,
                                                    border: accentColor === c.value ? '3px solid var(--color-border-heavy)' : '1px solid var(--color-border)',
                                                    cursor: 'pointer',
                                                    transform: accentColor === c.value ? 'scale(1.1)' : 'scale(1)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ height: '1px', background: 'var(--color-border)', margin: '1rem 0' }} />
                                <Switch
                                    label={t('settings.appearance.spoiler_mode')}
                                    isOn={spoilerMode}
                                    onToggle={() => {
                                        toggleSpoilerMode();
                                        // Feedback toast (state value is old value here, so inversion logic applies for message)
                                        addToast(!spoilerMode ? t('settings.appearance.spoiler_enabled') : t('settings.appearance.spoiler_disabled'), 'info');
                                    }}
                                />
                                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.5rem' }}>
                                    {t('settings.appearance.spoiler_help')}
                                </p>
                                <div style={{ height: '1px', background: 'var(--color-border)', margin: '1rem 0' }} />
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        useTutorialStore.getState().resetTutorial();
                                        useTutorialStore.getState().startTutorial();
                                        navigate('/dashboard');
                                    }}
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {t('settings.appearance.restart_tutorial')}
                                </Button>
                            </div>
                        </section>

                        {/* Accessibilité & Audio */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)' }}>
                                <Volume2 size={20} /> {t('settings.preferences.title')}
                            </h2>
                            <div className="manga-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <Switch
                                    label={t('settings.preferences.reduce_motion')}
                                    isOn={reducedMotion}
                                    onToggle={toggleReducedMotion}
                                />
                                <div style={{ height: '1px', background: 'var(--color-border)' }} />
                                <Switch
                                    label={t('settings.preferences.sound_effects')}
                                    isOn={soundEnabled}
                                    onToggle={toggleSound}
                                />
                                <div style={{ height: '1px', background: 'var(--color-border)' }} />
                                <Switch
                                    label={t('settings.preferences.notifications')}
                                    isOn={notifications}
                                    onToggle={toggleNotifications}
                                />

                                <div style={{ height: '1px', background: 'var(--color-border)' }} />
                                {/* Notification Debugger */}
                                <NotificationTester />
                            </div>
                        </section>

                        {/* Stockage & Données */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)' }}>
                                <HardDrive size={20} /> {t('settings.data.title')}
                            </h2>
                            <div className="manga-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <p style={{ fontWeight: 700 }}>{t('settings.data.storage_used')}</p>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{t('settings.data.storage_local', { size: storageSize })}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleClearCache}>
                                        <Trash2 size={16} /> {t('settings.data.clear_cache')}
                                    </Button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <Button variant="outline" onClick={exportData} icon={<Download size={18} />} style={{ justifyContent: 'center' }}>
                                        {t('settings.data.export_backup')}
                                    </Button>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".json"
                                            onChange={handleImport}
                                            style={{ display: 'none' }}
                                        />
                                        <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }} icon={<Upload size={18} />} onClick={handleImportClick}>
                                            {t('settings.data.import_backup')}
                                        </Button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }} icon={<Upload size={18} />} onClick={() => setShowMALImportModal(true)}>
                                        {t('mal_import.import_mal')}
                                    </Button>
                                </div>

                                <div style={{ height: '1px', background: 'var(--color-border)', margin: '1rem 0' }} />

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 700 }}>{t('settings.data.sync_library')}</p>
                                        </div>
                                        <SyncButton />
                                    </div>
                                    <div style={{ height: '1px', background: 'var(--color-border)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 700 }}>{t('settings.data.recalculate_button')}</p>
                                        </div>
                                        <RecalculateButton />
                                    </div>
                                    <div style={{ height: '1px', background: 'var(--color-border)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 700, color: '#ef4444' }}>{t('settings.data.danger_zone')}</p>
                                            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{t('settings.data.danger_desc')}</p>
                                        </div>
                                        {!showConfirmReset ? (
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <Button variant="outline" size="sm" onClick={() => setShowConfirmReset(true)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                                    <ShieldAlert size={16} /> {t('settings.data.reset_all')}
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setShowConfirmAccountDelete(true)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                                    <Trash2 size={16} /> {t('settings.data.delete_account')}
                                                </Button>
                                            </div>
                                        ) : showConfirmReset ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#ef4444', alignSelf: 'center', fontWeight: 'bold' }}>{t('settings.data.confirm_sure')}</span>
                                                <Button variant="ghost" size="sm" onClick={() => setShowConfirmReset(false)}>{t('settings.data.no')}</Button>
                                                <Button variant="primary" size="sm" onClick={resetAll} style={{ background: '#ef4444' }}>{t('settings.data.yes_reset')}</Button>
                                            </div>
                                        ) : null}

                                        {/* Account Deletion Confirmation */}
                                        {showConfirmAccountDelete && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', border: '2px solid #ef4444', background: '#fef2f2' }}>
                                                <p style={{ fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>{t('settings.data.delete_confirm_title')}</p>
                                                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                                                    {t('settings.data.delete_confirm_desc')}
                                                </p>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <Button variant="ghost" size="sm" onClick={() => setShowConfirmAccountDelete(false)}>{t('settings.data.cancel')}</Button>
                                                    <Button variant="primary" size="sm" onClick={handleDeleteAccount} style={{ background: '#ef4444' }}>
                                                        {t('settings.data.goodbye')}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* À propos */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)' }}>
                                <Info size={20} /> {t('settings.about.title')}
                            </h2>
                            <div className="manga-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>BINGEKI</h3>
                                        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{t('settings.about.version')}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <a href="https://github.com/Moussandou" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.7, transition: 'opacity 0.2s' }}>
                                            <Github size={24} />
                                        </a>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    {t('settings.about.made_with')}
                                </p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                                    {t('settings.about.credits')}
                                </p>
                            </div>
                        </section>

                    </motion.div>
                </div>
            </div>
            <MALImportModal isOpen={showMALImportModal} onClose={() => setShowMALImportModal(false)} />
        </Layout>
    );
}

