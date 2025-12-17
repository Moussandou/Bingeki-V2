import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import type { JikanResult } from '@/services/animeApi';
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CarouselProps {
    title: React.ReactNode;
    items: JikanResult[];
    onItemClick: (work: JikanResult) => void;
    libraryIds: Set<string | number>; // For checking if owned
    onAdd: (work: JikanResult) => void;
    loading?: boolean;
}

export function Carousel({ title, items, onItemClick, libraryIds, onAdd, loading }: CarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!loading && items.length === 0) return null;

    return (
        <div style={{ marginBottom: '3rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#000' }}>
                    {title}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => scroll('left')}
                        style={{ border: '2px solid #000', background: '#fff', cursor: 'pointer', padding: '0.5rem', boxShadow: '2px 2px 0 #000' }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        style={{ border: '2px solid #000', background: '#fff', cursor: 'pointer', padding: '0.5rem', boxShadow: '2px 2px 0 #000' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: '1.5rem',
                    overflowX: 'auto',
                    padding: '1rem 0.5rem',
                    scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none' // IE/Edge
                }}
                className="hide-scrollbar"
            >
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ flex: '0 0 200px', scrollSnapAlign: 'start' }}>
                            <Card variant="manga" style={{ padding: 0, overflow: 'hidden', height: '100%', border: '2px solid #000' }}>
                                <div style={{ aspectRatio: '2/3', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #ddd', borderTopColor: '#000', animation: 'spin 1s linear infinite' }} />
                                </div>
                                <div style={{ padding: '0.75rem', background: '#fff' }}>
                                    <div style={{ height: '1rem', background: '#eee', marginBottom: '0.5rem', width: '80%' }}></div>
                                    <div style={{ height: '0.8rem', background: '#eee', width: '50%' }}></div>
                                </div>
                            </Card>
                        </div>
                    ))
                    : items.map((work) => {
                        const isOwned = libraryIds.has(work.mal_id);
                        return (
                            <motion.div
                                key={work.mal_id}
                                whileHover={{ y: -5 }}
                                style={{
                                    flex: '0 0 200px', // Fixed width cards
                                    scrollSnapAlign: 'start',
                                    position: 'relative'
                                }}
                            >
                                <Card
                                    variant="manga"
                                    style={{ padding: 0, overflow: 'hidden', height: '100%', border: '2px solid #000', cursor: 'pointer' }}
                                    onClick={() => onItemClick(work)}
                                >
                                    <div style={{ position: 'relative', aspectRatio: '2/3', borderBottom: '2px solid #000' }}>
                                        <img
                                            src={work.images.jpg.image_url}
                                            alt={work.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {isOwned && (
                                            <div style={{ position: 'absolute', top: 5, right: 5, background: '#000', color: '#fff', padding: '4px', borderRadius: '50%' }}>
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '0.75rem', background: '#fff' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4em' }}>
                                            {work.title}
                                        </h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>{work.type}</span>
                                            {!isOwned && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAdd(work);
                                                    }}
                                                    style={{ padding: '4px 8px', height: 'auto', border: '1px solid #000' }}
                                                >
                                                    <Plus size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
            </div>
        </div>
    );
}
