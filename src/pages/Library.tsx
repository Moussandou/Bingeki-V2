import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AddWorkModal } from '@/components/AddWorkModal';
import { Search, Plus, Filter, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Library() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Bibliothèque</h1>
                        <p style={{ color: 'var(--color-text-dim)' }}>Vos aventures en cours et terminées</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} icon={<Plus size={18} />}>
                        Ajouter
                    </Button>
                </header>

                {/* Filters & Search */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <Input placeholder="Rechercher dans la bibliothèque..." icon={<Search size={18} />} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="outline" icon={<Filter size={18} />}>Filtres</Button>
                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--glass-border)', borderRadius: '4px', display: 'flex', padding: '0.25rem' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{ padding: '0.5rem', borderRadius: '2px', background: viewMode === 'grid' ? 'var(--color-surface-hover)' : 'transparent', color: viewMode === 'grid' ? '#fff' : 'var(--color-text-dim)' }}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{ padding: '0.5rem', borderRadius: '2px', background: viewMode === 'list' ? 'var(--color-surface-hover)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--color-text-dim)' }}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Library Grid / Wall */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '2rem',
                    perspective: '1000px' // For 3D tilt effect context
                }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{
                                scale: 1.05,
                                rotateY: 5,
                                zIndex: 10,
                                transition: { duration: 0.2 }
                            }}
                            style={{ position: 'relative', transformStyle: 'preserve-3d' }}
                        >
                            <Card style={{ padding: 0, overflow: 'hidden', height: '100%', border: 'none' }}>
                                <div style={{ position: 'relative', aspectRatio: '2/3' }}>
                                    <img
                                        src={`https://picsum.photos/seed/${i + 100}/400/600`}
                                        alt="Cover"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)'
                                    }} />

                                    {/* Halftone overlay effect on hover (simulated with opacity) */}
                                    <div className="halftone-overlay" style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'radial-gradient(circle, #000 1px, transparent 1px)',
                                        backgroundSize: '4px 4px',
                                        opacity: 0,
                                        transition: 'opacity 0.2s'
                                    }} />

                                    <div style={{ position: 'absolute', bottom: 0, padding: '1rem', width: '100%' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            Titre de l'œuvre {i}
                                        </h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                                            <span>Chapitre {10 * i}</span>
                                            <span>Manga</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <AddWorkModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            </div>
        </Layout>
    );
}
