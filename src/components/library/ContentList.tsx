import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    streamingServices?: { name: string; url: string }[];
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
    readOnly = false,
    streamingServices = []
}: ContentListProps) {
    const { t } = useTranslation();
    const [visibleCount, setVisibleCount] = useState(25);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    // Reset visible count when items (page) changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>{t('content_list.no_content')}</div>;
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
                                background: isWatched ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                                opacity: isWatched ? 0.8 : 1,
                                transition: 'all 0.2s',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: isWatched ? 'var(--color-text-dim)' : 'var(--color-primary)',
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
                                            style={{ fontWeight: 700, cursor: 'pointer', color: 'var(--color-text)' }}
                                            onClick={() => toggleExpand(item.id, item.number)}
                                        >
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--color-text-dim)' }}>
                                            {item.date ? new Date(item.date).toLocaleDateString() : t('content_list.unknown_date')} {item.isFiller && '(Filler)'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {/* Link Buttons */}
                                    {workType === 'anime' ? (
                                        <>
                                            {/* Crunchyroll */}
                                            {streamingServices.some(s => s.name.toLowerCase().includes('crunchyroll')) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => openLink(e, `https://www.google.com/search?q=site:crunchyroll.com/fr/watch ${encodeURIComponent(workTitle)} episode ${item.number}`)}
                                                    title={t('content_list.watch_on_crunchyroll')}
                                                    style={{ padding: '0', height: '36px', width: '36px', overflow: 'hidden' }}
                                                >
                                                    <img src={logoCrunchyroll} alt="CR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </Button>
                                            )}

                                            {/* ADN */}
                                            {streamingServices.some(s => s.name.toLowerCase().includes('adn') || s.name.toLowerCase().includes('animation digital network')) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => openLink(e, `https://www.google.com/search?q=site:animationdigitalnetwork.fr ${encodeURIComponent(workTitle)} episode ${item.number}`)}
                                                    title={t('content_list.watch_on_adn')}
                                                    style={{ padding: '0', height: '36px', width: '36px', overflow: 'hidden' }}
                                                >
                                                    <img src={logoADN} alt="ADN" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </Button>
                                            )}

                                            {/* Generic / Google Search */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => openLink(e, `https://www.google.com/search?q=${encodeURIComponent(workTitle)} episode ${item.number} streaming vostfr`)}
                                                title={t('content_list.search_streaming')}
                                                style={{ padding: '0.5rem', color: 'var(--color-text-dim)' }}
                                            >
                                                <Tv size={20} />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => openLink(e, `https://www.google.com/search?q=manga scan ${encodeURIComponent(workTitle)} chapitre ${item.number} fr`)}
                                            title={t('content_list.search_scan')}
                                            style={{ padding: '0.5rem', color: '#22c55e' }}
                                        >
                                            <FileText size={18} />
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpand(item.id, item.number)}
                                        style={{ padding: '0.5rem', color: 'var(--color-text)' }}
                                    >
                                        {isExpanded ? <ChevronLeft style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft style={{ transform: 'rotate(0deg)' }} />}
                                    </Button>
                                    {!readOnly && (
                                        <Button
                                            variant={isWatched ? 'ghost' : 'outline'}
                                            size="sm"
                                            onClick={() => onSelect(item.number)}
                                            icon={isWatched ? <Check size={16} /> : <Eye size={16} />}
                                            style={{ color: isWatched ? 'var(--color-text-dim)' : 'var(--color-text)' }}
                                        >
                                            {isWatched ? t('content_list.seen') : t('content_list.see')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Synopsis Section */}
                            {isExpanded && (
                                <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--color-border)', paddingTop: '1rem', paddingLeft: '3.5rem', color: 'var(--color-text)' }}>
                                    {isLoadingDetails ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
                                            <Loader2 size={16} className="spin" /> {t('content_list.loading_summary')}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                            {item.synopsis ? item.synopsis : t('content_list.no_summary')}
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
                        style={{ width: '100%', border: '1px dashed var(--color-border)' }}
                    >
                        {t('content_list.show_more')}
                    </Button>
                </div>
            )}

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', borderTop: '2px solid var(--color-border)', paddingTop: '1rem' }}>
                <Button
                    variant="ghost"
                    onClick={onPrevPage}
                    disabled={!hasPrevPage || isLoading}
                >
                    <ChevronLeft /> {t('content_list.previous')}
                </Button>
                <span style={{ fontWeight: 900 }}>{t('content_list.page')} {page}</span>
                <Button
                    variant="ghost"
                    onClick={onNextPage}
                    disabled={!hasNextPage || isLoading}
                >
                    {t('content_list.next')} <ChevronRight />
                </Button>
            </div>
        </div>
    );
}
