import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { AddWorkModal } from '@/components/AddWorkModal';
import { Search, Plus, Filter, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Library() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        width: '100%',
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="manga" icon={<Filter size={18} />}>FILTRES</Button>
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

                    {/* Library Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '2rem',
                    }}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card variant="manga" style={{ padding: 0, overflow: 'hidden', height: '100%', border: '2px solid #000' }}>
                                    <div style={{ position: 'relative', aspectRatio: '2/3', borderBottom: '2px solid #000' }}>
                                        <img
                                            src={`https://picsum.photos/seed/${i + 100}/400/600`}
                                            alt="Cover"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) contrast(1.1)' }}
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
                                            border: '1px solid #fff'
                                        }}>
                                            MANGA
                                        </div>
                                    </div>

                                    <div style={{ padding: '1rem', background: '#fff', color: '#000' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                                            Titre de l'œuvre {i}
                                        </h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <span>CH. {10 * i}</span>
                                            <span style={{ opacity: 0.5 }}>ENC.</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <AddWorkModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
                </div>
            </div>
        </Layout>
    );
}
