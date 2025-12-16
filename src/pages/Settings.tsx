import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useSettingsStore } from '@/store/settingsStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Volume2, Trash2, RotateCcw, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { getWorkDetails } from '@/services/animeApi';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function SyncButton() {
    const { works, updateWorkDetails } = useLibraryStore();
    const { addToast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleSync = async () => {
        if (works.length === 0) {
            addToast('Aucune œuvre à synchroniser', 'info');
            return;
        }

        setIsSyncing(true);
        setProgress(0);
        let updatedCount = 0;
        let errorCount = 0;

        try {
            for (let i = 0; i < works.length; i++) {
                const work = works[i];
                // Only sync if ID is a number (Jikan ID), skip manual ones with timestamp IDs (usually large numbers but let's assume manual ones might fail gracefully or we check type)
                // Actually Jikan IDs are numbers. timestamp IDs are also numbers.
                // We'll try to fetch all. Manual ones (timestamp IDs) will likely fail 404 or 400, so we count errors but continue.

                try {
                    const details = await getWorkDetails(Number(work.id), work.type);
                    if (details) {
                        updateWorkDetails(work.id, {
                            score: details.score || undefined,
                            synopsis: details.synopsis || undefined,
                            image: details.images.jpg.image_url, // Update image just in case
                            totalChapters: work.type === 'manga' ? details.chapters : details.episodes,
                        });
                        updatedCount++;
                    }
                } catch (e) {
                    // Ignore errors for individual works (e.g. manual items)
                    errorCount++;
                }

                setProgress(Math.round(((i + 1) / works.length) * 100));
            }

            addToast(`Synchronisation terminée : ${updatedCount} mis à jour`, 'success');
        } catch (error) {
            addToast('Erreur lors de la synchronisation', 'error');
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
                borderColor: '#000',
                color: '#000',
                minWidth: '130px'
            }}
        >
            {isSyncing ? (
                <>
                    <RefreshCw size={16} className="animate-spin" /> {progress}%
                </>
            ) : (
                <>
                    <RefreshCw size={16} /> Synchroniser
                </>
            )}
        </Button>
    );
}

export default function Settings() {
    const navigate = useNavigate();
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    const {
        reducedMotion,
        soundEnabled,
        notifications,
        toggleReducedMotion,
        toggleSound,
        toggleNotifications
    } = useSettingsStore();

    const resetGamification = () => {
        // Clear gamification data from localStorage
        localStorage.removeItem('bingeki-gamification-storage');
        window.location.reload();
    };

    const resetLibrary = () => {
        // Clear library data from localStorage
        localStorage.removeItem('bingeki-library-storage');
        window.location.reload();
    };

    const resetAll = () => {
        localStorage.removeItem('bingeki-gamification-storage');
        localStorage.removeItem('bingeki-library-storage');
        localStorage.removeItem('bingeki-settings');
        window.location.reload();
    };

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem', maxWidth: '800px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <Button variant="manga" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', color: '#000' }}>
                            Paramètres
                        </h1>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Accessibilité */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#000' }}>
                                <Eye size={20} /> ACCESSIBILITÉ
                            </h2>
                            <div className="manga-panel" style={{ padding: '1.5rem', background: '#fff', color: '#000' }}>
                                <Switch
                                    label="Réduire les animations"
                                    isOn={reducedMotion}
                                    onToggle={toggleReducedMotion}
                                />
                                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.5rem' }}>
                                    Désactive les effets de parallaxe et transitions complexes
                                </p>
                            </div>
                        </section>

                        {/* Audio & Notifications */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#000' }}>
                                <Volume2 size={20} /> AUDIO & NOTIFICATIONS
                            </h2>
                            <div className="manga-panel" style={{ padding: '1.5rem', background: '#fff', color: '#000', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <Switch
                                    label="Effets sonores (UI)"
                                    isOn={soundEnabled}
                                    onToggle={toggleSound}
                                />
                                <div style={{ height: '1px', background: '#eee' }} />
                                <Switch
                                    label="Notifications"
                                    isOn={notifications}
                                    onToggle={toggleNotifications}
                                />
                            </div>
                        </section>

                        {/* Données */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#000' }}>
                                <Trash2 size={20} /> GESTION DES DONNÉES
                            </h2>
                            <div className="manga-panel" style={{ padding: '1.5rem', background: '#fff', color: '#000' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    {/* Synchronization */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 700 }}>Synchroniser la bibliothèque</p>
                                            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Met à jour les synopsis, scores et statuts depuis l'API</p>
                                        </div>
                                        <SyncButton />
                                    </div>

                                    <div style={{ height: '1px', background: '#eee' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 700 }}>Réinitialiser la progression</p>
                                            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>XP, niveau, streak et badges</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={resetGamification} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                                            <RotateCcw size={16} /> Reset
                                        </Button>
                                    </div>

                                    <div style={{ height: '1px', background: '#eee' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 700 }}>Vider la bibliothèque</p>
                                            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Supprimer toutes les œuvres</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={resetLibrary} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                            <Trash2 size={16} /> Vider
                                        </Button>
                                    </div>

                                    <div style={{ height: '1px', background: '#eee' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 700, color: '#ef4444' }}>Tout réinitialiser</p>
                                            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Efface TOUTES les données locales</p>
                                        </div>
                                        {!showConfirmReset ? (
                                            <Button variant="outline" size="sm" onClick={() => setShowConfirmReset(true)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                                <Trash2 size={16} /> Reset All
                                            </Button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button variant="ghost" size="sm" onClick={() => setShowConfirmReset(false)}>
                                                    Annuler
                                                </Button>
                                                <Button variant="primary" size="sm" onClick={resetAll} style={{ background: '#ef4444' }}>
                                                    Confirmer
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}

