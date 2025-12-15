import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { searchWorks, JikanResult } from '@/services/animeApi';
import { Search, PenTool, Globe, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        const data = await searchWorks(query, type);
        setResults(data);
        setLoading(false);
    };

    const handleAdd = (work: JikanResult | any) => {
        console.log("Adding work:", work);
        // Here we would save to Firestore
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ajouter une œuvre">
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <button
                    onClick={() => setMode('api')}
                    style={{
                        padding: '0.5rem 1rem',
                        color: mode === 'api' ? 'var(--color-primary)' : 'var(--color-text-dim)',
                        borderBottom: mode === 'api' ? '2px solid var(--color-primary)' : 'none',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}
                >
                    <Globe size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Recherche
                </button>
                <button
                    onClick={() => setMode('manual')}
                    style={{
                        padding: '0.5rem 1rem',
                        color: mode === 'manual' ? 'var(--color-primary)' : 'var(--color-text-dim)',
                        borderBottom: mode === 'manual' ? '2px solid var(--color-primary)' : 'none',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}
                >
                    <PenTool size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Manuel
                </button>
            </div>

            {mode === 'api' ? (
                <div>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            style={{
                                background: 'var(--color-surface)',
                                color: '#fff',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '4px',
                                padding: '0 0.5rem'
                            }}
                        >
                            <option value="manga">Manga</option>
                            <option value="anime">Anime</option>
                        </select>
                        <Input
                            placeholder="Titre (ex: Naruto, One Piece...)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <Button type="submit" variant="primary" disabled={loading} icon={<Search size={18} />}>
                            {loading ? '...' : ''}
                        </Button>
                    </form>

                    <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {loading && <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>}

                        {!loading && results.map((work) => (
                            <motion.div
                                key={work.mal_id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleAdd(work)}
                                whileHover={{ background: 'rgba(255,255,255,0.1)' }}
                            >
                                <img src={work.images.jpg.image_url} alt={work.title} style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '2px' }} />
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{work.title}</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-dim)' }}>
                                        {work.type} • {work.chapters || work.episodes || '?'} {type === 'manga' ? 'Chaps' : 'EPS'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {!loading && results.length === 0 && query && (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-dim)' }}>Aucun résultat.</p>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleAdd({ title: 'Manual' }); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input placeholder="Titre de l'œuvre" />
                    <Input placeholder="URL de l'image (Optionnel)" />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--color-text-dim)' }}>Type</label>
                            <select style={{ width: '100%', padding: '0.75rem', background: 'var(--color-surface)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: '#fff' }}>
                                <option value="manga">Manga</option>
                                <option value="anime">Anime</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--color-text-dim)' }}>Total Chapitres/Éps</label>
                            <Input type="number" placeholder="ex: 12" />
                        </div>
                    </div>
                    <Button type="submit" style={{ marginTop: '1rem' }}>Ajouter manuellement</Button>
                </form>
            )}
        </Modal>
    );
}
