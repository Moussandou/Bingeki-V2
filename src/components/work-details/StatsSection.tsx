import { BarChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Button } from '@/components/ui/Button';
import styles from '@/pages/WorkDetails.module.css';
import type { JikanStatistics, JikanStaff } from '@/services/animeApi';

interface StatsSectionProps {
    statistics: JikanStatistics | null;
    staff: JikanStaff[];
    hideScores: boolean;
    isStaffExpanded: boolean;
    setIsStaffExpanded: (expanded: boolean) => void;
}

export function StatsSection({ statistics, staff, hideScores, isStaffExpanded, setIsStaffExpanded }: StatsSectionProps) {
    const { t } = useTranslation();

    if (!statistics && staff.length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6, fontStyle: 'italic', border: '2px dashed var(--color-border-heavy)' }}>
                {t('work_details.stats.no_data')}
            </div>
        );
    }

    return (
        <>
            {/* STAFF SECTION */}
            {staff.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 className={styles.sectionTitle}>{t('work_details.stats.staff_title')}</h3>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        justifyContent: 'center'
                    }}>
                        {staff
                            .filter(s => s.positions.some(p => p.includes('Director') || p === 'Character Design' || p === 'Music' || p === 'Series Composition'))
                            .filter((s, index, self) => index === self.findIndex((t) => t.person.mal_id === s.person.mal_id))
                            .slice(0, isStaffExpanded ? undefined : 6)
                            .map((s) => (
                                <div key={s.person.mal_id} style={{ minWidth: '120px', maxWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-border-heavy)', marginBottom: '0.5rem', boxShadow: '3px 3px 0 0px var(--color-shadow-solid)' }}>
                                        {s.person.images.jpg.image_url ? (
                                            <OptimizedImage
                                                src={s.person.images.jpg.image_url}
                                                alt={s.person.name}
                                                objectFit="cover"
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900 }}>?</div>
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2, width: '100%', whiteSpace: 'normal' }}>{s.person.name}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', marginTop: '0.2rem' }}>
                                        {s.positions.filter(p => p.includes('Director') || p === 'Character Design' || p === 'Music' || p === 'Series Composition').join(', ')}
                                    </span>
                                </div>
                            ))}
                    </div>

                    {/* Show More Staff Button */}
                    {staff.filter(s => s.positions.some(p => p.includes('Director') || p === 'Character Design' || p === 'Music' || p === 'Series Composition')).length > 6 && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Button
                                onClick={() => setIsStaffExpanded(!isStaffExpanded)}
                                variant="ghost"
                                style={{ border: '1px dashed var(--color-border-heavy)' }}
                            >
                                {isStaffExpanded ? t('work_details.stats.show_less') : t('work_details.stats.show_more')}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* STATISTICS SECTION */}
            {statistics && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-border-heavy)', paddingBottom: '0.5rem' }}>
                        <BarChart size={24} strokeWidth={2.5} />
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0 }}>{t('work_details.stats.title')}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {/* Status Distribution */}
                        <div style={{ border: '2px solid var(--color-border-heavy)', padding: '1rem', background: 'var(--color-surface)', boxShadow: '4px 4px 0 var(--color-shadow)' }}>
                            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>{t('work_details.stats.library_distribution')}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {[
                                    { label: t('work_details.status.watching'), value: statistics.watching, color: '#2ecc71' },
                                    { label: t('work_details.status.completed'), value: statistics.completed, color: '#3498db' },
                                    { label: t('work_details.status.on_hold'), value: statistics.on_hold, color: '#f1c40f' },
                                    { label: t('work_details.status.dropped'), value: statistics.dropped, color: '#e74c3c' },
                                    { label: t('work_details.status.plan_to_watch'), value: statistics.plan_to_watch, color: '#95a5a6' }
                                ].map(stat => (
                                    <div key={stat.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>
                                            <span>{stat.label}</span>
                                            <span>{(stat.value || 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'var(--color-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${((stat.value || 0) / (statistics.total || 1)) * 100}%`,
                                                background: stat.color
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Score Distribution */}
                        {!hideScores && statistics.scores && statistics.scores.length > 0 && (
                            <div style={{ border: '2px solid var(--color-border-heavy)', padding: '1rem', background: 'var(--color-surface)', boxShadow: '4px 4px 0 var(--color-shadow)' }}>
                                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>{t('work_details.stats.score_distribution')}</h4>
                                <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '2px' }}>
                                    {statistics.scores.sort((a, b) => a.score - b.score).map((score) => (
                                        <div key={score.score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{
                                                width: '100%',
                                                background: 'var(--color-text)',
                                                height: `${score.percentage}%`,
                                                minHeight: '2px',
                                                position: 'relative',
                                                transition: 'height 0.3s ease'
                                            }} title={`${score.percentage}%`}></div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '4px' }}>{score.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
