import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AddWorkModal } from '@/components/AddWorkModal';
import { useLibraryStore, type Work } from '@/store/libraryStore';
import { Search, Plus, Filter, Grid, List, Trash2, AlertTriangle, BookOpen, CheckCircle, SortAsc, ChevronDown, Download, Upload, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { statusToFrench } from '@/utils/statusTranslation';
import { useToast } from '@/context/ToastContext';
import { exportData, importData } from '@/utils/storageUtils';
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
    const [sortOpen, setSortOpen] = useState(false);

    const sortOptions = [
        { value: 'updated', label: 'Récents' },
        { value: 'added', label: 'Ajoutés' },
        { value: 'alphabetical', label: 'A-Z' },
        { value: 'progress', label: 'Progression' }
    ];

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

                    {/* Stats Header - Consolidated */}
                    <div className="manga-panel" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0',
                        marginBottom: '2rem',
                        background: '#fff',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', flex: 1, minWidth: '300px' }}>
                            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '2px solid #000' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                                    <BookOpen size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Total</span>
                                </div>
                                <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.total}</span>
                            </div>
                            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '2px solid #000' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                                    <CheckCircle size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Terminées</span>
                                </div>
                                <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.completed}</span>
                            </div>
                            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                                    <TrendingUp size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Progression</span>
                                </div>
                                <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.avgProgress}%</span>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', borderLeft: '2px solid #000', background: '#000' }}>
                            <Button
                                variant="primary"
                                onClick={() => setIsAddModalOpen(true)}
                                icon={<Plus size={20} />}
                                style={{
                                    height: 'auto',
                                    padding: '0.75rem 1.5rem',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                AJOUTER UNE ŒUVRE
                            </Button>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>

                        {/* Search */}
                        {/* Search */}
                        <Card
                            variant="manga"
                            style={{
                                flex: 1,
                                minWidth: '300px',
                                padding: '0.25rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                background: '#fff',
                                borderWidth: '3px',
                                borderStyle: 'solid',
                                borderColor: '#000',
                                boxShadow: '6px 6px 0 #000'
                            }}
                            whileHover={{
                                borderColor: 'var(--color-primary)',
                                boxShadow: '6px 6px 0 var(--color-primary)'
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            <Search size={20} style={{ opacity: 0.4 }} />
                            <input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '1rem',
                                    background: 'transparent',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 700,
                                    padding: '0.5rem 0'
                                }}
                            />
                        </Card>

                        {/* Filters Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <Button
                                variant="manga"
                                icon={<Filter size={18} />}
                                onClick={() => setFilterOpen(!filterOpen)}
                                style={{
                                    background: filterOpen ? '#000' : '#fff',
                                    color: filterOpen ? '#fff' : '#000',
                                    minWidth: '130px'
                                }}
                            >
                                FILTRES
                            </Button>
                            {filterOpen && (
                                <Card variant="manga" style={{
                                    position: 'absolute',
                                    top: '110%',
                                    right: 0,
                                    zIndex: 50,
                                    background: '#fff',
                                    padding: '1rem',
                                    width: '280px',
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.7 }}>TYPE</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {['all', 'manga', 'anime'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setFilterType(t as any)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        border: '2px solid #000',
                                                        background: filterType === t ? '#000' : '#fff',
                                                        color: filterType === t ? '#fff' : '#000',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        flex: 1,
                                                        boxShadow: filterType === t ? 'none' : '2px 2px 0 #000',
                                                        transform: filterType === t ? 'translate(2px, 2px)' : 'none',
                                                        transition: 'all 0.1s'
                                                    }}
                                                >
                                                    {t === 'all' ? 'TOUS' : t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.7 }}>STATUT</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {['all', 'reading', 'completed', 'plan_to_read'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setFilterStatus(s as any)}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        border: '2px solid #000',
                                                        background: filterStatus === s ? '#000' : '#fff',
                                                        color: filterStatus === s ? '#fff' : '#000',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        boxShadow: filterStatus === s ? 'none' : '2px 2px 0 #000',
                                                        transform: filterStatus === s ? 'translate(2px, 2px)' : 'none',
                                                        transition: 'all 0.1s'
                                                    }}
                                                >
                                                    {s === 'all' ? 'TOUS' : s.replace(/_/g, ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <Button
                                variant="manga"
                                icon={<SortAsc size={18} />}
                                onClick={() => setSortOpen(!sortOpen)}
                                style={{
                                    background: sortOpen ? '#000' : '#fff',
                                    color: sortOpen ? '#fff' : '#000',
                                    minWidth: '160px',
                                    justifyContent: 'space-between'
                                }}
                            >
                                {sortOptions.find(o => o.value === sortBy)?.label}
                                <ChevronDown size={16} />
                            </Button>
                            {sortOpen && (
                                <Card variant="manga" style={{
                                    position: 'absolute',
                                    top: '110%',
                                    right: 0,
                                    zIndex: 50,
                                    background: '#fff',
                                    padding: '0.5rem',
                                    width: '200px',
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {sortOptions.map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortBy(option.value as any);
                                                    setSortOpen(false);
                                                }}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    border: '2px solid #000',
                                                    background: sortBy === option.value ? '#000' : '#fff',
                                                    color: sortBy === option.value ? '#fff' : '#000',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    boxShadow: sortBy === option.value ? 'none' : '2px 2px 0 #000',
                                                    transform: sortBy === option.value ? 'translate(2px, 2px)' : 'none',
                                                    transition: 'all 0.1s'
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* View Toggle */}
                        <Card variant="manga" style={{ display: 'flex', padding: 0, overflow: 'hidden', gap: 0, background: '#fff' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '0.75rem',
                                    background: viewMode === 'grid' ? '#000' : '#fff',
                                    color: viewMode === 'grid' ? '#fff' : '#000',
                                    cursor: 'pointer',
                                    border: 'none',
                                    borderRight: '2px solid #000',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '0.75rem',
                                    background: viewMode === 'list' ? '#000' : '#fff',
                                    color: viewMode === 'list' ? '#fff' : '#000',
                                    cursor: 'pointer',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <List size={20} />
                            </button>
                        </Card>

                        {/* Selection Mode Toggle */}
                        <Button
                            variant={isSelectionMode ? 'primary' : 'manga'}
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedWorks(new Set());
                            }}
                            style={{
                                minWidth: '140px',
                                background: isSelectionMode ? 'var(--color-primary)' : '#fff',
                                color: isSelectionMode ? '#fff' : '#000',
                                borderColor: isSelectionMode ? 'var(--color-primary)' : '#000'
                            }}
                        >
                            {isSelectionMode ? 'ANNULER' : 'SÉLECTIONNER'}
                        </Button>

                        {isSelectionMode && selectedWorks.size > 0 && (
                            <Button
                                variant="primary"
                                onClick={handleBulkDelete}
                                style={{
                                    background: '#ef4444',
                                    borderColor: '#000',
                                    boxShadow: '4px 4px 0 #000',
                                    color: '#fff'
                                }}
                                icon={<Trash2 size={16} />}
                            >
                                SUPPRIMER ({selectedWorks.size})
                            </Button>
                        )}

                        {/* Import/Export */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                                variant="manga"
                                icon={<Download size={18} />}
                                onClick={exportData}
                                title="Exporter la bibliothèque"
                                style={{ minWidth: '40px', padding: '0.5rem' }}
                            />
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            importData(file).then(() => {
                                                addToast('Données importées !', 'success');
                                            }).catch(() => addToast('Erreur', 'error'));
                                        }
                                    }}
                                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }}
                                />
                                <Button
                                    variant="manga"
                                    icon={<Upload size={18} />}
                                    title="Importer la bibliothèque"
                                    style={{ minWidth: '40px', padding: '0.5rem' }}
                                />
                            </div>
                        </div>

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
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
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
                                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
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
                                                alignItems: 'center',
                                                border: selectedWorks.has(work.id) ? '2px solid var(--color-primary)' : undefined,
                                                transform: selectedWorks.has(work.id) ? 'translate(-2px, -2px)' : undefined,
                                                boxShadow: selectedWorks.has(work.id) ? '6px 6px 0 var(--color-primary)' : undefined
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
                                                    background: selectedWorks.has(work.id) ? 'rgba(255, 46, 99, 0.1)' : 'transparent',
                                                    pointerEvents: 'none',
                                                    zIndex: 10
                                                }} />
                                            )}

                                            {/* Image */}
                                            <div style={{
                                                height: viewMode === 'grid' ? '280px' : '150px',
                                                width: viewMode === 'list' ? '120px' : '100%',
                                                background: `url(${work.image}) center/cover`,
                                                flexShrink: 0,
                                                borderRight: viewMode === 'list' ? '2px solid #000' : 'none',
                                                borderBottom: viewMode === 'grid' ? '2px solid #000' : 'none'
                                            }} />

                                            {/* Info */}
                                            <div style={{ padding: '1.25rem', flex: 1, background: '#fff' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                                    <h3 style={{
                                                        fontFamily: 'var(--font-heading)',
                                                        fontSize: viewMode === 'list' ? '1.5rem' : '1.2rem',
                                                        fontWeight: 900,
                                                        lineHeight: 1.1,
                                                        marginBottom: '0.25rem',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {work.title}
                                                    </h3>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '4px 8px',
                                                        background: '#000',
                                                        color: '#fff',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {work.type}
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>{statusToFrench(work.status)}</span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{ height: '10px', background: '#f4f4f5', borderRadius: '0', overflow: 'hidden', marginTop: 'auto', border: '1px solid #000' }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${((work.currentChapter || 0) / (work.totalChapters || 1)) * 100}%`,
                                                        background: 'var(--color-primary)'
                                                    }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                                                        {work.type === 'anime' ? 'Ep.' : 'Ch.'} {work.currentChapter} / {work.totalChapters || '?'}
                                                    </span>
                                                    {work.rating && <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24' }}>★ {work.rating}</span>}
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Delete Button (visible on hover or always on mobile? defaulting to always for visibility) */}
                                        {!isSelectionMode && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setWorkToDelete(work);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    right: 10,
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    border: '2px solid #000',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    zIndex: 20,
                                                    boxShadow: '2px 2px 0 #000',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.background = '#fee2e2';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                                }}
                                                title="Supprimer l'oeuvre"
                                            >
                                                <Trash2 size={16} color="#dc2626" />
                                            </button>
                                        )}

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
                                                zIndex: 20,
                                                boxShadow: '2px 2px 0 #000'
                                            }}>
                                                {selectedWorks.has(work.id) && <CheckCircle size={16} color="#fff" />}
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
                                <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '50%', color: '#dc2626', border: '2px solid #dc2626' }}>
                                    <AlertTriangle size={32} />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
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
