import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AddWorkModal } from '@/components/AddWorkModal';
import { useLibraryStore, type Work } from '@/store/libraryStore';
import { useAuthStore } from '@/store/authStore';
import { Search, Plus, Filter, Grid, List, Trash2, AlertTriangle, BookOpen, CheckCircle, SortAsc, ChevronDown, Download, Upload, TrendingUp, User } from 'lucide-react';
import styles from './Library.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '@/components/layout/SEO';
import { statusToFrench } from '@/utils/statusTranslation';
import { useToast } from '@/context/ToastContext';
import { exportData, importData } from '@/utils/storageUtils';
import { useTranslation } from 'react-i18next';
import { loadLibraryFromFirestore, getUserProfile, type UserProfile } from '@/firebase/firestore';

export default function Library() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { uid } = useParams();
    const { user: currentUser } = useAuthStore();
    const { addToast } = useToast();
    const { works: localWorks, removeWork } = useLibraryStore();

    // Friend Library State
    const [friendWorks, setFriendWorks] = useState<Work[]>([]);
    const [friendProfile, setFriendProfile] = useState<UserProfile | null>(null);
    const [isLoadingFriend, setIsLoadingFriend] = useState(false);

    const isReadOnly = useMemo(() => {
        return !!uid && uid !== currentUser?.uid;
    }, [uid, currentUser]);

    // Determines which works to display
    const currentWorks = isReadOnly ? friendWorks : localWorks;

    // Load Friend Data
    useEffect(() => {
        if (isReadOnly && uid) {
            const loadFriend = async () => {
                setIsLoadingFriend(true);
                try {
                    const [profile, lib] = await Promise.all([
                        getUserProfile(uid),
                        loadLibraryFromFirestore(uid)
                    ]);
                    setFriendProfile(profile);
                    setFriendWorks(lib || []);
                } catch (error) {
                    console.error("Failed to load friend library", error);
                    addToast("Impossible de charger la bibliothèque", 'error');
                } finally {
                    setIsLoadingFriend(false);
                }
            };
            loadFriend();
        }
    }, [isReadOnly, uid, addToast]);


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
        { value: 'updated', label: t('library.sort.recent') },
        { value: 'added', label: t('library.sort.added') },
        { value: 'alphabetical', label: t('library.sort.alphabetical') },
        { value: 'progress', label: t('library.sort.progress') }
    ];

    // Bulk Actions State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedWorks, setSelectedWorks] = useState<Set<string | number>>(new Set());

    // Stats
    const stats = useMemo(() => {
        const total = currentWorks.length;
        const reading = currentWorks.filter(w => w.status === 'reading').length;
        const completed = currentWorks.filter(w => w.status === 'completed').length;
        const progressSum = currentWorks.reduce((acc, w) => {
            if (!w.totalChapters || w.totalChapters === 0) return acc;
            return acc + (w.currentChapter || 0) / w.totalChapters;
        }, 0);
        const avgProgress = total > 0 ? Math.round((progressSum / total) * 100) : 0;

        return { total, reading, completed, avgProgress };
    }, [currentWorks]);

    // Filter Logic
    const filteredWorks = useMemo(() => {
        return currentWorks
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
    }, [currentWorks, searchQuery, filterType, filterStatus, sortBy]);

    // Selection Handlers
    const toggleSelection = (id: string | number) => {
        if (isReadOnly) return;
        const newSelection = new Set(selectedWorks);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedWorks(newSelection);
    };

    const handleBulkDelete = () => {
        if (isReadOnly) return;
        if (confirm(t('library.delete_confirm', { count: selectedWorks.size }))) {
            selectedWorks.forEach(id => removeWork(id));
            setSelectedWorks(new Set());
            setIsSelectionMode(false);
            addToast(t('library.deleted_success', { count: selectedWorks.size }), 'success');
        }
    };

    const confirmDelete = () => {
        if (isReadOnly) return;
        if (workToDelete) {
            removeWork(workToDelete.id);
            addToast(t('library.deleted_single', { title: workToDelete.title }), 'error');
            setWorkToDelete(null);
        }
    };

    return (
        <Layout>
            <SEO title={isReadOnly && friendProfile ? t('library.friend_title', { name: friendProfile.displayName }) : t('library.title')} />
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

                    {/* Public Library Header */}
                    {isReadOnly && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #000' }}>
                            <div style={{
                                width: 50, height: 50, borderRadius: '50%', background: '#000', overflow: 'hidden',
                                border: '2px solid #000'
                            }}>
                                {friendProfile?.photoURL ? (
                                    <img src={friendProfile.photoURL} alt={friendProfile.displayName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
                                    {t('library.friend_title', { name: friendProfile?.displayName || '...' })}
                                </h1>
                                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                    {t('library.read_only')}
                                </span>
                            </div>
                        </div>
                    )}

                    {!isReadOnly && (
                        <h1 className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
                            {t('library.title')}
                        </h1>
                    )}

                    {/* Stats Header - Consolidated */}
                    <div className={`manga-panel ${styles.statsPanel}`}>
                        <div className={styles.statsContainer}>
                            <div className={styles.statItem}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                                    <BookOpen size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{t('library.total')}</span>
                                </div>
                                <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.total}</span>
                            </div>
                            <div className={styles.statItem}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                                    <CheckCircle size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{t('library.completed')}</span>
                                </div>
                                <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.completed}</span>
                            </div>
                            <div className={styles.statItem} style={{ borderRight: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                                    <TrendingUp size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{t('library.progression')}</span>
                                </div>
                                <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stats.avgProgress}%</span>
                            </div>
                        </div>

                        {!isReadOnly && (
                            <div className={styles.addWorkContainer}>
                                <Button
                                    variant="primary"
                                    onClick={() => setIsAddModalOpen(true)}
                                    icon={<Plus size={20} />}
                                    className={styles.addWorkButton}
                                    style={{
                                        height: 'auto',
                                        padding: '0.75rem 1.5rem',
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {t('library.add_work')}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Controls Bar */}
                    <div className={styles.controlsBar}>

                        {/* Search */}
                        <div className={styles.searchCard}>
                            <Search size={20} style={{ opacity: 0.4 }} />
                            <input
                                placeholder={t('library.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>

                        {/* Filter Group used for Mobile Grid Layout */}
                        <div className={styles.filterGroup}>
                            {/* Filters Dropdown */}
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Button
                                    variant="manga"
                                    icon={<Filter size={18} />}
                                    onClick={() => {
                                        setFilterOpen(!filterOpen);
                                        setSortOpen(false);
                                    }}
                                    style={{
                                        background: filterOpen ? '#000' : '#fff',
                                        color: filterOpen ? '#fff' : '#000',
                                        width: '100%',
                                        justifyContent: 'center',
                                        border: '3px solid #000',
                                        boxShadow: filterOpen ? 'none' : '6px 6px 0 #000',
                                        transform: filterOpen ? 'translate(2px, 2px)' : 'none'
                                    }}
                                >
                                    {t('library.filters')}
                                </Button>
                                {filterOpen && (
                                    <Card variant="manga" style={{
                                        position: 'absolute',
                                        top: '110%',
                                        left: 0,
                                        zIndex: 50,
                                        background: '#fff',
                                        padding: '1rem',
                                        width: '280px',
                                        maxWidth: '90vw',
                                        border: '3px solid #000',
                                        boxShadow: '6px 6px 0 #000'
                                    }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.7 }}>{t('library.type')}</h4>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {['all', 'manga', 'anime'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setFilterType(type as any)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            border: '2px solid #000',
                                                            background: filterType === type ? '#000' : '#fff',
                                                            color: filterType === type ? '#fff' : '#000',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            flex: 1,
                                                            boxShadow: filterType === type ? 'none' : '2px 2px 0 #000',
                                                            transform: filterType === type ? 'translate(2px, 2px)' : 'none',
                                                            transition: 'all 0.1s'
                                                        }}
                                                    >
                                                        {type === 'all' ? t('library.all') : type.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.7 }}>{t('library.status')}</h4>
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
                                                        {s === 'all' ? t('library.all') : s.replace(/_/g, ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Button
                                    variant="manga"
                                    icon={<SortAsc size={18} />}
                                    onClick={() => {
                                        setSortOpen(!sortOpen);
                                        setFilterOpen(false);
                                    }}
                                    style={{
                                        background: sortOpen ? '#000' : '#fff',
                                        color: sortOpen ? '#fff' : '#000',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        border: '3px solid #000',
                                        boxShadow: sortOpen ? 'none' : '6px 6px 0 #000',
                                        transform: sortOpen ? 'translate(2px, 2px)' : 'none'
                                    }}
                                >
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {sortOptions.find(o => o.value === sortBy)?.label}
                                    </span>
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
                                        border: '3px solid #000',
                                        boxShadow: '6px 6px 0 #000'
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

                            {/* View & Actions Toggle */}
                            <Card variant="manga" className={styles.viewControlsCard}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`${styles.controlButton} ${viewMode === 'grid' ? styles.controlButtonActive : ''}`}
                                    title={t('library.view_grid')}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`${styles.controlButton} ${viewMode === 'list' ? styles.controlButtonActive : ''}`}
                                    title={t('library.view_list')}
                                >
                                    <List size={20} />
                                </button>
                                {!isReadOnly && (
                                    <>
                                        <button
                                            onClick={exportData}
                                            className={styles.controlButton}
                                            title={t('library.export')}
                                        >
                                            <Download size={20} />
                                        </button>
                                        <div style={{ position: 'relative', display: 'flex' }}>
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        importData(file).then(() => {
                                                            addToast(t('library.data_imported'), 'success');
                                                        }).catch(() => addToast(t('library.error'), 'error'));
                                                    }
                                                }}
                                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }}
                                            />
                                            <button
                                                className={styles.controlButton}
                                                title={t('library.import')}
                                            >
                                                <Upload size={20} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Card>

                            {/* Selection Mode Toggle */}
                            {!isReadOnly && (
                                <div style={{ flex: '1 0 100%', display: 'flex' }}>
                                    <Button
                                        variant={isSelectionMode ? 'primary' : 'manga'}
                                        onClick={() => {
                                            setIsSelectionMode(!isSelectionMode);
                                            setSelectedWorks(new Set());
                                        }}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            background: isSelectionMode ? 'var(--color-primary)' : '#fff',
                                            color: isSelectionMode ? '#fff' : '#000',
                                            borderColor: isSelectionMode ? 'var(--color-primary)' : '#000'
                                        }}
                                    >
                                        {isSelectionMode ? t('library.cancel') : t('library.select')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Bulk Actions (outside grid) */}
                        {isSelectionMode && selectedWorks.size > 0 && !isReadOnly && (
                            <Button
                                variant="primary"
                                onClick={handleBulkDelete}
                                style={{
                                    background: '#ef4444',
                                    borderColor: '#000',
                                    boxShadow: '4px 4px 0 #000',
                                    color: '#fff',
                                    width: '100%',
                                    justifyContent: 'center'
                                }}
                                icon={<Trash2 size={16} />}
                            >
                                SUPPRIMER ({selectedWorks.size})
                            </Button>
                        )}

                    </div>

                    {/* Content Grid/List */}
                    {isLoadingFriend ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <p>Chargement de la bibliothèque...</p>
                        </div>
                    ) : filteredWorks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem' }} />
                            <h3>{t('library.no_works')}</h3>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? styles.worksGrid : styles.worksList}>
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
                                            {isSelectionMode && !isReadOnly && (
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: selectedWorks.has(work.id) ? 'rgba(255, 46, 99, 0.1)' : 'transparent',
                                                    pointerEvents: 'none',
                                                    zIndex: 10
                                                }} />
                                            )}

                                            {/* Image */}
                                            <div
                                                className={viewMode === 'grid' ? styles.workCover : undefined}
                                                style={{
                                                    height: viewMode === 'list' ? '150px' : undefined, // Handled by class in grid
                                                    width: viewMode === 'list' ? '120px' : undefined,
                                                    backgroundImage: `url(${work.image})`,
                                                    backgroundPosition: 'center',
                                                    backgroundSize: viewMode === 'list' ? 'cover' : undefined, // Class handles grid
                                                    flexShrink: 0,
                                                    borderRight: viewMode === 'list' ? '2px solid #000' : 'none',
                                                    borderBottom: viewMode === 'grid' ? '2px solid #000' : 'none'
                                                }}
                                            />

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
                                                        {work.type === 'anime' ? t('library.episode') : t('library.chapter')} {work.currentChapter} / {work.totalChapters || '?'}
                                                    </span>
                                                    {work.rating && <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24' }}>★ {work.rating}</span>}
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Delete Button */}
                                        {!isSelectionMode && !isReadOnly && (
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
                                                title={t('library.delete_work')}
                                            >
                                                <Trash2 size={16} color="#dc2626" />
                                            </button>
                                        )}

                                        {/* Selection Checkbox (Visual only) */}
                                        {isSelectionMode && !isReadOnly && (
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
                    <Modal isOpen={!!workToDelete} onClose={() => setWorkToDelete(null)} title={t('library.delete_title')}>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '50%', color: '#dc2626', border: '2px solid #dc2626' }}>
                                    <AlertTriangle size={32} />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                                {t('library.delete_question', { title: workToDelete?.title })}
                            </h3>
                            <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                                {t('library.delete_warning')}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button variant="ghost" onClick={() => setWorkToDelete(null)}>
                                    {t('library.cancel')}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={confirmDelete}
                                    style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                                >
                                    {t('library.delete_btn')}
                                </Button>
                            </div>
                        </div>
                    </Modal>

                </div>
            </div>
        </Layout>
    );
}
