import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AddWorkModal } from '@/components/AddWorkModal';
import { useLibraryStore, type Work } from '@/store/libraryStore';
import { Search, Plus, Filter, Grid, List, Trash2, AlertTriangle, Users, BookOpen, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { statusToFrench } from '@/utils/statusTranslation';
import { useToast } from '@/context/ToastContext';
// Removed unused imports
// Removed unused gamification store

export default function Library() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { works, removeWork } = useLibraryStore();

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [workToDelete, setWorkToDelete] = useState<Work | null>(null);

    // Filtering & Sorting State
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'manga' | 'anime'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'reading' | 'completed' | 'plan_to_read'>('all');
    const [sortBy, setSortBy] = useState<'updated' | 'added' | 'alphabetical' | 'progress'>('updated');

    // Bulk Actions State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedWorks, setSelectedWorks] = useState<Set<string | number>>(new Set());

    // Stats
    const stats = useMemo(() => {
        const total = works.length;
        const reading = works.filter(w => w.status === 'reading').length;
        const completed = works.filter(w => w.status === 'completed').length;
        const progressSum = works.reduce((acc, w) => {
            if (!w.totalChapters || w.totalChapters === 0) return acc;
            return acc + (w.currentChapter || 0) / w.totalChapters;
        }, 0);
        const avgProgress = total > 0 ? Math.round((progressSum / total) * 100) : 0;

        return { total, reading, completed, avgProgress };
    }, [works]);

    // Filter Logic
    const filteredWorks = useMemo(() => {
        return works
            .filter(work => {
                const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesType = filterType === 'all' || work.type === filterType;
                const matchesStatus = filterStatus === 'all' || work.status === filterStatus;
                return matchesSearch && matchesType && matchesStatus;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'updated':
                        return (b.lastUpdated || 0) - (a.lastUpdated || 0);
                    case 'added':
                        return (b.dateAdded || 0) - (a.dateAdded || 0);
                    case 'alphabetical':
                        return a.title.localeCompare(b.title);
                    case 'progress':
                        const progressA = (a.currentChapter || 0) / (a.totalChapters || 1);
                        const progressB = (b.currentChapter || 0) / (b.totalChapters || 1);
                        return progressB - progressA;
                    default:
                        return 0;
                }
            });
    }, [works, searchQuery, filterType, filterStatus, sortBy]);

    // Selection Handlers
    const toggleSelection = (id: string | number) => {
        const newSelection = new Set(selectedWorks);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedWorks(newSelection);
    };

    const handleBulkDelete = () => {
        if (confirm(`Supprimer ${selectedWorks.size} œuvres ?`)) {
            selectedWorks.forEach(id => removeWork(id));
            setSelectedWorks(new Set());
            setIsSelectionMode(false);
            addToast(`${selectedWorks.size} œuvres supprimées`, 'success');
        }
    };

    const confirmDelete = () => {
        if (workToDelete) {
            removeWork(workToDelete.id);
            addToast(`"${workToDelete.title}" a été supprimé`, 'error');
            setWorkToDelete(null);
        }
    };

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

                    {/* Stats Header */}
                    <div className="manga-panel" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                        background: '#fff',
                        padding: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f4f4f5', borderRadius: '50%' }}>
                                <BookOpen size={24} color="#000" />
                            </div>
                            <div>
                                <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.total}</span>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>Total Œuvres</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f4f4f5', borderRadius: '50%' }}>
                                <CheckCircle size={24} color="#22c55e" />
                            </div>
                            <div>
                                <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.completed}</span>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>Terminées</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f4f4f5', borderRadius: '50%' }}>
                                <Users size={24} color="var(--color-primary)" />
                            </div>
                            <div>
                                <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.avgProgress}%</span>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>Progression</p>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setIsAddModalOpen(true)}
                            icon={<Plus size={18} />}
                            style={{ height: '100%', minHeight: '60px', marginLeft: 'auto' }}
                        >
                            AJOUTER
                        </Button>
                    </div>

                    {/* Controls Bar */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>

                        {/* Search */}
                        <div className="manga-panel" style={{ flex: 1, minWidth: '300px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', background: '#fff' }}>
                            <Search size={20} style={{ marginRight: '0.75rem', opacity: 0.5 }} />
                            <input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '1rem',
                                    background: 'transparent'
                                }}
                            />
                        </div>

                        {/* Filters Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <Button
                                variant="manga"
                                icon={<Filter size={18} />}
                                onClick={() => setFilterOpen(!filterOpen)}
                                style={{ background: filterOpen ? '#000' : '#fff', color: filterOpen ? '#fff' : '#000' }}
                            >
                                FILTRES
                            </Button>
                            {filterOpen && (
                                <div className="manga-panel" style={{
                                    position: 'absolute',
                                    top: '110%',
                                    right: 0,
                                    zIndex: 50,
                                    background: '#fff',
                                    padding: '1rem',
                                    width: '250px',
                                    border: '2px solid #000'
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.5rem' }}>TYPE</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {['all', 'manga', 'anime'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setFilterType(t as any)}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        border: '2px solid #000',
                                                        background: filterType === t ? '#000' : '#fff',
                                                        color: filterType === t ? '#fff' : '#000',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {t === 'all' ? 'TOUS' : t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.5rem' }}>STATUT</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {['all', 'reading', 'completed', 'plan_to_read'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setFilterStatus(s as any)}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        border: '2px solid #000',
                                                        background: filterStatus === s ? '#000' : '#fff',
                                                        color: filterStatus === s ? '#fff' : '#000',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {s === 'all' ? 'TOUS' : s.replace(/_/g, ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sort Dropdown (Simplified as Select) */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #000', fontWeight: 600, cursor: 'pointer' }}
                        >
                            <option value="updated">Récents</option>
                            <option value="added">Ajoutés</option>
                            <option value="alphabetical">A-Z</option>
                            <option value="progress">Progression</option>
                        </select>

                        {/* View Toggle */}
                        <div style={{ display: 'flex', background: '#fff', border: '2px solid #000', borderRadius: '8px', overflow: 'hidden' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{ padding: '0.75rem', background: viewMode === 'grid' ? '#000' : '#fff', color: viewMode === 'grid' ? '#fff' : '#000', cursor: 'pointer', border: 'none' }}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{ padding: '0.75rem', background: viewMode === 'list' ? '#000' : '#fff', color: viewMode === 'list' ? '#fff' : '#000', cursor: 'pointer', border: 'none' }}
                            >
                                <List size={20} />
                            </button>
                        </div>

                        {/* Selection Mode Toggle */}
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedWorks(new Set());
                            }}
                            style={{ border: isSelectionMode ? '2px solid var(--color-primary)' : '2px solid #ddd', color: isSelectionMode ? 'var(--color-primary)' : '#666' }}
                        >
                            {isSelectionMode ? 'Annuler' : 'Sélectionner'}
                        </Button>

                        {isSelectionMode && selectedWorks.size > 0 && (
                            <Button variant="outline" onClick={handleBulkDelete} style={{ borderColor: '#ef4444', color: '#ef4444' }} icon={<Trash2 size={16} />}>
                                Supprimer ({selectedWorks.size})
                            </Button>
                        )}
                    </div>

                    {/* Content Grid/List */}
                    {filteredWorks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem' }} />
                            <h3>Aucune œuvre trouvée</h3>
                        </div>
                    ) : (
                        <div style={{
                            display: viewMode === 'grid' ? 'grid' : 'flex',
                            flexDirection: 'column',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <AnimatePresence>
                                {filteredWorks.map(work => (
                                    <motion.div
                                        key={work.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ position: 'relative' }}
                                    >
                                        <Card
                                            variant="manga"
                                            hoverable={!isSelectionMode}
                                            style={{
                                                padding: 0,
                                                overflow: 'hidden',
                                                height: '100%',
                                                cursor: isSelectionMode ? 'default' : 'pointer',
                                                display: viewMode === 'list' ? 'flex' : 'block',
                                                alignItems: 'center'
                                            }}
                                            onClick={() => {
                                                if (isSelectionMode) toggleSelection(work.id);
                                                else navigate(`/work/${work.id}`);
                                            }}
                                        >
                                            {/* Selection Overlay */}
                                            {isSelectionMode && (
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: selectedWorks.has(work.id) ? 'rgba(255, 46, 99, 0.2)' : 'transparent',
                                                    pointerEvents: 'none',
                                                    border: selectedWorks.has(work.id) ? '3px solid var(--color-primary)' : 'none',
                                                    zIndex: 10
                                                }} />
                                            )}

                                            {/* Image */}
                                            <div style={{
                                                height: viewMode === 'grid' ? '200px' : '100px',
                                                width: viewMode === 'list' ? '80px' : '100%',
                                                background: `url(${work.image}) center/cover`,
                                                flexShrink: 0
                                            }} />

                                            {/* Info */}
                                            <div style={{ padding: '1rem', flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                    <h3 style={{
                                                        fontFamily: 'var(--font-heading)',
                                                        fontSize: '1rem',
                                                        fontWeight: 800,
                                                        lineHeight: 1.2,
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {work.title}
                                                    </h3>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: '#eee', fontWeight: 600 }}>{work.type}</span>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{statusToFrench(work.status)}</span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden', marginTop: 'auto' }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${((work.currentChapter || 0) / (work.totalChapters || 1)) * 100}%`,
                                                        background: 'var(--color-primary)'
                                                    }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Ch. {work.currentChapter} / {work.totalChapters || '?'}</span>
                                                    {work.rating && <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>★ {work.rating}</span>}
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Selection Checkbox (Visual only) */}
                                        {isSelectionMode && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                width: 24,
                                                height: 24,
                                                background: selectedWorks.has(work.id) ? 'var(--color-primary)' : '#fff',
                                                border: '2px solid #000',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 20
                                            }}>
                                                {selectedWorks.has(work.id) && <CheckCircle size={14} color="#fff" />}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    <AddWorkModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                    />

                    {/* Delete Confirmation Modal */}
                    <Modal isOpen={!!workToDelete} onClose={() => setWorkToDelete(null)} title="SUPPRESSION">
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '50%', color: '#dc2626' }}>
                                    <AlertTriangle size={32} />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#000' }}>
                                Supprimer "{workToDelete?.title}" ?
                            </h3>
                            <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                                Cette action est irréversible. Votre progression et vos notes seront perdues.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button variant="ghost" onClick={() => setWorkToDelete(null)}>
                                    ANNULER
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={confirmDelete}
                                    style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                                >
                                    SUPPRIMER
                                </Button>
                            </div>
                        </div>
                    </Modal>

                </div>
            </div>
        </Layout>
    );
}
