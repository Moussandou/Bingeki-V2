import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XPBar } from '@/components/XPBar';
import { StreakCounter } from '@/components/StreakCounter';
import { Play, Plus, ChevronRight, Target, TrendingUp, BookOpen, Users, Flame, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useLibraryStore } from '@/store/libraryStore';
import { Link } from 'react-router-dom';
import { calculateRank, getRankColor } from '@/utils/rankUtils';
import { useState, useEffect } from 'react';
import { getFriendsActivity } from '@/firebase/firestore';
import type { ActivityEvent } from '@/types/activity';
import { ACTIVITY_EMOJIS, ACTIVITY_LABELS } from '@/types/activity';

export default function Dashboard() {
    const { user } = useAuthStore();
    const { level, xp, xpToNextLevel, streak } = useGamificationStore();
    const { works } = useLibraryStore();

    const [friendsActivity, setFriendsActivity] = useState<ActivityEvent[]>([]);
    const [isLoadingActivity, setIsLoadingActivity] = useState(true);

    // Filter works
    const inProgressWorks = works.filter(w => w.status === 'reading').slice(0, 4);
    const lastUpdatedWork = inProgressWorks[0]; // Just use first in-progress work

    // Weekly stats calculation
    const weeklyChapters = inProgressWorks.reduce((sum, w) => sum + (w.currentChapter || 0), 0);
    const dailyGoal = 3;
    const todayProgress = Math.min(weeklyChapters % 10, dailyGoal); // Simplified daily tracking

    useEffect(() => {
        if (user) {
            loadFriendsActivity();
        }
    }, [user]);
    const loadFriendsActivity = async () => {
        if (!user) return;
        setIsLoadingActivity(true);
        const activity = await getFriendsActivity(user.uid, 5);
        setFriendsActivity(activity);
        setIsLoadingActivity(false);
    };

    const formatTimeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'À l\'instant';
        if (hours < 24) return `Il y a ${hours}h`;
        return `Il y a ${Math.floor(hours / 24)}j`;
    };

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
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
                            marginBottom: '2rem',
                            background: '#fff',
                            color: '#000'
                        }}
                    >
                        <div style={{
                            width: '100px',
                            height: '100px',
                            border: '3px solid #000',
                            overflow: 'hidden',
                            boxShadow: '4px 4px 0px var(--color-primary)'
                        }}>
                            <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <span className="manga-title" style={{
                                    fontSize: '0.9rem',
                                    background: '#fff',
                                    color: getRankColor(calculateRank(level)),
                                    border: '2px solid #000',
                                    boxShadow: '2px 2px 0 #000'
                                }}>
                                    RANK {calculateRank(level)}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', alignItems: 'center' }}>
                                <StreakCounter count={streak} />
                                <div style={{ flex: 1, maxWidth: '300px' }}>
                                    <XPBar current={xp} max={xpToNextLevel} level={level} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link to="/discover">
                                <Button variant="manga" size="sm" icon={<Plus size={16} />}>Découvrir</Button>
                            </Link>
                            <Link to="/profile">
                                <Button variant="manga" size="sm">PROFIL</Button>
                            </Link>
                        </div>
                    </motion.section>

                    {/* Stats & Goals Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {/* Daily Goal */}
                        <Card variant="manga" style={{ padding: '1.25rem', background: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Target size={24} color="var(--color-primary)" />
                                <span style={{ fontWeight: 800, fontSize: '1rem' }}>OBJECTIF DU JOUR</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{todayProgress}</span>
                                <span style={{ opacity: 0.6 }}>/ {dailyGoal} chapitres</span>
                            </div>
                            <div style={{ height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(todayProgress / dailyGoal) * 100}%`,
                                    background: 'var(--color-primary)',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                            {todayProgress >= dailyGoal && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.5rem', fontWeight: 600 }}>
                                    ✓ Objectif atteint ! +50 XP
                                </p>
                            )}
                        </Card>

                        {/* Weekly Stats */}
                        <Card variant="manga" style={{ padding: '1.25rem', background: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <TrendingUp size={24} color="var(--color-primary)" />
                                <span style={{ fontWeight: 800, fontSize: '1rem' }}>CETTE SEMAINE</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{weeklyChapters}</span>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>chapitres</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{inProgressWorks.length}</span>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>en cours</p>
                                </div>
                            </div>
                        </Card>

                        {/* Streak Warning / Status */}
                        <Card variant="manga" style={{ padding: '1.25rem', background: streak > 0 ? '#fff' : '#fef2f2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Flame size={24} color={streak > 0 ? 'var(--color-primary)' : '#9ca3af'} />
                                <span style={{ fontWeight: 800, fontSize: '1rem' }}>STREAK</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: streak > 0 ? 'var(--color-primary)' : '#9ca3af' }}>
                                    {streak}
                                </span>
                                <span style={{ opacity: 0.6 }}>jours</span>
                            </div>
                            {streak === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                    ⚠️ Lis un chapitre pour démarrer !
                                </p>
                            ) : streak < 3 ? (
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                    Continue comme ça !
                                </p>
                            ) : (
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                    🔥 Tu es en feu !
                                </p>
                            )}
                        </Card>
                    </div>

                    {/* Two Column Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                        {/* Left Column - Continue Reading */}
                        <div>
                            {/* Last Read Quick Continue */}
                            {lastUpdatedWork && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ marginBottom: '2rem' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <Clock size={20} />
                                        <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>Continuer</span>
                                    </div>
                                    <Link to={`/work/${lastUpdatedWork.id}`} style={{ textDecoration: 'none' }}>
                                        <Card variant="manga" hoverable style={{
                                            padding: 0,
                                            overflow: 'hidden',
                                            display: 'flex',
                                            background: '#fff'
                                        }}>
                                            <div style={{ width: 100, height: 140, flexShrink: 0, borderRight: '2px solid #000' }}>
                                                <img src={lastUpdatedWork.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <h3 style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '1.25rem',
                                                    fontWeight: 900,
                                                    marginBottom: '0.5rem'
                                                }}>{lastUpdatedWork.title}</h3>
                                                <p style={{ opacity: 0.6, marginBottom: '0.75rem' }}>
                                                    Chapitre {lastUpdatedWork.currentChapter} / {lastUpdatedWork.totalChapters || '?'}
                                                </p>
                                                <Button size="sm" variant="primary" icon={<Play size={14} fill="currentColor" />}>
                                                    CONTINUER
                                                </Button>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            )}

                            {/* In Progress Section */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <BookOpen size={20} />
                                    <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>En cours</span>
                                </div>
                                <Link to="/library">
                                    <Button variant="ghost" size="sm" style={{ fontWeight: 800 }}>TOUT VOIR <ChevronRight size={16} /></Button>
                                </Link>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {inProgressWorks.length === 0 ? (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                                        <p style={{ marginBottom: '1rem', opacity: 0.7 }}>Aucune lecture en cours</p>
                                        <Link to="/discover">
                                            <Button variant="primary" icon={<Plus size={18} />}>DÉCOUVRIR</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    inProgressWorks.map((work) => (
                                        <motion.div key={work.id} whileHover={{ y: -3 }}>
                                            <Link to={`/work/${work.id}`} style={{ textDecoration: 'none' }}>
                                                <Card variant="manga" hoverable style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
                                                    <div style={{ height: '120px', background: `url(${work.image}) center/cover`, borderBottom: '2px solid #000' }} />
                                                    <div style={{ padding: '0.75rem', background: '#fff' }}>
                                                        <h4 style={{
                                                            fontFamily: 'var(--font-heading)',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 800,
                                                            marginBottom: '0.25rem',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>{work.title}</h4>
                                                        <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                                            Ch. {work.currentChapter} / {work.totalChapters || '?'}
                                                        </p>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Column - Activity Feed */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Users size={20} />
                                <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>Activité amis</span>
                            </div>

                            <Card variant="manga" style={{ padding: '1rem', background: '#fff' }}>
                                {isLoadingActivity ? (
                                    <p style={{ textAlign: 'center', opacity: 0.6, padding: '1rem' }}>Chargement...</p>
                                ) : friendsActivity.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                                        <Users size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Pas encore d'activité</p>
                                        <Link to="/social">
                                            <Button size="sm" variant="ghost" style={{ marginTop: '0.5rem' }}>Ajouter des amis</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {friendsActivity.map((activity, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem',
                                                paddingBottom: i < friendsActivity.length - 1 ? '0.75rem' : 0,
                                                borderBottom: i < friendsActivity.length - 1 ? '1px solid #eee' : 'none'
                                            }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid #000', flexShrink: 0 }}>
                                                    <img src={activity.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.userName}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                                                        <strong>{activity.userName}</strong> {ACTIVITY_LABELS[activity.type]}
                                                        {activity.workTitle && <span style={{ opacity: 0.7 }}> {activity.workTitle}</span>}
                                                    </p>
                                                    <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.25rem' }}>
                                                        {ACTIVITY_EMOJIS[activity.type]} {formatTimeAgo(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link to="/social" style={{ textAlign: 'center' }}>
                                            <Button size="sm" variant="ghost" style={{ width: '100%' }}>Voir plus</Button>
                                        </Link>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
