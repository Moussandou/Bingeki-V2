import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import styles from '@/styles/Opening.module.css';

export default function Opening() {
    return (
        <Layout>
            <div className={styles.container}>
                {/* Background Textures */}
                <div className={styles.halftoneBg} />
                <div className={styles.speedLines} />

                {/* HERO SECTION */}
                <header className={styles.heroSection}>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: -2 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    >
                        <h1 className={styles.heroTitle}>
                            VOTRE HISTOIRE<br />COMMENCE
                        </h1>
                    </motion.div>

                    <motion.div
                        className={styles.heroSubtitle}
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Ne soyez plus un simple spectateur.<br />
                        Devenez le protagoniste de vos lectures.
                    </motion.div>
                </header>

                {/* MANGA GRID */}
                <main className={styles.panelsGrid}>

                    {/* Panel 1: Tracking (Large) */}
                    <motion.div
                        className={`${styles.panel} ${styles.panelLarge}`}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className={styles.sfx} style={{ top: '10%', right: '5%', fontSize: '12rem', transform: 'rotate(15deg)' }}>
                            SUIVI !!
                        </div>
                        {/* Placeholder for an image or illustration */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.9))', zIndex: 1 }} />

                        <h2 className={styles.panelTitle}>Le Q.G.</h2>
                        <p className={styles.panelText}>
                            Organisez votre collection. Suivez chaque chapitre, chaque épisode.<br />
                            Ne perdez jamais le fil de l'intrigue.
                        </p>
                    </motion.div>

                    {/* Panel 2: Gamification (Medium) */}
                    <motion.div
                        className={`${styles.panel} ${styles.panelMedium}`}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className={styles.sfx} style={{ top: '20%', left: '10%', fontSize: '6rem', transform: 'rotate(-5deg)' }}>
                            LEVEL UP
                        </div>
                        <h2 className={styles.panelTitle}>Progression</h2>
                        <p className={styles.panelText}>
                            Gagnez de l'XP en lisant. Débloquez des badges.<br />
                            Grimpez les échelons de la société des fans.
                        </p>
                    </motion.div>

                    {/* Panel 3: Library (Medium) */}
                    <motion.div
                        className={`${styles.panel} ${styles.panelMedium}`}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className={styles.sfx} style={{ bottom: '40%', right: '10%', fontSize: '5rem' }}>
                            WAKU WAKU
                        </div>
                        <h2 className={styles.panelTitle}>Bibliothèque</h2>
                        <p className={styles.panelText}>
                            Découvrez votre prochain coup de cœur parmi des milliers d'œuvres.<br />
                            Manga, Manhwa, Anime. Tout est là.
                        </p>
                    </motion.div>

                </main>

                {/* CALL TO ACTION */}
                <section className={styles.ctaSection}>
                    <motion.div
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
                    >
                        <h2 style={{ fontSize: '3rem', marginBottom: '2rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                            Prêt pour l'aventure ?
                        </h2>
                        <Link to="/auth">
                            <button className={styles.ctaButton}>
                                Rejoindre l'élite
                            </button>
                        </Link>
                    </motion.div>
                </section>
            </div>
        </Layout>
    );
}
