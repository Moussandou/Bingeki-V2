import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { searchWorks, type JikanResult } from '@/services/animeApi';
import { PenTool, Globe, Loader2, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore, type Work } from '@/store/libraryStore';

interface AddWorkModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddWorkModal({ isOpen, onClose }: AddWorkModalProps) {
    const [mode, setMode] = useState<'api' | 'manual'>('api');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<JikanResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'manga' | 'anime'>('manga');
    const { addWork, works } = useLibraryStore();

    // Live Search with Debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 2 && mode === 'api') {
                setLoading(true);
                try {
                    const data = await searchWorks(query, type);
                    setResults(data);
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setLoading(false);
                }
            } else if (query.trim().length === 0) {
                setResults([]);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [query, type, mode]);

    const handleAdd = (work: JikanResult) => {
        const newWork: Work = {
            id: work.mal_id,
            title: work.title,
            image: work.images.jpg.image_url,
            type: type,
            totalChapters: type === 'manga' ? work.chapters : work.episodes,
            currentChapter: 0,
            status: 'reading',
        };
        addWork(newWork);
        // Optional: show a small toast or feedback, but for now we keep the modal open or close it?
        // User might want to add multiple. Let's keep it open but show feedback.
    };

    const isAdded = (id: number) => works.some(w => w.id === id);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="RECRUTER UNE ŒUVRE">
            {/* Manga Style Tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: '2px solid #000' }}>
                <button
                    onClick={() => setMode('api')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: mode === 'api' ? '#000' : '#fff',
                        color: mode === 'api' ? '#fff' : '#000',
                        fontSize: '1rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Globe size={18} />
                    Recherche
                </button>
                <div style={{ width: '2px', background: '#000' }}></div>
                <button
                    onClick={() => setMode('manual')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: mode === 'manual' ? '#000' : '#fff',
                        color: mode === 'manual' ? '#fff' : '#000',
                        fontSize: '1rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <PenTool size={18} />
                    Manuel
                </button>
            </div>

            {mode === 'api' ? (
                <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            style={{
                                background: '#fff',
                                color: '#000',
                                border: '2px solid #000',
                                padding: '0 0.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <option value="manga">MANGA</option>
                            <option value="anime">ANIME</option>
                        </select>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Input
                                placeholder="Rechercher (ex: Naruto, Berserk...)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{
                                    border: '2px solid #000',
                                    borderRadius: 0,
                                    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
                                }}
                            />
                            {loading && (
                                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                    <Loader2 className="animate-spin" size={16} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        paddingRight: '0.5rem'
                    }}>
                        <AnimatePresence>
                            {results.map((work) => {
                                const added = isAdded(work.mal_id);
                                return (
                                    <motion.div
                                        key={work.mal_id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="manga-panel"
                                        style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            padding: '0.75rem',
                                            border: '2px solid #000',
                                            background: '#fff',
                                            boxShadow: 'none', // Override global for list items
                                            alignItems: 'center'
                                        }}
                                    >
                                        <img
                                            src={work.images.jpg.image_url}
                                            alt={work.title}
                                            style={{
                                                width: '50px',
                                                height: '70px',
                                                objectFit: 'cover',
                                                border: '1px solid #000'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{
                                                fontSize: '1rem',
                                                fontWeight: 900,
                                                color: '#000',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {work.title}
                                            </h4>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>
                                                {work.type} • {work.chapters || work.episodes || '?'} {type === 'manga' ? 'Chaps' : 'Éps'}
                                                {work.score && ` • ★ ${work.score}`}
                                            </p>
                                        </div>
                                        <Button
                                            variant="manga"
                                            size="sm"
                                            onClick={() => !added && handleAdd(work)}
                                            style={{
                                                opacity: added ? 0.6 : 1,
                                                background: added ? '#eee' : '#fff'
                                            }}
                                            disabled={added}
                                        >
                                            {added ? <Check size={16} /> : <Plus size={16} />}
                                        </Button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {!loading && results.length === 0 && query.length > 2 && (
                            <div style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', fontWeight: 'bold' }}>
                                Auncune trace détectée...
                            </div>
                        )}
                        {!loading && !query && (
                            <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5, fontWeight: 'bold' }}>
                                TAPEZ UN NOM POUR LANCER LA TRAQUE
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Mode manuel bientôt disponible...</p>
                </div>
            )}
        </Modal>
    );
}
