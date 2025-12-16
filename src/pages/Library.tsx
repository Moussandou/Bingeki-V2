import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { AddWorkModal } from '@/components/AddWorkModal';
import { useLibraryStore } from '@/store/libraryStore';
import { Search, Plus, Filter, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

export default function Library() {
    const navigate = useNavigate();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'manga' | 'anime'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'reading' | 'completed' | 'plan_to_read'>('all');
    const { works } = useLibraryStore();

    const filteredWorks = works.filter(work => {
        const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || work.type === filterType;
        const matchesStatus = filterStatus === 'all' || work.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

                    {/* Header Panel */}
                    <header className="manga-panel" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: '#fff',
                        color: '#000'
                    }}>
                        <div>
                            <h1 className="text-outline" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', lineHeight: 1, letterSpacing: '-1px', color: '#000', textShadow: '2px 2px 0 #fff' }}>Bibliothèque</h1>
                            <p style={{ fontWeight: 600, opacity: 0.6, color: '#000' }}>Vos aventures en cours et terminées</p>
                        </div>
                        <Button variant="primary" onClick={() => setIsAddModalOpen(true)} icon={<Plus size={18} />} style={{ border: '2px solid #000', borderRadius: 0, boxShadow: '4px 4px 0 #000', color: '#fff' }}>
                            AJOUTER
                        </Button>
                    </header>

                    {/* Filters & Search Panel */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <div className="manga-panel" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', background: '#fff', boxShadow: '4px 4px 0 rgba(0,0,0,0.2)' }}>
                                <Search size={20} style={{ margin: '0 0.5rem', color: '#000' }} />
                                <input
                                    placeholder="Rechercher une œuvre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        width: '100%',
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        background: 'transparent',
                                        color: '#000'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                            {/* Filter Dropdown */}
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

                            <div className="manga-panel" style={{ display: 'flex', padding: '0', background: '#fff', height: '100%', alignItems: 'center' }}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    style={{
                                        padding: '0 1rem',
                                        height: '100%',
                                        background: viewMode === 'grid' ? '#000' : 'transparent',
                                        color: viewMode === 'grid' ? '#fff' : '#000',
                                        border: 'none',
                                        cursor: 'pointer',
                                        borderRight: '2px solid #000'
                                    }}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    style={{
                                        padding: '0 1rem',
                                        height: '100%',
                                        background: viewMode === 'list' ? '#000' : 'transparent',
                                        color: viewMode === 'list' ? '#fff' : '#000',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Library Grid / List */}
                    {filteredWorks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                                {searchQuery || filterType !== 'all' || filterStatus !== 'all' ? 'AUCUN RÉSULTAT...' : "C'EST VIDE ICI..."}
                            </h3>
                            <p style={{ marginBottom: '2rem' }}>
                                Essayez de modifier vos filtres ou ajoutez une nouvelle œuvre.
                            </p>
                            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>AJOUTER UNE ŒUVRE</Button>
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '2rem',
                            }}>
                                {filteredWorks.map((work) => (
                                    <motion.div
                                        key={work.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -5 }}
                                        onClick={() => navigate(`/work/${work.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Card variant="manga" style={{ padding: 0, overflow: 'hidden', height: '100%', border: '2px solid #000' }}>
                                            <div style={{ position: 'relative', aspectRatio: '2/3', borderBottom: '2px solid #000' }}>
                                                <img
                                                    src={work.image}
                                                    alt={work.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0%) contrast(1.1)' }}
                                                />

                                                {/* Tag */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '0.5rem',
                                                    left: '0.5rem',
                                                    background: '#000',
                                                    color: '#fff',
                                                    padding: '2px 8px',
                                                    fontWeight: 900,
                                                    fontSize: '0.75rem',
                                                    transform: 'skewX(-10deg)',
                                                    border: '1px solid #fff',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {work.type}
                                                </div>
                                            </div>

                                            <div style={{ padding: '1rem', background: '#fff', color: '#000' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', lineHeight: 1.1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {work.title}
                                                </h3>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <span>{work.currentChapter} / {work.totalChapters || '?'}</span>
                                                    <span style={{ opacity: 0.5, textTransform: 'uppercase' }}>{work.status}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredWorks.map((work) => (
                                    <motion.div
                                        key={work.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => navigate(`/work/${work.id}`)}
                                        className="manga-panel"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.5rem',
                                            background: '#fff',
                                            border: '2px solid #000',
                                            cursor: 'pointer',
                                            gap: '1rem',
                                            boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
                                        }}
                                        whileHover={{ x: 5 }}
                                    >
                                        <img
                                            src={work.image}
                                            alt={work.title}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                objectFit: 'cover',
                                                border: '2px solid #000',
                                                borderRadius: '50%'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontSize: '1.2rem',
                                                fontFamily: 'var(--font-heading)',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {work.title}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>
                                                <span style={{ textTransform: 'uppercase', background: '#000', color: '#fff', padding: '0 4px' }}>{work.type}</span>
                                                <span>{work.status.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                        <div style={{ paddingRight: '1rem', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                                            {work.currentChapter} <span style={{ fontSize: '1rem', opacity: 0.4 }}>/ {work.totalChapters || '?'}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    )}

                    <AddWorkModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
                </div>
            </div>
        </Layout>
    );
}
