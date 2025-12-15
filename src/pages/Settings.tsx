import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useSettingsStore } from '@/store/settingsStore';
import { motion } from 'framer-motion';
import { Volume2, Monitor, Eye } from 'lucide-react';

export default function Settings() {
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

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem', maxWidth: '800px' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Paramètres</h1>
                    <p style={{ color: 'var(--color-text-dim)' }}>Personnalisez votre expérience Bingeki</p>
                </header>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Apparence */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Monitor size={20} /> Apparence
                        </h2>
                        <Card variant="glass">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Thème</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['dark', 'light', 'amoled'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t as any)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                border: `1px solid ${theme === t ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                                                background: theme === t ? 'rgba(255, 46, 99, 0.1)' : 'transparent',
                                                color: theme === t ? 'var(--color-primary)' : 'var(--color-text-dim)',
                                                textTransform: 'capitalize',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Accessibilité & Confort */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Eye size={20} /> Accessibilité & Confort
                        </h2>
                        <Card variant="glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Switch
                                label="Réduire les animations"
                                isOn={reducedMotion}
                                onToggle={toggleReducedMotion}
                            />
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', marginTop: '-0.5rem' }}>Désactive les effets de parallaxe et les transitions complexes.</p>
                        </Card>
                    </section>

                    {/* Audio & Notifications */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Volume2 size={20} /> Audio & Notifications
                        </h2>
                        <Card variant="glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Switch
                                label="Effets sonores (UI)"
                                isOn={soundEnabled}
                                onToggle={toggleSound}
                            />
                            <div style={{ height: '1px', background: 'var(--glass-border)' }} />
                            <Switch
                                label="Notifications"
                                isOn={notifications}
                                onToggle={toggleNotifications}
                            />
                        </Card>
                    </section>

                </motion.div>
            </div>
        </Layout>
    );
}
