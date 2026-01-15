import { Layout } from '@/components/layout/Layout';
// Card component removed as part of redesign
import { Button } from '@/components/ui/Button';
import { XPBar } from '@/components/XPBar';
import { StreakCounter } from '@/components/StreakCounter';
import { Play, Plus, ChevronRight, Target, TrendingUp, BookOpen, Users, Flame } from 'lucide-react';
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
import { getTopWorks } from '@/services/animeApi';
import type { JikanResult } from '@/services/animeApi';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AddWorkModal } from '@/components/AddWorkModal';
import { Card } from '@/components/ui/Card';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { level, xp, xpToNextLevel, streak } = useGamificationStore();
    const { works } = useLibraryStore();

    const [friendsActivity, setFriendsActivity] = useState<ActivityEvent[]>([]);
    const [isLoadingActivity, setIsLoadingActivity] = useState(true);
    const [recommendations, setRecommendations] = useState<JikanResult[]>([]);

    // Modal state
    const [selectedWork, setSelectedWork] = useState<JikanResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        loadRecommendations();
    }, [user]);

    const loadFriendsActivity = async () => {
        if (!user) return;
        setIsLoadingActivity(true);
        const activity = await getFriendsActivity(user.uid, 5);
        setFriendsActivity(activity);
        setIsLoadingActivity(false);
    };

    const loadRecommendations = async () => {
        // Fetch top manga by popularity
        const topManga = await getTopWorks('manga', 'bypopularity', 6); // Fetch 6 for a better grid
        setRecommendations(topManga);
    };

    const handleRecommendationClick = (work: JikanResult) => {
        setSelectedWork(work);
        setIsModalOpen(true);
    };

    const formatTimeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return t('dashboard.just_now');
        if (hours < 24) return t('dashboard.hours_ago', { hours });
        return t('dashboard.days_ago', { days: Math.floor(hours / 24) });
    };

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

                    {/* ID Card / Hero Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`manga-panel ${styles.heroPanel}`}
                    >
                        <div className={styles.avatarContainer}>
                            <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div className={styles.heroInfo}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <h1 style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '2.5rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 900,
                                    margin: 0,
                                    lineHeight: 1
                                }}>
                                    {user?.displayName || t('dashboard.hero_default')}
                                </h1>
                                <span className="manga-title" style={{
                                    fontSize: '0.9rem',
                                    background: '#fff',
                                    color: getRankColor(calculateRank(level)),
                                    border: '2px solid #000',
                                    boxShadow: '2px 2px 0 #000'
                                }}>
                                    {t('dashboard.rank')} {calculateRank(level)}
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
                                <Button variant="manga" size="sm" icon={<Plus size={16} />}>{t('dashboard.discover_btn')}</Button>
                            </Link>
                            <Link to="/profile">
                                <Button variant="manga" size="sm">{t('dashboard.profile_btn')}</Button>
                            </Link>
                        </div>
                    </motion.section>

                    {/* Stats HUD (Bar Style) */}
                    <div className={`manga-panel ${styles.statsHud}`}>
                        {/* Daily Goal */}
                        <div className={styles.statItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                                <Target size={20} />
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('dashboard.goal')}</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                                {todayProgress}<span style={{ fontSize: '1rem', opacity: 0.4 }}>/{dailyGoal}</span>
                            </div>
                            <div style={{ width: '60px', height: '4px', background: '#eee', marginTop: '0.5rem', borderRadius: '2px' }}>
                                <div style={{ width: `${(todayProgress / dailyGoal) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
                            </div>
                        </div>

                        {/* Weekly Stats */}
                        <div className={styles.statItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                                <TrendingUp size={20} />
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('dashboard.weekly')}</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                                {weeklyChapters}
                            </div>
                            <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.25rem' }}>{t('dashboard.chapters_read')}</p>
                        </div>

                        {/* Streak */}
                        <div className={styles.statItem} style={{ background: streak > 0 ? '#fff' : '#fef2f2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                                <Flame size={20} color={streak > 0 ? 'var(--color-primary)' : 'currentColor'} />
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('dashboard.streak')}</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1, color: streak > 0 ? 'var(--color-primary)' : 'inherit' }}>
                                {streak}
                            </div>
                            <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.25rem' }}>{t('dashboard.days')}</p>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className={styles.dashboardGrid}>

                        {/* Left Column - Continue Reading */}
                        <div>
                            {/* Last Read HERO BANNER */}
                            {lastUpdatedWork && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ marginBottom: '3rem' }}
                                    className="manga-panel"
                                >
                                    <Link to={`/work/${lastUpdatedWork.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                                        <div style={{
                                            position: 'relative',
                                            height: '220px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                        }}>
                                            {/* Background Image */}
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: `url(${lastUpdatedWork.image}) center/cover`,
                                                filter: 'brightness(0.8)'
                                            }} />

                                            {/* Gradient Overlay */}
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)'
                                            }} />

                                            {/* Content */}
                                            <div style={{
                                                position: 'relative',
                                                zIndex: 10,
                                                height: '100%',
                                                padding: '2rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                maxWidth: '70%'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    textTransform: 'uppercase',
                                                    background: 'var(--color-primary)',
                                                    padding: '4px 8px',
                                                    width: 'fit-content',
                                                    fontWeight: 800,
                                                    marginBottom: '0.5rem',
                                                }}>
                                                    {lastUpdatedWork.type}
                                                </span>
                                                <h3 style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '2rem',
                                                    fontWeight: 900,
                                                    lineHeight: 1.1,
                                                    marginBottom: '0.5rem',
                                                    textShadow: '2px 2px 0 #000'
                                                }}>
                                                    {lastUpdatedWork.title}
                                                </h3>
                                                <p style={{ opacity: 0.9, fontSize: '1rem', fontWeight: 600 }}>
                                                    {t('dashboard.chapter')} {lastUpdatedWork.currentChapter} <span style={{ opacity: 0.6 }}>/ {lastUpdatedWork.totalChapters || '?'}</span>
                                                </p>
                                                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.9rem' }}>
                                                    <Play size={20} fill="currentColor" /> {t('dashboard.continue_reading')}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* In Progress Section */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <BookOpen size={20} />
                                    <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>{t('dashboard.in_progress')}</span>
                                </div>
                                <Link to="/library">
                                    <Button variant="ghost" size="sm" style={{ fontWeight: 800 }}>{t('dashboard.see_all')} <ChevronRight size={16} /></Button>
                                </Link>
                            </div>

                            <div className={styles.progressGrid}>
                                {inProgressWorks.length === 0 ? (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                                        <p style={{ marginBottom: '1rem', opacity: 0.7 }}>{t('dashboard.no_reading')}</p>
                                        <Link to="/discover">
                                            <Button variant="primary" icon={<Plus size={18} />}>{t('dashboard.discover')}</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    inProgressWorks.map((work) => (
                                        <motion.div key={work.id} whileHover={{ y: -5 }}>
                                            <Link to={`/work/${work.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                                                <Card
                                                    variant="manga"
                                                    hoverable
                                                    style={{
                                                        overflow: 'hidden',
                                                        marginBottom: '0.75rem',
                                                        position: 'relative',
                                                        padding: 0
                                                    }}
                                                >
                                                    <div style={{ paddingTop: '140%', position: 'relative' }}>
                                                        <img src={work.image} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                                        padding: '2rem 0.5rem 0.5rem',
                                                        color: '#fff'
                                                    }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Ch. {work.currentChapter}</span>
                                                    </div>
                                                </Card>
                                                <h4 style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    lineHeight: 1.2,
                                                    color: '#000',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>{work.title}</h4>
                                            </Link>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Column - Activity Feed */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Users size={20} />
                                <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>{t('dashboard.friends_activity')}</span>
                            </div>

                            <div className="manga-panel" style={{
                                background: '#fff',
                                padding: '0',
                                marginBottom: '3rem',
                                overflow: 'hidden'
                            }}>
                                {isLoadingActivity ? (
                                    <p style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>{t('dashboard.loading')}</p>
                                ) : friendsActivity.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <Users size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{t('dashboard.no_activity')}</p>
                                        <Link to="/social">
                                            <Button size="sm" variant="ghost" style={{ marginTop: '0.5rem' }}>{t('dashboard.add_friends')}</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {friendsActivity.map((activity, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '1rem',
                                                padding: '1rem',
                                                borderBottom: i < friendsActivity.length - 1 ? '1px solid #f5f5f5' : 'none',
                                                transition: 'background 0.2s'
                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                                                    <img src={activity.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.userName}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                                                        <span style={{ fontWeight: 700 }}>{activity.userName}</span>
                                                        <span style={{ opacity: 0.8 }}> {ACTIVITY_LABELS[activity.type]}</span>
                                                        {activity.workTitle && <span> <strong>{activity.workTitle}</strong></span>}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>
                                                        {ACTIVITY_EMOJIS[activity.type]} {formatTimeAgo(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link to="/social" style={{ textAlign: 'center', padding: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{t('dashboard.see_all_activity')}</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Recommendations Section */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Star size={20} className="text-gradient" />
                                <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>{t('dashboard.to_discover')}</span>
                            </div>

                            <div className={styles.recGrid}>
                                {recommendations.length > 0 ? (
                                    <>
                                        {recommendations.map(manga => (
                                            <motion.div
                                                key={manga.mal_id}
                                                whileHover={{ y: -5 }}
                                                onClick={() => handleRecommendationClick(manga)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <Card variant="manga" hoverable style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
                                                    <div style={{ position: 'relative', paddingTop: '150%' }}>
                                                        <img
                                                            src={manga.images.jpg.image_url}
                                                            alt={manga.title}
                                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                                            padding: '2rem 0.5rem 0.5rem',
                                                            color: '#fff'
                                                        }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {manga.title}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <Star size={10} fill="#FFD700" color="#FFD700" /> {manga.score}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="manga-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                                        <p style={{ opacity: 0.6 }}>{t('dashboard.loading')}</p>
                                    </div>
                                )}
                                <Link to="/discover" style={{ gridColumn: '1/-1' }}>
                                    <Button variant="ghost" size="sm" style={{ width: '100%' }}>{t('dashboard.see_more_suggestions')}</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Add Work Modal */}
                    {selectedWork && (
                        <AddWorkModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            initialWork={selectedWork}
                        />
                    )}

                </div>
            </div>
        </Layout>
    )
}
