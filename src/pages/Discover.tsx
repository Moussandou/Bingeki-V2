import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Carousel } from '@/components/ui/Carousel';
import { searchWorks, getTopWorks, getSeasonalAnime, type JikanResult } from '@/services/animeApi';
import { useLibraryStore } from '@/store/libraryStore';
import { useAuthStore } from '@/store/authStore';
import { Search, Check, Loader2, Flame, Sparkles, Star, Dice5, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AddWorkModal } from '@/components/AddWorkModal';
import { FriendRecommendations } from '@/components/FriendRecommendations';
import styles from './Discover.module.css';

export default function Discover() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [searchResults, setSearchResults] = useState<JikanResult[]>([]);
    const [loading, setLoading] = useState(false);

    // Carousel Data States
    const [seasonalAnime, setSeasonalAnime] = useState<JikanResult[]>([]);
    const [topAnime, setTopAnime] = useState<JikanResult[]>([]);
    const [popularManga, setPopularManga] = useState<JikanResult[]>([]);
    const [topManga, setTopManga] = useState<JikanResult[]>([]);


    const [selectedWork, setSelectedWork] = useState<JikanResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { works } = useLibraryStore();
    const libraryIds = new Set(works.map(w => w.id));

    const dataFetched = useRef(false);

    const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

    const GENRES = [
        { id: 1, label: 'Action' },
        { id: 2, label: 'Adventure' },
        { id: 4, label: 'Comedy' },
        { id: 8, label: 'Drama' },
        { id: 10, label: 'Fantasy' },
        { id: 24, label: 'Sci-Fi' }
    ];

    // Fetch Home Data
    useEffect(() => {
        if (dataFetched.current) return;
        dataFetched.current = true;

        const fetchHomeData = async () => {
            // No global loading - progressive loading handles UI
            try {
                // Stagger requests to avoid 429 Rate Limit (Jikan is strict)
                const season = await getSeasonalAnime(15);
                if (season.length > 0) setSeasonalAnime(season);
                await new Promise(r => setTimeout(r, 600));

                const topA = await getTopWorks('anime', 'favorite', 15);
                if (topA.length > 0) setTopAnime(topA);
                await new Promise(r => setTimeout(r, 600));

                const popM = await getTopWorks('manga', 'bypopularity', 15);
                if (popM.length > 0) setPopularManga(popM);
                await new Promise(r => setTimeout(r, 600));

                const topM = await getTopWorks('manga', 'favorite', 15);
                if (topM.length > 0) setTopManga(topM);

            } catch (error) {
                console.error("Failed to load discovery data", error);
            }
        };
        fetchHomeData();
    }, []);

    // Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setLoading(true);
                // Clear genre if searching by text
                if (selectedGenre) setSelectedGenre(null);
                const results = await searchWorks(searchQuery);
                setSearchResults(results);
                setLoading(false);
            } else if (selectedGenre) {
                setLoading(true);
                setSearchResults([]); // Clear previous results immediately
                // Search by genre (empty query, specific genre)
                const results = await searchWorks('', 'manga', { genres: selectedGenre.toString() });
                setSearchResults(results);
                setLoading(false);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedGenre]);

    const handleGenreClick = (id: number) => {
        setSearchQuery('');
        setSelectedGenre(id === selectedGenre ? null : id);
    };

    const handleWorkClick = (work: JikanResult) => {
        navigate(`/work/${work.mal_id}?type=${work.type?.toLowerCase() || 'anime'}`);
    };

    const handleQuickAdd = (work: JikanResult) => {
        if (!user) {
            navigate('/auth');
            return;
        }
        setSelectedWork(work);
        setIsModalOpen(true);
    };

    const [heroWork, setHeroWork] = useState<JikanResult | null>(null);

    // Update hero when data loads
    useEffect(() => {
        if (seasonalAnime.length > 0) {
            setHeroWork(seasonalAnime[0]);
        } else if (topAnime.length > 0) {
            setHeroWork(topAnime[0]);
        }
    }, [seasonalAnime, topAnime]);

    // Handle Surprise Me
    const handleSurpriseMe = () => {
        const allWorks = [...seasonalAnime, ...topAnime, ...popularManga, ...topManga];
        if (allWorks.length > 0) {
            const random = allWorks[Math.floor(Math.random() * allWorks.length)];
            handleWorkClick(random);
        }
    };

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)', paddingBottom: '6rem' }}>

                {/* Guest Banner */}
                {!user && (
                    <div style={{
                        background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                        color: '#fff',
                        padding: '1rem 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        borderBottom: '3px solid var(--color-primary)'
                    }}>
                        <div>
                            <p style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                ✨ Créez un compte pour débloquer toutes les fonctionnalités !
                            </p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                Bibliothèque personnelle, suivi de progression, badges, classements et plus encore...
                            </p>
                        </div>
                        <Button onClick={() => navigate('/auth')} variant="primary" size="sm">
                            S'inscrire gratuitement
                        </Button>
                    </div>
                )}


                {/* Hero Section */}
                {heroWork && !searchQuery && (
                    <div className={styles.heroSection}>
                        {/* Background */}
                        <div
                            className={styles.heroBackground}
                            style={{ backgroundImage: `url(${heroWork.images.jpg.large_image_url})` }}
                        />

                        <div className={`container ${styles.heroContainer}`}>
                            {/* Hero Image */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className={styles.heroImageContainer}
                            >
                                <img
                                    src={heroWork.images.jpg.large_image_url}
                                    alt={heroWork.title}
                                    className={styles.heroImage}
                                />
                            </motion.div>

                            {/* Hero Content */}
                            <div className={styles.heroContent}>
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary)', color: '#fff', padding: '0.5rem 1rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', boxShadow: '4px 4px 0 #000' }}>
                                        <Flame size={18} fill="#fff" /> A LA UNE
                                    </div>
                                    <h1 className={styles.heroTitle}>
                                        {heroWork.title}
                                    </h1>
                                    <p className={styles.heroSynopsis}>
                                        {heroWork.synopsis}
                                    </p>

                                    <div className={styles.heroActions}>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={() => handleQuickAdd(heroWork)}
                                            icon={<Plus size={24} />}
                                            style={{
                                                fontSize: '1.1rem',
                                                padding: '0.75rem 1.5rem',
                                                border: 'none',
                                                boxShadow: '4px 4px 0 #000',
                                                background: 'var(--color-primary)',
                                                color: '#fff'
                                            }}
                                        >
                                            AJOUTER À MA LISTE
                                        </Button>
                                        <Button
                                            variant="manga"
                                            size="lg"
                                            onClick={() => navigate(`/work/${heroWork.mal_id}?type=${heroWork.type?.toLowerCase() || 'anime'}`)}
                                            style={{
                                                fontSize: '1.1rem',
                                                padding: '0.75rem 1.5rem',
                                                background: '#fff',
                                                color: '#000',
                                                borderColor: '#000'
                                            }}
                                        >
                                            PLUS DE DÉTAILS
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="container" style={{ marginTop: '3rem' }}>
                    {/* Search Section */}
                    <div style={{ margin: '0 auto 4rem', maxWidth: '800px' }}>
                        <Card
                            variant="manga"
                            style={{
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                background: '#fff',
                                borderWidth: '3px',
                                borderStyle: 'solid',
                                borderColor: '#000',
                                boxShadow: '8px 8px 0 #000'
                            }}
                            whileHover={{
                                borderColor: 'var(--color-primary)',
                                boxShadow: '8px 8px 0 var(--color-primary)'
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            <Search size={28} style={{ marginLeft: '1rem', opacity: 0.4 }} />
                            <input
                                placeholder="Rechercher un anime, un manga..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '1.5rem',
                                    background: 'transparent',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 700,
                                    padding: '1rem 0'
                                }}
                            />
                        </Card>

                        {/* Quick Genres */}
                        {!searchQuery && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                {GENRES.map(genre => {
                                    const isActive = selectedGenre === genre.id;
                                    return (
                                        <button
                                            key={genre.id}
                                            onClick={() => handleGenreClick(genre.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0',
                                                border: isActive ? 'none' : '2px solid #000',
                                                background: isActive ? 'var(--color-primary)' : '#fff',
                                                color: isActive ? '#fff' : '#000',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: isActive ? 'inset 2px 2px 5px rgba(0,0,0,0.2)' : '2px 2px 0 #000',
                                                transform: isActive ? 'translate(1px, 1px)' : 'none'
                                            }}
                                        >
                                            {genre.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    {searchQuery.length > 2 || selectedGenre ? (
                        /* Search Results */
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '2rem', color: '#000', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Search size={32} />
                                {selectedGenre
                                    ? `Résultats pour le genre "${GENRES.find(g => g.id === selectedGenre)?.label}"`
                                    : `Résultats pour "${searchQuery}"`
                                }
                            </h2>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                    <Loader2 className="spin" size={48} />
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '2rem'
                                }}>
                                    {searchResults.map((work) => {
                                        const isOwned = libraryIds.has(work.mal_id);
                                        return (
                                            <motion.div key={work.mal_id} whileHover={{ y: -5 }}>
                                                <Card
                                                    variant="manga"
                                                    hoverable
                                                    style={{
                                                        padding: 0,
                                                        overflow: 'hidden',
                                                        height: '100%',
                                                        border: '2px solid #000',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}
                                                    onClick={() => handleWorkClick(work)}
                                                >
                                                    <div style={{ position: 'relative', aspectRatio: '2/3', borderBottom: '2px solid #000', flexShrink: 0 }}>
                                                        <img src={work.images.jpg.image_url} alt={work.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        {isOwned && (
                                                            <div style={{ position: 'absolute', top: 5, right: 5, background: '#000', color: '#fff', padding: '4px', borderRadius: '0' }}>
                                                                <Check size={14} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ padding: '1rem', background: '#fff', flex: 1 }}>
                                                        <h3 style={{
                                                            fontSize: '1rem',
                                                            fontWeight: 800,
                                                            fontFamily: 'var(--font-heading)',
                                                            lineHeight: 1.2,
                                                            marginBottom: '0.5rem',
                                                            overflow: 'hidden',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical'
                                                        }}>{work.title}</h3>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.7 }}>
                                                            <span style={{ fontWeight: 600 }}>{work.type}</span>
                                                            {work.score && <span>★ {work.score}</span>}
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Home Content */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Surprise Me Section */}
                            <div style={{ marginBottom: '2rem' }}>
                                <Card variant="manga" style={{
                                    padding: '2rem',
                                    background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '2rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <div>
                                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>
                                            En panne d'inspiration ?
                                        </h2>
                                        <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>Laisse le destin choisir ta prochaine aventure.</p>
                                    </div>
                                    <Button
                                        variant="manga"
                                        onClick={handleSurpriseMe}
                                        icon={<Dice5 size={24} />}
                                        style={{
                                            fontSize: '1.2rem',
                                            padding: '1rem 2rem',
                                            background: '#fff',
                                            border: 'none',
                                            color: '#000',
                                            boxShadow: '4px 4px 0 #000',
                                            transition: 'all 0.2s'
                                        }}
                                        whileHover={{
                                            borderColor: 'var(--color-primary)',
                                            color: 'var(--color-primary)',
                                            boxShadow: '4px 4px 0 var(--color-primary)'
                                        }}
                                    >
                                        SURPRENDS-MOI
                                    </Button>
                                </Card>
                            </div>

                            {/* Carousels */}
                            <Carousel
                                title={<><Flame size={24} color="#ef4444" /> Anime de la Saison</>}
                                items={seasonalAnime}
                                onItemClick={handleWorkClick}
                                libraryIds={libraryIds}
                                onAdd={handleQuickAdd}
                                loading={seasonalAnime.length === 0}
                            />

                            <Carousel
                                title={<><Sparkles size={24} color="#eab308" /> Top 10 Animes</>}
                                items={topAnime}
                                onItemClick={handleWorkClick}
                                libraryIds={libraryIds}
                                onAdd={handleQuickAdd}
                                loading={topAnime.length === 0}
                                showRank
                            />

                            <Carousel
                                title={<><TrendingUp size={24} color="var(--color-primary)" /> Mangas Populaires</>}
                                items={popularManga}
                                onItemClick={handleWorkClick}
                                libraryIds={libraryIds}
                                onAdd={handleQuickAdd}
                                loading={popularManga.length === 0}
                            />

                            <Carousel
                                title={<><Star size={24} color="#f59e0b" /> Top 10 Mangas</>}
                                items={topManga}
                                onItemClick={handleWorkClick}
                                libraryIds={libraryIds}
                                onAdd={handleQuickAdd}
                                loading={topManga.length === 0}
                                showRank
                            />

                            <FriendRecommendations />
                        </div>
                    )}

                    {/* Modals */}
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
    );
}
