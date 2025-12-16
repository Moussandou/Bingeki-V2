import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useSettingsStore } from '@/store/settingsStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, Eye, Volume2, Trash2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Settings() {
    const navigate = useNavigate();
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    const {
        theme,
        reducedMotion,
        soundEnabled,
        notifications,
        setTheme,
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

                        {/* Apparence */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#000' }}>
                                <Monitor size={20} /> APPARENCE
                            </h2>
                            <div className="manga-panel" style={{ padding: '1.5rem', background: '#fff', color: '#000' }}>
                                <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Thème</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['dark', 'light', 'amoled'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t as any)}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                border: '2px solid #000',
                                                background: theme === t ? '#000' : '#fff',
                                                color: theme === t ? '#fff' : '#000',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                cursor: 'pointer',
                                                boxShadow: theme === t ? '4px 4px 0 var(--color-primary)' : 'none',
                                                transform: theme === t ? 'translate(-2px, -2px)' : 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {t === 'dark' ? 'Sombre' : t === 'light' ? 'Clair' : 'AMOLED'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

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

