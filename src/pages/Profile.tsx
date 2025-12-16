import { Layout } from '@/components/layout/Layout';

import { Button } from '@/components/ui/Button';

import { useGamificationStore } from '@/store/gamificationStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/firebase/auth';
import { Settings, LogOut, Award, BookOpen, CheckCircle, Library, Trophy, Flame, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, setUser } = useAuthStore();
    const { level, xp, xpToNextLevel, streak, badges, totalChaptersRead, totalWorksAdded, totalWorksCompleted } = useGamificationStore();
    const { works } = useLibraryStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setUser(null);
        navigate('/');
    };

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 className="text-outline" style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', color: '#000', textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
                            Fiche de Chasseur
                        </h1>
                        <Button variant="manga" size="icon" onClick={() => navigate('/settings')}><Settings size={20} /></Button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '2rem' }}>
                        {/* ID Card / Hunter License Style */}
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <div className="manga-panel" style={{ padding: '0', overflow: 'hidden', background: '#fff', color: '#000' }}>
                                {/* Header Strip */}
                                <div style={{ background: '#000', color: '#fff', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 900, letterSpacing: '2px' }}>HUNTER LICENSE</span>
                                    <Shield size={16} />
                                </div>

                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '140px', height: '140px', borderRadius: '4px', border: '3px solid #000', overflow: 'hidden', background: '#333', boxShadow: '4px 4px 0 rgba(0,0,0,0.2)' }}>
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" />
                                        </div>
                                        <div className="manga-title" style={{ position: 'absolute', bottom: -10, right: -10, fontSize: '1.5rem', transform: 'rotate(-5deg)', color: '#fff', background: 'var(--color-primary)' }}>
                                            LVL {level}
                                        </div>
                                    </div>

                                    <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{user?.displayName || 'Chasseur'}</h2>
                                    <p style={{ fontFamily: 'monospace', fontSize: '1rem', opacity: 0.7, marginBottom: '2rem' }}>ID: 8094-1290-BING</p>

                                    <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
                                            <span>EXPÉRIENCE</span>
                                            <span>{xp} / {xpToNextLevel}</span>
                                        </div>
                                        <div style={{ height: '12px', background: '#eee', border: '2px solid #000' }}>
                                            <div style={{ height: '100%', width: `${(xp / xpToNextLevel) * 100}%`, background: 'var(--color-primary)' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                        <div style={{ border: '2px solid #000', padding: '0.5rem' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{streak}</div>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Jours Streak</div>
                                        </div>
                                        <div style={{ border: '2px solid #000', padding: '0.5rem' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{badges.length}</div>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Badges</div>
                                        </div>
                                    </div>

                                    <Button variant="outline" style={{ width: '100%', border: '2px solid var(--color-primary)', borderRadius: 0, fontWeight: 900 }} icon={<LogOut size={16} />} onClick={handleLogout}>DECONNEXION</Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Content & Stats */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                                {/* Chapitres lus */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#000', color: '#fff' }}>
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{totalChaptersRead}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>Chapitres lus</p>
                                    </div>
                                </div>

                                {/* En cours */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--color-primary)', color: '#fff' }}>
                                        <Flame size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{works.filter(w => w.status === 'reading').length}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>En cours</p>
                                    </div>
                                </div>

                                {/* Terminées */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#22c55e', color: '#fff' }}>
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{totalWorksCompleted}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>Terminées</p>
                                    </div>
                                </div>

                                {/* Collection */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#000', color: '#fff' }}>
                                        <Library size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{totalWorksAdded}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>Collection</p>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#fbbf24', color: '#000' }}>
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{badges.length} / 16</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>Badges</p>
                                    </div>
                                </div>

                                {/* XP Total */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#8b5cf6', color: '#fff' }}>
                                        <Trophy size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{xp + (level - 1) * 100}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>XP Total</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="manga-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', background: 'var(--color-secondary)', color: '#000' }}>Badges Récents</h3>
                            <div className="manga-panel" style={{ padding: '2rem', background: '#fff', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '2rem' }}>
                                {badges.map((badge) => (
                                    <motion.div
                                        key={badge.id}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            margin: '0 auto 0.5rem',
                                            background: badge.rarity === 'legendary' ? '#ffd700' : '#000',
                                            color: badge.rarity === 'legendary' ? '#000' : '#fff',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2.5rem',
                                            border: '3px solid #000',
                                            boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'
                                        }}>
                                            {badge.icon}
                                        </div>
                                        <p style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: '#000' }}>{badge.name}</p>
                                    </motion.div>
                                ))}

                                {/* Placeholder empty badges */}
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        background: '#eee',
                                        borderRadius: '50%',
                                        border: '3px dashed #ccc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ccc',
                                        fontWeight: 900,
                                        fontSize: '1.5rem'
                                    }}>
                                        ?
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
