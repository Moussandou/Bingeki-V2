import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { searchWorks, type JikanResult } from '@/services/animeApi';
import { PenTool, Globe, Loader2, Plus, Check, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore, type Work } from '@/store/libraryStore';
import { useGamificationStore, XP_REWARDS } from '@/store/gamificationStore';

interface AddWorkModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialWork?: JikanResult;
}

export function AddWorkModal({ isOpen, onClose, initialWork }: AddWorkModalProps) {
    const [mode, setMode] = useState<'api' | 'manual'>('api');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<JikanResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'manga' | 'anime'>('manga');
    const { addWork, works } = useLibraryStore();
    const { addXp, recordActivity, incrementStat } = useGamificationStore();

    // Manual mode state
    const [manualTitle, setManualTitle] = useState('');
    const [manualTotal, setManualTotal] = useState<number>(0);
    const [manualImage, setManualImage] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let file: File | null = null;

        if ('files' in e.target && e.target.files) {
            file = e.target.files[0];
        } else if ('dataTransfer' in e && e.dataTransfer.files) {
            file = e.dataTransfer.files[0];
        }

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setManualImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e);
    };

    const handleManualAdd = () => {
        if (!manualTitle.trim()) return;

        const newWork: Work = {
            id: Date.now(), // Generate a temporary ID
            title: manualTitle,
            image: manualImage || 'https://placehold.co/400x600/000000/FFFFFF/png?text=NO+IMAGE',
            type: type,
            totalChapters: manualTotal,
            currentChapter: 0,
            status: 'reading',
        };

        addWork(newWork);
        addXp(XP_REWARDS.ADD_WORK);
        recordActivity();
        incrementStat('works');

        // Reset and close
        setManualTitle('');
        setManualTotal(0);
        setManualImage('');
        onClose();
    };

    // Handle initial work if provided
    useEffect(() => {
        if (isOpen && initialWork) {
            setQuery(initialWork.title);
            setResults([initialWork]);
            setType(initialWork.type === 'Manga' ? 'manga' : 'anime' as any); // Simple heuristic
        } else if (isOpen && !initialWork) {
            // Reset if opening fresh
            setQuery('');
            setResults([]);
        }
    }, [isOpen, initialWork]);

    // Live Search with Debounce
    useEffect(() => {
        // Skip search if we are just viewing the initial work (query matches initial work title)
        if (initialWork && query === initialWork.title) return;

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
    }, [query, type, mode, initialWork]);

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
        // Award XP for adding a work
        addXp(XP_REWARDS.ADD_WORK);
        recordActivity();
        incrementStat('works');
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 900, fontSize: '0.9em' }}>TITRE</label>
                        <Input
                            placeholder="Titre de l'œuvre..."
                            value={manualTitle}
                            onChange={(e) => setManualTitle(e.target.value)}
                            style={{ border: '2px solid #000', borderRadius: 0 }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 900, fontSize: '0.9em' }}>TYPE</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: '#fff',
                                    border: '2px solid #000',
                                    fontWeight: 'bold',
                                    height: '42px'
                                }}
                            >
                                <option value="manga">MANGA</option>
                                <option value="anime">ANIME</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 900, fontSize: '0.9em' }}>
                                {type === 'manga' ? 'CHAPITRES' : 'ÉPISODES'}
                            </label>
                            <Input
                                type="number"
                                placeholder="Total..."
                                value={manualTotal || ''}
                                onChange={(e) => setManualTotal(parseInt(e.target.value) || 0)}
                                style={{ border: '2px solid #000', borderRadius: 0 }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 900, fontSize: '0.9em' }}>IMAGE (OPTIONNEL)</label>

                        {!manualImage ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                style={{
                                    border: `2px dashed ${isDragging ? 'var(--color-primary)' : '#000'}`,
                                    background: isDragging ? 'rgba(0,0,0,0.05)' : '#fff',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <Upload size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                    Glissez une image ou cliquez pour upload
                                </p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.25rem' }}>
                                    Ou collez une URL ci-dessous
                                </p>
                            </div>
                        ) : (
                            <div style={{ position: 'relative', width: '100px', height: '140px', border: '2px solid #000' }}>
                                <img
                                    src={manualImage}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <button
                                    onClick={() => setManualImage('')}
                                    style={{
                                        position: 'absolute',
                                        top: -10,
                                        right: -10,
                                        background: '#ff0000',
                                        color: '#fff',
                                        border: '2px solid #000',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {!manualImage && (
                            <Input
                                placeholder="Ou URL de l'image..."
                                value={manualImage}
                                onChange={(e) => setManualImage(e.target.value)}
                                style={{ border: '2px solid #000', borderRadius: 0, marginTop: '0.5rem' }}
                            />
                        )}
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleManualAdd}
                        disabled={!manualTitle.trim()}
                        style={{ marginTop: '1rem' }}
                    >
                        AJOUTER L'ŒUVRE
                    </Button>
                </div>
            )}
        </Modal>
    );
}
