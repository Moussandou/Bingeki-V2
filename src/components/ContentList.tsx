import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Check, ChevronLeft, ChevronRight, Eye, Loader2, Tv, FileText } from 'lucide-react';

import logoCrunchyroll from '@/assets/logo_crunchyroll.png';
import logoADN from '@/assets/logo_adn.png';


export interface ContentItem {
    id: number;
    title: string;
    number: number;
    date: string | null;
    isFiller?: boolean;
    synopsis?: string | null;
}

interface ContentListProps {
    items: ContentItem[];
    currentProgress: number;
    onSelect: (itemNumber: number) => void;
    onExpand?: (itemNumber: number) => void;
    isLoading?: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    onNextPage?: () => void;
    onPrevPage?: () => void;
    page?: number;
    workTitle: string;
    workType: 'anime' | 'manga';
    readOnly?: boolean;
}

export function ContentList({
    items,
    currentProgress,
    onSelect,
    onExpand,
    isLoading,
    hasNextPage,
    hasPrevPage,
    onNextPage,
    onPrevPage,
    page = 1,
    workTitle,
    workType,
    readOnly = false
}: ContentListProps) {
    const [visibleCount, setVisibleCount] = useState(25);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    // Reset visible count when items (page) changes
    useEffect(() => {
        setVisibleCount(25);
    }, [items]);

    const toggleExpand = async (id: number, number: number) => {
        if (expandedIds.includes(id)) {
            setExpandedIds(prev => prev.filter(eid => eid !== id));
        } else {
            setExpandedIds(prev => [...prev, id]);
            // If we don't have synopsis and onExpand is provided, fetch it
            const item = items.find(i => i.id === id);
            if (item && !item.synopsis && onExpand) {
                setLoadingIds(prev => [...prev, id]);
                await onExpand(number); // Pass the episode number usually used for API
                setLoadingIds(prev => prev.filter(lid => lid !== id));
            }
        }
    };

    const openLink = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        window.open(url, '_blank');
    };

    if (isLoading && items.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="spin" /></div>;
    }

    if (items.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>Aucun contenu disponible.</div>;
    }

    const visibleItems = items.slice(0, visibleCount);
    const hasMoreLocal = visibleCount < items.length;

    return (
        <div className="content-list-container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {visibleItems.map((item) => {
                    const isWatched = item.number <= currentProgress;
                    const isExpanded = expandedIds.includes(item.id);
                    const isLoadingDetails = loadingIds.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            className="manga-panel"
                            style={{
                                padding: '1rem',
                                background: isWatched ? '#f0f0f0' : '#fff',
                                opacity: isWatched ? 0.9 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: isWatched ? '#000' : 'var(--color-primary)',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 900,
                                        fontSize: '1.2rem',
                                        flexShrink: 0
                                    }}>
                                        {item.number}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{ fontWeight: 700, cursor: 'pointer' }}
                                            onClick={() => toggleExpand(item.id, item.number)}
                                        >
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                            {item.date ? new Date(item.date).toLocaleDateString() : 'Date inconnue'} {item.isFiller && '(Filler)'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {/* Link Buttons */}
                                    {workType === 'anime' ? (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => openLink(e, `https://www.google.com/search?q=site:crunchyroll.com/fr/watch ${encodeURIComponent(workTitle)} episode ${item.number}`)}
                                                title="Regarder sur Crunchyroll"
                                                style={{ padding: '0', height: '36px', width: '36px', overflow: 'hidden' }}
                                            >
                                                <img src={logoCrunchyroll} alt="CR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => openLink(e, `https://www.google.com/search?q=site:animationdigitalnetwork.fr ${encodeURIComponent(workTitle)} episode ${item.number}`)}
                                                title="Regarder sur ADN"
                                                style={{ padding: '0', height: '36px', width: '36px', overflow: 'hidden' }}
                                            >
                                                <img src={logoADN} alt="ADN" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => openLink(e, `https://www.google.com/search?q=${encodeURIComponent(workTitle)} episode ${item.number} streaming vostfr`)}
                                                title="Rechercher Streaming VOSTFR"
                                                style={{ padding: '0.5rem', color: '#64748b' }}
                                            >
                                                <Tv size={20} />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => openLink(e, `https://www.google.com/search?q=manga scan ${encodeURIComponent(workTitle)} chapitre ${item.number} fr`)}
                                            title="Rechercher Scan FR"
                                            style={{ padding: '0.5rem', color: '#22c55e' }}
                                        >
                                            <FileText size={18} />
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpand(item.id, item.number)}
                                        style={{ padding: '0.5rem' }}
                                    >
                                        {isExpanded ? <ChevronLeft style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft style={{ transform: 'rotate(0deg)' }} />}
                                    </Button>
                                    {!readOnly && (
                                        <Button
                                            variant={isWatched ? 'ghost' : 'outline'}
                                            size="sm"
                                            onClick={() => onSelect(item.number)}
                                            icon={isWatched ? <Check size={16} /> : <Eye size={16} />}
                                        >
                                            {isWatched ? 'VU' : 'VOIR'}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Synopsis Section */}
                            {isExpanded && (
                                <div style={{ marginTop: '1rem', borderTop: '1px dashed #ccc', paddingTop: '1rem', paddingLeft: '3.5rem' }}>
                                    {isLoadingDetails ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
                                            <Loader2 size={16} className="spin" /> Chargement du résumé...
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                            {item.synopsis ? item.synopsis : "Aucun résumé disponible."}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Local "Show More" Button */}
            {hasMoreLocal && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Button
                        variant="ghost"
                        onClick={() => setVisibleCount(prev => prev + 25)}
                        style={{ width: '100%', border: '1px dashed #ccc' }}
                    >
                        AFFICHER PLUS D'ÉPISODES
                    </Button>
                </div>
            )}

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
                <Button
                    variant="ghost"
                    onClick={onPrevPage}
                    disabled={!hasPrevPage || isLoading}
                >
                    <ChevronLeft /> Précédent
                </Button>
                <span style={{ fontWeight: 900 }}>PAGE {page}</span>
                <Button
                    variant="ghost"
                    onClick={onNextPage}
                    disabled={!hasNextPage || isLoading}
                >
                    Suivant <ChevronRight />
                </Button>
            </div>
        </div>
    );
}
