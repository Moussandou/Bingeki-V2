import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { searchWorks, getTopWorks, type JikanResult } from '@/services/animeApi';
import { useLibraryStore } from '@/store/libraryStore';
import { Button } from '@/components/ui/Button';
import { Search, Plus, Check, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Discover() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<JikanResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'manga' | 'anime'>('manga');
    const [view, setView] = useState<'search' | 'top'>('top');
    const { addWork, works } = useLibraryStore();
    const navigate = useNavigate();

    // Initial load of top content
    useEffect(() => {
        if (view === 'top' && !query) {
            loadTopContent();
        }
    }, [activeTab, view]);

    // Search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                handleSearch();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query, activeTab]);

    const loadTopContent = async () => {
        setLoading(true);
        const data = await getTopWorks(activeTab, 'bypopularity');
        setResults(data);
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setView('search');
        const data = await searchWorks(query, activeTab);
        setResults(data);
        setLoading(false);
    };

    const isInLibrary = (mal_id: number) => {
        return works.some(w => w.id === mal_id);
    };

    const handleAdd = (item: JikanResult) => {
        addWork({
            id: item.mal_id,
            title: item.title,
            image: item.images.jpg.image_url,
            type: activeTab,
            totalChapters: activeTab === 'manga' ? item.chapters : item.episodes,
            currentChapter: 0,
            status: 'plan_to_read'
        });
    };

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', textTransform: 'uppercase' }}>
                        DÉCOUVRIR
                    </h1>

                    {/* Search Bar */}
                    <div className="manga-panel" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff' }}>
                        <Search size={24} style={{ marginLeft: '0.5rem' }} />
                        <input
                            type="text"
                            placeholder={`Rechercher un ${activeTab}...`}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (!e.target.value) setView('top');
                            }}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                fontSize: '1.2rem',
                                padding: '0.5rem',
                                fontFamily: 'inherit',
                                fontWeight: 600
                            }}
                        />
                    </div>

                    {/* Filters / Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                                variant={activeTab === 'manga' ? 'primary' : 'ghost'}
                                onClick={() => setActiveTab('manga')}
                            >
                                MANGA
                            </Button>
                            <Button
                                variant={activeTab === 'anime' ? 'primary' : 'ghost'}
                                onClick={() => setActiveTab('anime')}
                            >
                                ANIME
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Chargement...</div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {results.map((item) => (
                            <div key={item.mal_id} className="manga-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ position: 'relative', paddingTop: '140%' }}>
                                    <img
                                        src={item.images.jpg.image_url}
                                        alt={item.title}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    {item.score && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            background: '#000',
                                            color: '#fff',
                                            padding: '2px 6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 900
                                        }}>
                                            ★ {item.score}
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <h3 style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        marginBottom: '0.5rem',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {item.title}
                                    </h3>
                                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                                        {isInLibrary(item.mal_id) ? (
                                            <Button
                                                variant="ghost"
                                                style={{ width: '100%', opacity: 0.7, cursor: 'default' }}
                                                icon={<Check size={16} />}
                                            >
                                                DÉJÀ AJOUTÉ
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="manga"
                                                style={{ width: '100%' }}
                                                onClick={() => handleAdd(item)}
                                                icon={<Plus size={16} />}
                                            >
                                                AJOUTER
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
