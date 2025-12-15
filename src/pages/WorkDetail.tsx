import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressButton } from '@/components/ProgressButton';
import { MOCK_ARCS } from '@/types/arc';
import styles from '@/styles/WorkDetail.module.css';
import { ArrowLeft, Clock, BookOpen, Star, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function WorkDetail() {
    const navigate = useNavigate();
    // Mock data - normally would fetch based on ID
    const work = {
        title: "Jujutsu Kaisen",
        image: "https://picsum.photos/seed/jk/1920/1080",
        cover: "https://picsum.photos/seed/jk/400/600",
        current: 235,
        total: 270,
        status: 'En cours',
        type: 'Manga'
    };

    const [progress, setProgress] = useState(work.current);

    return (
        <Layout>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <img src={work.image} alt="Background" className={styles.heroImage} />
                <div className={styles.heroOverlay} />

                <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        style={{ position: 'absolute', top: '-200px', left: 0 }}
                    >
                        <ArrowLeft /> Retour
                    </Button>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}
                    >
                        {/* Cover Card */}
                        <Card className="hidden-mobile" style={{ width: '200px', padding: 0, overflow: 'hidden', border: '4px solid #fff', transform: 'rotate(-3deg)' }}>
                            <img src={work.cover} alt="Cover" style={{ width: '100%', display: 'block' }} />
                        </Card>

                        <div style={{ flex: 1, marginBottom: '1rem' }}>
                            <motion.h1
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-gradient"
                                style={{ fontSize: 'min(4rem, 10vw)', lineHeight: 1, marginBottom: '0.5rem' }}
                            >
                                {work.title}
                            </motion.h1>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {work.status.toUpperCase()}
                                </span>
                                <span style={{ color: 'var(--color-text-dim)' }}>{work.type}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="secondary" size="icon"><Share2 size={20} /></Button>
                            <Button variant="outline" size="icon"><Star size={20} /></Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '4rem', marginTop: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '3rem' }}>

                    {/* Main Content: Progress & Timeline */}
                    <div>
                        <Card variant="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>Progression Actuelle</h2>
                                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                    {Math.round((progress / work.total) * 100)}%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', marginBottom: '2rem' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(progress / work.total) * 100}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{ height: '100%', background: 'var(--gradient-primary)' }}
                                />
                            </div>

                            <ProgressButton
                                current={progress}
                                total={work.total}
                                onUpdate={setProgress}
                                label={work.type === 'Manga' ? 'Lire le chapitre' : 'Regarder l\'épisode'}
                            />
                        </Card>

                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Arcs Narratifs</h3>
                        <div style={{ paddingLeft: '1rem' }}>
                            {MOCK_ARCS.map((arc, i) => {
                                const isCompleted = progress >= arc.end;
                                const isActive = progress >= arc.start && progress < arc.end;

                                return (
                                    <motion.div
                                        key={arc.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        style={{ display: 'flex', gap: '1.5rem', paddingBottom: '2.5rem', position: 'relative' }}
                                    >
                                        {/* Timeline Node */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div className={`${styles.timelineNode} ${isCompleted || isActive ? styles.active : ''}`}>
                                                {isCompleted && <Check size={12} color="#fff" style={{ position: 'absolute', top: '2px', left: '2px' }} />}
                                            </div>
                                            {i < MOCK_ARCS.length - 1 && (
                                                <div className={styles.timelineLine} style={{ background: isCompleted ? 'var(--color-primary)' : 'var(--glass-border)' }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <Card
                                            className={isActive ? 'animate-pulse' : ''}
                                            style={{
                                                flex: 1,
                                                padding: '1rem',
                                                borderLeft: `4px solid ${isActive ? 'var(--color-primary)' : (isCompleted ? arc.color : 'var(--glass-border)')}`,
                                                opacity: isCompleted || isActive ? 1 : 0.5
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h4 style={{ fontWeight: 700 }}>{arc.title}</h4>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                                                    {work.type === 'Manga' ? 'Ch.' : 'Ep.'} {arc.start} - {arc.end}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>{arc.description}</p>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar Stats using Grid */}
                    <div>
                        <Card variant="glass">
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                Statistiques
                            </h3>

                            <div className={styles.statsGrid} style={{ gridTemplateColumns: '1fr' }}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}><BookOpen size={14} style={{ display: 'inline', marginRight: '0.5rem' }} /> Chapitres Lus</span>
                                    <span className={styles.statValue}>{progress}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}><Clock size={14} style={{ display: 'inline', marginRight: '0.5rem' }} /> Temps Passé</span>
                                    <span className={styles.statValue}>42h</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}><Star size={14} style={{ display: 'inline', marginRight: '0.5rem' }} /> Score Moyen</span>
                                    <span className={styles.statValue}>9.5</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-secondary)' }}>Succès Proche</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '50%' }} />
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dévoreur d'Arc</p>
                                        <div style={{ width: '100px', height: '4px', background: '#333', marginTop: '4px', borderRadius: '2px' }}>
                                            <div style={{ width: '80%', height: '100%', background: 'var(--color-secondary)' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
