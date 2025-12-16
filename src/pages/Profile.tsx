
import { Layout } from '@/components/layout/Layout';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal'; // Assuming Modal exists, verified in previous steps

import { useGamificationStore } from '@/store/gamificationStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/firebase/auth';
import {
    Settings, LogOut, Award, BookOpen, CheckCircle, Library, Trophy, Flame, Shield, Info,
    Flag, Book, Zap, Layers, Database, Timer, CalendarCheck, Crown, Target, Star, Medal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Icon Mapping
const BADGE_ICONS: Record<string, React.ReactNode> = {
    'flag': <Flag size={32} />,
    'book': <Book size={32} />,
    'book-open': <BookOpen size={32} />,
    'flame': <Flame size={32} />,
    'zap': <Zap size={32} />,
    'library': <Library size={32} />,
    'layers': <Layers size={32} />,
    'database': <Database size={32} />,
    'timer': <Timer size={32} />,
    'calendar-check': <CalendarCheck size={32} />,
    'crown': <Crown size={32} />,
    'check-circle': <CheckCircle size={32} />,
    'target': <Target size={32} />,
    'star': <Star size={32} />,
    'medal': <Medal size={32} />,
    'award': <Award size={32} />,
    'trophy': <Trophy size={32} />,
};

export default function Profile() {
    const { user, setUser } = useAuthStore();
    const { level, xp, xpToNextLevel, streak, badges, totalChaptersRead, totalWorksAdded, totalWorksCompleted } = useGamificationStore();
    const { works } = useLibraryStore();
    const navigate = useNavigate();
    const [showGuide, setShowGuide] = useState(false);
    const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);

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
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="ghost" onClick={() => setShowGuide(true)} icon={<Info size={20} />}>GUIDE</Button>
                            <Button variant="manga" size="icon" onClick={() => navigate('/settings')}><Settings size={20} /></Button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
                                            <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                        onHoverStart={() => setHoveredBadgeId(badge.id)}
                                        onHoverEnd={() => setHoveredBadgeId(null)}
                                        style={{ textAlign: 'center', position: 'relative' }}
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
                                            border: '3px solid #000',
                                            boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'
                                        }}>
                                            {BADGE_ICONS[badge.icon as string] || <span>?</span>}
                                        </div>
                                        <p style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: '#000' }}>{badge.name}</p>

                                        {/* Hover Tooltip */}
                                        <AnimatePresence>
                                            {hoveredBadgeId === badge.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '100%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        background: '#000',
                                                        color: '#fff',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.7rem',
                                                        width: '150px',
                                                        zIndex: 20,
                                                        marginBottom: '10px',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {badge.description}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '50%',
                                                        marginLeft: '-6px',
                                                        borderWidth: '6px',
                                                        borderStyle: 'solid',
                                                        borderColor: 'black transparent transparent transparent'
                                                    }} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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

                    {/* Guide Modal */}
                    <Modal isOpen={showGuide} onClose={() => setShowGuide(false)} title="Guide du Chasseur">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: '#000', color: '#fff', padding: '1rem', borderRadius: '4px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Trophy size={20} className="text-primary" />
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 900 }}>EXPERIENCE (XP)</h4>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                        Gagnez de l'XP à chaque action sur Bingeki :
                                    </p>
                                    <ul style={{ fontSize: '0.85rem', marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                                        <li>Lire un chapitre : <strong>+10 XP</strong></li>
                                        <li>Ajouter une œuvre : <strong>+15 XP</strong></li>
                                        <li>Terminer une œuvre : <strong>+50 XP</strong></li>
                                        <li>Connexion quotidienne : <strong>+5 XP</strong></li>
                                    </ul>
                                </div>
                                <div style={{ background: '#fff', color: '#000', border: '2px solid #000', padding: '1rem', borderRadius: '4px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Flame size={20} color="var(--color-primary)" />
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 900 }}>STREAK</h4>
                                    </div>
                                    <p style={{ fontSize: '0.9rem' }}>
                                        La flamme de votre passion ! 🔥
                                        Connectez-vous chaque jour pour augmenter votre Streak.
                                    </p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                        Attention : si vous ratez un jour, la flamme s'éteint et retombe à 0.
                                    </p>
                                </div>
                            </div>
                            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid var(--color-primary)' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem' }}>Gagner des Rangs</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    En accumulant de l'XP, vous montez de niveau et de rang (F -&gt; S).
                                    Débloquez des badges uniques pour montrer vos exploits sur votre profil !
                                </p>
                            </div>
                        </div>
                    </Modal>

                </div>
            </div>
        </Layout>
    );
}
