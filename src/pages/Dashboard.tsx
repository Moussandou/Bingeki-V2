import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XPBar } from '@/components/XPBar';
import { StreakCounter } from '@/components/StreakCounter';
import { Play, Plus, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuthStore();
    const { level, xp, xpToNextLevel, streak } = useGamificationStore();

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem' }}>
                {/* Hero / Stats Section */}
                <section style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '2rem',
                    padding: '2rem 0',
                    position: 'relative'
                }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="animate-float"
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: '#333',
                            overflow: 'hidden',
                            border: '3px solid var(--color-primary)',
                            boxShadow: '0 0 20px var(--color-primary-glow)'
                        }}
                    >
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%' }} />
                    </motion.div>

                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <motion.h2
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                style={{ fontSize: '2.5rem', lineHeight: 1 }}
                            >
                                Bonjour, <span className="text-gradient">{user?.displayName || 'Héros'}</span>
                            </motion.h2>
                            <StreakCounter count={streak} />
                        </div>

                        <div style={{ marginTop: '1.5rem', maxWidth: '500px' }}>
                            <XPBar current={xp} max={xpToNextLevel} level={level} />
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                    <Link to="/library">
                        <Button variant="outline" icon={<Plus size={16} />}>Ajouter une œuvre</Button>
                    </Link>
                    <Link to="/profile">
                        <Button variant="ghost" icon={<User size={16} />}>Voir mon profil</Button>
                    </Link>
                </section>

                {/* Continue Reading */}
                <section style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{
                            borderLeft: '4px solid var(--color-primary)',
                            paddingLeft: '1rem',
                            fontSize: '1.5rem'
                        }}>
                            EN COURS
                        </h3>
                        <Link to="/library">
                            <Button variant="ghost" size="sm">Tout voir <ChevronRight size={16} /></Button>
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {/* Mock Data */}
                        {[1, 2, 3].map((i) => (
                            <motion.div key={i} whileHover={{ y: -5 }}>
                                <Card variant="glass" hoverable style={{ padding: 0 }}>
                                    <div style={{
                                        height: '150px',
                                        background: `url(https://picsum.photos/seed/${i + 10}/400/200) center/cover`,
                                        position: 'relative'
                                    }}>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }} />
                                        <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.8)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' }}>
                                            Manga
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Jujutsu Kaisen</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Chapitre {230 + i}</p>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>Il y a 2h</span>
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>
                                            <Link to="/work/1">
                                                <Button size="sm" style={{ width: '100%' }}>
                                                    <Play size={14} /> Continuer
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </Layout>
    )
}
