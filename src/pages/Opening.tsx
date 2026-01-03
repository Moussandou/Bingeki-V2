import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import styles from '@/styles/Opening.module.css';
import { Card } from '@/components/ui/Card';
import { HunterLicenseCard } from '@/components/HunterLicenseCard';
import { Search, Check, Users, MessageCircle, Heart, TrendingUp, ChevronUp, History as HistoryIcon, Trophy, Star, ArrowRight } from 'lucide-react';

// Counter Component for Animated Numbers
function Counter({ from, to }: { from: number; to: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(from);

    useEffect(() => {
        if (isInView) {
            const duration = 2000;
            const start = performance.now();

            const animate = (time: number) => {
                const elapsed = time - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out quart
                const ease = 1 - Math.pow(1 - progress, 4);

                setCount(Math.floor(from + (to - from) * ease));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }
    }, [isInView, from, to]);

    return <span ref={ref}>{count}</span>;
}

interface SearchResult {
    id?: number;
    title: string;
    type: string;
    score: number;
    image: string;
}

import { getTopWorks } from '@/services/animeApi';

export default function Opening() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [placeholderText, setPlaceholderText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [resultsByGenre, setResultsByGenre] = useState<Record<string, SearchResult[]>>({});
    const [qgMangaList, setQgMangaList] = useState<SearchResult[]>([]);

    // Refs for scroll trigger animations
    // Refs for scroll trigger animations
    const progressionRef = useRef(null);
    // const isProgressionInView = useInView(progressionRef, { once: true, amount: 0.3 }); // Removed to fix layout shift

    const commentsRef = useRef(null);
    const areCommentsInView = useInView(commentsRef, { once: true, amount: 0.3 });
    const [visibleComments, setVisibleComments] = useState<any[]>([]);

    const mockComments = [
        { user: "Levi", text: "Ce chapitre était incroyable !! 🔥", time: "2m" },
        { user: "Armin", text: "Je ne m'attendais pas à ça...", time: "5m" },
        { user: "Mikasa", text: "Eren...", time: "12m" }
    ];

    useEffect(() => {
        if (areCommentsInView && visibleComments.length < mockComments.length) {
            // Instant start for first comment
            const interval = setInterval(() => {
                setVisibleComments(prev => {
                    if (prev.length < mockComments.length) {
                        return [...prev, mockComments[prev.length]];
                    }
                    clearInterval(interval);
                    return prev;
                });
            }, 800); // Slightly faster
            return () => clearInterval(interval);
        }
    }, [areCommentsInView, visibleComments, mockComments]);

    // Typewriter effect data
    const placeholders = ['Seinen', 'Shonen', 'Romance', 'Horreur', 'Isekai'];

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch data from API
    // Fetch data from API
    const dataFetched = useRef(false);

    useEffect(() => {
        // Skip if already fetched and has data
        if (dataFetched.current && qgMangaList.length > 0) return;

        const fetchDisplayData = async () => {
            // Fetch Q.G. Section Data (Top Manga)
            try {
                const topManga = await getTopWorks('manga', 'bypopularity', 6);
                if (topManga.length > 0) {
                    setQgMangaList(topManga.map(m => ({
                        id: m.mal_id,
                        title: m.title,
                        type: 'Manga',
                        score: m.score || 0,
                        image: m.images.jpg.large_image_url || m.images.jpg.image_url
                    })));
                    dataFetched.current = true;
                }
            } catch (e) {
                console.error("Failed to fetch top manga", e);
            }

            // Static "Top" results to ensure reliable display
            const staticResults: Record<string, SearchResult[]> = {
                'Seinen': [
                    { title: "Berserk", type: "Manga", score: 9.47, image: "https://cdn.myanimelist.net/images/manga/1/157897l.jpg" },
                    { title: "Vinland Saga", type: "Manga", score: 9.05, image: "https://cdn.myanimelist.net/images/manga/2/188925.jpg" },
                    { title: "Vagabond", type: "Manga", score: 9.24, image: "https://cdn.myanimelist.net/images/manga/1/259070.jpg" }
                ],
                'Shonen': [
                    { title: "One Piece", type: "Manga", score: 9.22, image: "https://cdn.myanimelist.net/images/manga/2/253146l.jpg" },
                    { title: "Shingeki no Kyojin", type: "Manga", score: 8.55, image: "https://cdn.myanimelist.net/images/manga/2/37846l.jpg" },
                    { title: "Chainsaw Man", type: "Manga", score: 8.69, image: "https://cdn.myanimelist.net/images/manga/3/216464l.jpg" }
                ],
                'Romance': [
                    { title: "Kaguya-sama", type: "Manga", score: 8.89, image: "https://cdn.myanimelist.net/images/manga/3/188896l.jpg" },
                    { title: "Horimiya", type: "Manga", score: 8.41, image: "https://cdn.myanimelist.net/images/manga/2/245008l.jpg" },
                    { title: "Nisekoi", type: "Manga", score: 7.71, image: "https://cdn.myanimelist.net/images/manga/1/181212l.jpg" }
                ],
                'Horreur': [
                    { title: "Berserk", type: "Manga", score: 9.47, image: "https://cdn.myanimelist.net/images/manga/1/157897l.jpg" },
                    { title: "Tokyo Ghoul", type: "Manga", score: 8.54, image: "https://cdn.myanimelist.net/images/manga/3/114037l.jpg" },
                    { title: "Gantz", type: "Manga", score: 8.56, image: "https://cdn.myanimelist.net/images/manga/1/278020l.jpg" }
                ],
                'Isekai': [
                    { title: "Mushoku Tensei", type: "Manga", score: 8.09, image: "https://cdn.myanimelist.net/images/manga/2/181049l.jpg" },
                    { title: "Re:Zero", type: "Manga", score: 8.36, image: "https://cdn.myanimelist.net/images/manga/1/129447l.jpg" },
                    { title: "Tensura (Slime)", type: "Manga", score: 8.36, image: "https://cdn.myanimelist.net/images/manga/3/167639l.jpg" }
                ]
            };
            setResultsByGenre(staticResults);
        };

        fetchDisplayData();
    }, [qgMangaList.length]);

    // Typewriter Logic
    useEffect(() => {
        const currentWord = placeholders[placeholderIndex];
        const typeSpeed = isDeleting ? 50 : 150;

        const timer = setTimeout(() => {
            if (!isDeleting && placeholderText === currentWord) {
                setTimeout(() => setIsDeleting(true), 3500); // Increased pause to let user see results
            } else if (isDeleting && placeholderText === '') {
                setIsDeleting(false);
                setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
            } else {
                setPlaceholderText(currentWord.substring(0, placeholderText.length + (isDeleting ? -1 : 1)));
            }
        }, typeSpeed);

        return () => clearTimeout(timer);
    }, [placeholderText, isDeleting, placeholderIndex, placeholders]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Mock Data
    const mockUser = {
        uid: 'demo',
        email: 'hero@bingeki.com',
        displayName: 'Eren Jaeger',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eren',
        createdAt: 0,
        settings: { theme: 'light', notifications: true }
    };

    // Data source for display
    const currentGenre = placeholders[placeholderIndex];
    const displayResults = resultsByGenre[currentGenre] || [];

    // Determine if typing is finished (full word is displayed and not deleting yet)
    // We add a small artificial delay check: results appear only when we are waiting at the full word
    const isTypingFinished = !isDeleting && placeholderText === currentGenre;



    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.halftoneBg} />
                <div className={styles.speedLines} />

                {/* HERO */}
                <header className={styles.heroSection}>
                    <motion.h1
                        className={styles.heroTitle}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        VOTRE HISTOIRE<br />COMMENCE
                    </motion.h1>
                    <motion.div
                        className={styles.heroSubtitle}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Ne soyez plus un simple spectateur. Devenez le protagoniste.
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        style={{ marginTop: '2rem' }}
                    >
                        <Link to="/auth">
                            <button className={styles.ctaButton}>COMMENCER L'AVENTURE</button>
                        </Link>
                    </motion.div>
                </header>

                {/* SECTION 1: TRACKING (LE Q.G.) */}
                <section className={styles.featureSection}>
                    <div className={styles.textContent}>
                        <div className={styles.sfx} style={{ top: -50, left: -20, fontSize: '8rem', color: '#808080', opacity: 0.1, transform: 'rotate(-10deg)' }}>SUIVI !!</div>
                        <h2 className={styles.sectionTitle}>LE Q.G.</h2>
                        <div className={styles.sectionDescription}>
                            <p>Organisez votre vidéothèque comme un stratège.</p>
                            <p style={{ marginTop: '1rem' }}>Séparez vos lectures en cours, vos pauses, et vos archives. Ne perdez plus jamais le fil de vos intrigues favorites.</p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontWeight: 900, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={20} /> CHAPITRES</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={20} /> ÉPISODES</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={20} /> TOMES</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.visualContent}>
                        <div className={styles.mockupContainer} style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {qgMangaList.map((manga, i) => (
                                <motion.div
                                    key={manga.id || i}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    whileHover={{ scale: 1.1, zIndex: 10 }}
                                    style={{ transform: i % 2 === 0 ? 'translateY(20px)' : 'translateY(-20px)' }}
                                >
                                    <Card variant="manga" hoverable style={{ padding: 0, boxShadow: '6px 6px 0 rgba(0,0,0,0.1)' }}>
                                        <div style={{ aspectRatio: '2/3', background: '#333' }}>
                                            <img src={manga.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 2: PROGRESSION (ZIGZAG REVERSE) */}
                <section className={`${styles.featureSection} ${styles.featureSectionReverse}`} ref={progressionRef}>
                    <div className={styles.textContent}>
                        <div className={styles.sfx} style={{ top: -40, right: 0, fontSize: '6rem', color: '#808080', opacity: 0.1, transform: 'rotate(5deg)' }}>LEVEL UP</div>
                        <h2 className={styles.sectionTitle}>PROGRESSION</h2>
                        <div className={styles.sectionDescription}>
                            <p>Chaque chapitre lu vous rend plus fort.</p>
                            <p style={{ marginTop: '1rem' }}>Gagnez de l'XP en mettant à jour votre liste. Débloquez des <strong>Badges Holographiques</strong> et grimpez les rangs de la Hunter Society.</p>
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff', border: '2px solid #000', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <TrendingUp size={32} />
                                <div>
                                    <div style={{ fontWeight: 900 }}>STATISTIQUES DÉTAILLÉES</div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                        Niveau <Counter from={0} to={42} /> • XP <Counter from={0} to={2800} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.visualContent} ${styles.progressionVisual}`}>
                        <div className={`${styles.mockupContainer} ${styles.mockupWrapper}`}>
                            <HunterLicenseCard
                                user={mockUser as any}
                                stats={{
                                    level: 42,
                                    xp: 2800,
                                    xpToNextLevel: 3000,
                                    streak: 15,
                                    badgeCount: 8,
                                    totalWorksCompleted: 124
                                }}
                                top3FavoritesData={[
                                    { id: '1', title: 'Berserk', image: 'https://cdn.myanimelist.net/images/manga/1/157897l.jpg' },
                                    { id: '2', title: 'One Piece', image: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg' },
                                    { id: '3', title: 'Vagabond', image: 'https://cdn.myanimelist.net/images/manga/1/259070.jpg' }
                                ]}
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 3: EXPLORATION */}
                <section className={styles.featureSection}>
                    <div className={styles.textContent}>
                        <div className={styles.sfx} style={{ bottom: -30, left: 20, fontSize: '5rem', color: '#808080', opacity: 0.1 }}>WAKU WAKU</div>
                        <h2 className={styles.sectionTitle}>EXPLORATION</h2>
                        <div className={styles.sectionDescription}>
                            <p>Une base de données infinie à portée de main.</p>
                            <p style={{ marginTop: '1rem' }}>Recherchez parmis des milliers d'Anime et Manga. Filtrez par genre, score, ou popularité. Trouvez votre prochaine addiction en quelques secondes.</p>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {placeholders.map((genre, i) => (
                                <span key={genre}
                                    onClick={() => { setPlaceholderIndex(i); setPlaceholderText(''); setIsDeleting(false); }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: i === placeholderIndex ? 'var(--color-primary)' : '#000',
                                        color: '#fff',
                                        fontWeight: 700,
                                        borderRadius: '0',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover:scale-105"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.visualContent}>
                        <div className={styles.mockupContainer} style={{ width: '90%', minHeight: '440px' }}>
                            <Card variant="manga" hoverable style={{ padding: '0.5rem', background: '#fff', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Search style={{ marginRight: '1rem', marginLeft: '0.5rem' }} />
                                    <div
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            width: '100%',
                                            fontSize: '1.2rem',
                                            fontFamily: 'var(--font-heading)',
                                            background: 'transparent',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span style={{ opacity: 0.5 }}>{placeholderText || "Rechercher un anime, un manga..."}</span>
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                            style={{ marginLeft: '1px', fontSize: '1.2rem', fontWeight: 300 }}
                                        >
                                            |
                                        </motion.span>
                                    </div>
                                </div>
                            </Card>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {isTypingFinished && displayResults.map((res, index) => (
                                    <motion.div
                                        key={`${currentGenre}-${res.title}`} // Unique key to force re-render on genre change
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                                    >
                                        <Card variant="manga" hoverable style={{ display: 'flex', padding: 0, overflow: 'hidden', alignItems: 'center' }}>
                                            <img src={res.image} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                            <div style={{ padding: '0 1rem', flex: 1 }}>
                                                <div style={{ fontWeight: 900 }}>{res.title}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{res.type} • ★ {res.score}</div>
                                            </div>
                                            <div style={{ padding: '0 1.5rem' }}>
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #000' }} />
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 4: SOCIAL (NEW) */}
                <section className={`${styles.featureSection} ${styles.featureSectionReverse}`} ref={progressionRef}>
                    <div className={styles.textContent}>
                        <h2 className={styles.sectionTitle}>COMMUNAUTÉ</h2>
                        <div className={styles.sectionDescription}>
                            <p>Vous n'êtes pas seul dans ce monde.</p>
                            <p style={{ marginTop: '1rem' }}>Suivez l'activité de vos amis. Partagez vos avis sans spoil. Comparez vos collections et vos badges.</p>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Users size={32} style={{ marginBottom: '0.5rem' }} />
                                <span style={{ fontWeight: 800 }}>AMIS</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <MessageCircle size={32} style={{ marginBottom: '0.5rem' }} />
                                <span style={{ fontWeight: 800 }}>DÉBATS</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Heart size={32} style={{ marginBottom: '0.5rem' }} />
                                <span style={{ fontWeight: 800 }}>PARTAGE</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.visualContent} ref={commentsRef}>
                        <div className={styles.mockupContainer} style={{ width: '80%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
                                <AnimatePresence>
                                    {visibleComments.map((comment) => (
                                        <motion.div
                                            key={comment.text}
                                            initial={{ opacity: 0, x: -50, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ type: "spring", stiffness: 120, damping: 15 }}
                                        >
                                            <Card hoverable variant="manga" style={{ padding: '1rem', background: '#fff', borderLeft: '4px solid var(--color-primary)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 900 }}>@{comment.user}</span>
                                                    <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{comment.time}</span>
                                                </div>
                                                <p style={{ fontSize: '0.9rem' }}>{comment.text}</p>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {visibleComments.length === mockComments.length && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ textAlign: 'center', marginTop: '1rem' }}
                                    >
                                        <button style={{ background: '#000', color: '#fff', border: 'none', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>VOIR LA DISCUSSION</button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 4.5: DETAILS SHOWCASE (NEW) */}
                <section className={styles.featureSection}>
                    <div className={styles.textContent}>
                        <div className={styles.sfx} style={{ bottom: -40, left: 10, fontSize: '6rem', color: '#808080', opacity: 0.1, transform: 'rotate(-5deg)' }}>FOCUS</div>
                        <h2 className={styles.sectionTitle}>TOUT SAVOIR</h2>
                        <div className={styles.sectionDescription}>
                            <p>Plongez au cœur de vos œuvres.</p>
                            <p style={{ marginTop: '1rem' }}>Synopsis, staff, statistiques détaillées, personnages... Accédez à une fiche d'identité complète pour chaque Anime et Manga. Ne ratez aucun détail.</p>
                        </div>
                    </div>

                    <div className={styles.visualContent}>
                        <div className={styles.mockupContainer} style={{ width: '90%' }}>
                            <Link to="/work/113138?type=manga" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <div style={{
                                        background: '#fff',
                                        border: '4px solid #000',
                                        boxShadow: '8px 8px 0 #000',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        {/* Fake WorkDetails Header/Cover */}
                                        <div style={{ height: '160px', position: 'relative', overflow: 'hidden', background: '#333' }}>
                                            <img
                                                src="https://cdn.myanimelist.net/images/manga/3/210341l.jpg"
                                                alt="JJK Banner"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, objectPosition: 'center 25%' }}
                                            />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />

                                            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                                                {/* Mini Poster */}
                                                <div style={{ width: '80px', height: '120px', border: '3px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', marginBottom: '-3rem', zIndex: 10, background: '#000' }}>
                                                    <img src="https://cdn.myanimelist.net/images/manga/3/210341l.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>

                                                <div style={{ paddingBottom: '0.5rem' }}>
                                                    <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1, textShadow: '2px 2px 0 #000' }}>
                                                        JUJUTSU KAISEN
                                                    </h3>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fff', color: '#000', padding: '2px 6px' }}>MANGA</span>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--color-primary)', color: '#000', padding: '2px 6px', border: '1px solid #000' }}>EN COURS</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fake Tabs & Content */}
                                        <div style={{ padding: '1rem 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {/* Tabs Mockup */}
                                            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem', paddingLeft: '90px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 900, borderBottom: '3px solid #000', paddingBottom: '0.5rem', marginBottom: '-0.6rem' }}>GÉNÉRAL</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.4 }}>CHAPITRES</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.4 }}>STATS</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.4 }}>AVIS</span>
                                            </div>

                                            {/* Content Area */}
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                    <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.5, color: '#444', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        Pour sauver ses amis, Yuji Itadori avale un doigt maudit et partage désormais son corps avec Ryomen Sukuna, le plus puissant des fléaux.
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '80px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 800 }}>
                                                            <Trophy size={16} /> #4
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 800 }}>
                                                            <Star size={16} fill="black" /> 8.64
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ background: '#000', color: '#fff', textAlign: 'center', padding: '0.8rem', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                    VOIR LA FICHE COMPLÈTE <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: CHANGELOG / BUILDING IN PUBLIC */}
                <section className={`${styles.featureSection} ${styles.featureSectionReverse}`}>
                    <div className={styles.textContent}>
                        <div className={styles.sfx} style={{ top: -30, right: 20, fontSize: '4rem', color: '#808080', opacity: 0.1, transform: 'rotate(-5deg)' }}>BETA</div>
                        <h2 className={styles.sectionTitle}>WORK IN PROGRESS</h2>
                        <div className={styles.sectionDescription}>
                            <p>Bingeki est vivant. Il évolue.</p>
                            <p style={{ marginTop: '1rem' }}>Je construis cette plateforme avec vous. Suivez chaque mise à jour, suggérez des fonctionnalités, et voyez vos idées prendre vie. </p>
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            <Link to="/changelog">
                                <button style={{
                                    background: 'var(--color-primary)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '1rem 2rem',
                                    fontSize: '1rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                    className="hover:scale-105 transition-transform"
                                >
                                    <HistoryIcon size={20} />
                                    VOIR LA ROADMAP
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className={styles.visualContent}>
                        <div className={styles.mockupContainer} style={{ width: '90%', height: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                            <div style={{
                                borderLeft: '4px dashed #000',
                                paddingLeft: '2rem',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2rem'
                            }}>
                                {/* Timeline Item 1 */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '-2.6rem', top: 0, width: '20px', height: '20px', background: 'var(--color-primary)', borderRadius: '50%', border: '4px solid #000'
                                    }} />
                                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '4px', border: '3px solid #000', boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>Feedback & Changelog 2.0</span>
                                            <span style={{ fontSize: '0.8rem', background: 'var(--color-primary)', color: '#000', padding: '0.1rem 0.5rem', fontWeight: 800, border: '1px solid #000' }}>V1.2.0</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#555' }}>Refonte complète du système de feedback et de l'affichage des mises à jour.</p>
                                    </div>
                                </div>

                                {/* Timeline Item 2 */}
                                <div style={{ position: 'relative', opacity: 0.7 }}>
                                    <div style={{
                                        position: 'absolute', left: '-2.6rem', top: 0, width: '20px', height: '20px', background: '#ccc', borderRadius: '50%', border: '4px solid #000'
                                    }} />
                                    <div style={{ background: '#f4f4f4', padding: '1.5rem', borderRadius: '4px', border: '3px solid #000' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>Système de "Guildes"</span>
                                            <span style={{ fontSize: '0.8rem', border: '1px solid #000', color: '#000', padding: '0.1rem 0.5rem', fontWeight: 800 }}>SOON</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#555' }}>Créez votre propre clan, participez à des guerres de guildes et dominez le classement.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className={styles.ctaSection}>
                    <motion.div
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
                    >
                        <h2 style={{ fontSize: 'min(3rem, 10vw)', marginBottom: '2rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                            REJOIGNEZ L'ÉLITE
                        </h2>
                        <Link to="/auth">
                            <button className={styles.ctaButton}>
                                CRÉER MON COMPTE
                            </button>
                        </Link>
                    </motion.div>
                </section>

                {/* SCROLL TOP BUTTON */}
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToTop}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            width: '50px',
                            height: '50px',
                            background: '#000',
                            color: '#fff',
                            border: '2px solid var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 100,
                            boxShadow: '4px 4px 0 var(--color-primary)'
                        }}
                    >
                        <ChevronUp size={24} />
                    </motion.button>
                )}

            </div>
        </Layout>
    );
}
