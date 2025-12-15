import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XPBar } from '@/components/XPBar';
import { useGamificationStore } from '@/store/gamificationStore';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/firebase/auth';
import { Settings, LogOut, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, setUser } = useAuthStore();
    const { level, xp, xpToNextLevel, streak, badges } = useGamificationStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setUser(null);
        navigate('/');
    };

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Profil</h1>
                    <Button variant="outline" size="icon"><Settings size={20} /></Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                    {/* Identity Card */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <Card variant="glass" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#333', overflow: 'hidden', border: '4px solid var(--color-primary)' }}>
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" />
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--color-primary)', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                    {level}
                                </div>
                            </div>

                            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{user?.displayName || 'Chasseur de Manga'}</h2>
                            <p style={{ color: 'var(--color-text-dim)', marginBottom: '1.5rem' }}>Membre depuis 2023</p>

                            <div style={{ marginBottom: '2rem' }}>
                                <XPBar current={xp} max={xpToNextLevel} level={level} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{streak}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>Streak Jours</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{badges.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>Badges</div>
                                </div>
                            </div>

                            <Button variant="outline" style={{ width: '100%' }} icon={<LogOut size={16} />} onClick={handleLogout}>Déconnexion</Button>
                        </Card>
                    </motion.div>

                    {/* Content & Stats */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            <Card style={{ background: 'linear-gradient(135deg, rgba(255, 46, 99, 0.1), rgba(0,0,0,0))' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(255, 46, 99, 0.2)', borderRadius: '8px', color: 'var(--color-primary)' }}>
                                        <Zap size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem' }}>Activité</h3>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>1,240</div>
                                <p style={{ color: 'var(--color-text-dim)' }}>XP gagnés cette semaine</p>
                            </Card>

                            <Card style={{ background: 'linear-gradient(135deg, rgba(255, 159, 67, 0.1), rgba(0,0,0,0))' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(255, 159, 67, 0.2)', borderRadius: '8px', color: 'var(--color-secondary)' }}>
                                        <Award size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem' }}>Rareté</h3>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>Top 5%</div>
                                <p style={{ color: 'var(--color-text-dim)' }}>Classement global</p>
                            </Card>
                        </div>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Badges Récents</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1.5rem' }}>
                            {badges.map((badge) => (
                                <motion.div
                                    key={badge.id}
                                    whileHover={{ scale: 1.05 }}
                                    style={{ textAlign: 'center' }}
                                >
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto 0.5rem',
                                        background: 'var(--color-surface)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        border: badge.rarity === 'legendary' ? '2px solid #ffd700' : '1px solid var(--glass-border)',
                                        boxShadow: badge.rarity === 'legendary' ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none'
                                    }}>
                                        {badge.icon}
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{badge.name}</p>
                                </motion.div>
                            ))}

                            {/* Placeholder empty badges */}
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px dashed var(--color-text-dim)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.5
                                }}>
                                    ?
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
