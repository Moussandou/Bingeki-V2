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
            {/* Manga Background Texture */}
            <div className="bg-halftone" style={{ minHeight: 'calc(100vh - 80px)' }}>

                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

                    {/* ID Card / Hero Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="manga-panel"
                        style={{
                            padding: '2rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '2rem',
                            alignItems: 'center',
                            marginBottom: '3rem',
                            background: '#fff',
                            color: '#000' // Force black text on white panel
                        }}
                    >
                        <div style={{
                            width: '100px',
                            height: '100px',
                            border: '3px solid #000',
                            overflow: 'hidden',
                            boxShadow: '4px 4px 0px var(--color-primary)'
                        }}>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%' }} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <h1 style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '2.5rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 900,
                                    margin: 0,
                                    lineHeight: 1
                                }}>
                                    {user?.displayName || 'Héros'}
                                </h1>
                                <span className="manga-title" style={{ fontSize: '0.9rem' }}>RANK F</span>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', alignItems: 'center' }}>
                                <StreakCounter count={streak} />
                                <div style={{ flex: 1, maxWidth: '300px' }}>
                                    <XPBar current={xp} max={xpToNextLevel} level={level} />
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions in Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link to="/library">
                                <Button variant="manga" size="sm" icon={<Plus size={16} />}>Ajouter</Button>
                            </Link>
                            <Link to="/profile">
                                <Button variant="ghost" size="sm" style={{ color: '#000', border: '1px solid #000' }}>PROFIL</Button>
                            </Link>
                        </div>
                    </motion.section>

                    {/* Section Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className="manga-title" style={{ fontSize: '1.5rem', background: 'var(--color-primary)', color: '#fff', transform: 'rotate(-2deg)' }}>
                                EN COURS
                            </span>
                            <span style={{ height: '2px', width: '100px', background: '#000' }} />
                        </div>
                        <Link to="/library">
                            <Button variant="ghost" size="sm" style={{ fontWeight: 800 }}>TOUT VOIR <ChevronRight size={16} /></Button>
                        </Link>
                    </div>

                    {/* Manga Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {/* Mock Data */}
                        {[1, 2, 3].map((i) => (
                            <motion.div key={i} whileHover={{ y: -5 }}>
                                <Card variant="manga" hoverable style={{ padding: 0, overflow: 'hidden', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                                    {/* Image */}
                                    <div style={{
                                        height: '200px',
                                        background: `url(https://picsum.photos/seed/${i + 20}/400/300) center/cover`,
                                        borderBottom: '3px solid #000',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            left: '0.5rem',
                                            background: '#000',
                                            color: '#fff',
                                            padding: '2px 8px',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            transform: 'skewX(-10deg)'
                                        }}>
                                            MANGA
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '1.5rem', background: '#fff', color: '#000', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h4 style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '1.25rem',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            marginBottom: '0.5rem',
                                            lineHeight: 1.2
                                        }}>
                                            Jujutsu Kaisen
                                        </h4>

                                        {/* Chapter info */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Chapitre {230 + i}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>2h ago</span>
                                        </div>

                                        <div style={{ marginTop: 'auto' }}>
                                            <Link to="/work/1">
                                                <Button size="sm" variant="primary" style={{ width: '100%', borderRadius: 0, border: '2px solid #000', boxShadow: '4px 4px 0 #000' }}>
                                                    <Play size={14} fill="currentColor" /> CONTINUER
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
