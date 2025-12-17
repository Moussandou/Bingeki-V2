import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Carousel } from '@/components/ui/Carousel';
import { searchWorks, getTopWorks, getSeasonalAnime, type JikanResult } from '@/services/animeApi';
import { useLibraryStore } from '@/store/libraryStore';
import { Search, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AddWorkModal } from '@/components/AddWorkModal';

export default function Discover() {
    const [searchQuery, setSearchQuery] = useState('');
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
                const results = await searchWorks(searchQuery);
                setSearchResults(results);
                setLoading(false);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleWorkClick = (work: JikanResult) => {
        setSelectedWork(work);
        setIsModalOpen(true);
    };

    const handleQuickAdd = (work: JikanResult) => {
        setSelectedWork(work);
        setIsModalOpen(true);
    };

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)', paddingBottom: '6rem', paddingTop: '2rem' }} className="container">

                {/* Header & Search */}
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', color: '#000' }}>
                        Découvrir
                    </h1>
                    <div className="manga-panel" style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '0.5rem' }}>
                        <Input
                            placeholder="Rechercher un anime ou manga..."
                            icon={<Search size={20} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '1rem', paddingLeft: '3rem' }}
                        />
                    </div>
                </div>

                {/* Content Area */}
                {searchQuery.length > 2 ? (
                    /* Search Results Grid */
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '2rem', color: '#000' }}>
                            Résultats pour "{searchQuery}"
                        </h2>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                <Loader2 className="spin" size={48} />
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: '1.5rem',
                                alignItems: 'start'
                            }}>
                                {searchResults.map((work) => {
                                    const isOwned = libraryIds.has(work.mal_id);
                                    return (
                                        <motion.div key={work.mal_id} whileHover={{ y: -5 }} style={{ height: '100%' }}>
                                            <Card
                                                variant="manga"
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
                                                        <div style={{ position: 'absolute', top: 5, right: 5, background: '#000', color: '#fff', padding: '4px', borderRadius: '50%' }}>
                                                            <Check size={14} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ padding: '0.75rem', background: '#fff', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <h3 style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: 800,
                                                        fontFamily: 'var(--font-heading)',
                                                        lineHeight: 1.2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}>{work.title}</h3>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
                                                        <span>{work.type}</span>
                                                        <span>{work.status}</span>
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
                    /* Home Carousels */
                    <div>
                        <>
                            <Carousel
                                title="🔥 Anime de la Saison"
                                items={seasonalAnime}
                                onItemClick={handleWorkClick}
                                libraryIds={libraryIds}
                                onAdd={handleQuickAdd}
                                loading={seasonalAnime.length === 0}
                            />
                            <Carousel
                                title="✨ Top 10 Animes (All Time)"
                                items={topAnime}
                                onItemClick={handleWorkClick}
                                libraryIds={libraryIds}
                                onAdd={handleQuickAdd}
                                loading={topAnime.length === 0}
                            />
                            <Carousel
                                title="📚 Mangas Populaires"
                                items={popularManga}
                                onItemClick={handleWorkClick}
                                libraryIds={libraryIds}
                                onAdd={handleQuickAdd}
                                loading={popularManga.length === 0}
                            />
                            <Carousel
                                title="🌟 Top 10 Mangas (All Time)"
                                items={topManga}
                                onItemClick={handleWorkClick}
                                libraryIds={libraryIds}
                                onAdd={handleQuickAdd}
                                loading={topManga.length === 0}
                            />
                        </>
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
        </Layout>
    );
}
