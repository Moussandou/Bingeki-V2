import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NenChartProps {
    stats: {
        level: number;
        xp: number;
        streak: number;
        totalChaptersRead: number;
        totalWorksAdded: number;
        totalWorksCompleted: number;
    };
    themeColor?: string;
}

export function NenChart({ stats, themeColor = '#FF2E63' }: NenChartProps) {
    const { t } = useTranslation();
    const [showLegend, setShowLegend] = useState(false);

    // Normalize data for the chart (0-100 scale)
    const data = [
        { subject: t('stats.level'), A: Math.min(stats.level * 2, 100), fullMark: 100 },
        { subject: t('stats.passion'), A: Math.min(stats.xp / 100, 100), fullMark: 100 },
        { subject: t('stats.diligence'), A: Math.min(stats.streak, 100), fullMark: 100 },
        { subject: t('stats.collection'), A: Math.min(stats.totalWorksAdded / 2, 100), fullMark: 100 },
        { subject: t('stats.reading'), A: Math.min(stats.totalChaptersRead / 10, 100), fullMark: 100 },
        { subject: t('stats.completion'), A: Math.min(stats.totalWorksCompleted * 5, 100), fullMark: 100 },
    ];

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '180px', position: 'relative' }}>
            {/* Info button */}
            <button
                onClick={() => setShowLegend(!showLegend)}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: 0.5,
                    zIndex: 10
                }}
                title="Comment ça marche ?"
            >
                <Info size={16} />
            </button>

            {/* Legend Modal */}
            {showLegend && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.95)',
                    zIndex: 20,
                    padding: '0.75rem',
                    fontSize: '0.7rem',
                    lineHeight: 1.4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    border: '2px solid #000'
                }}>
                    <div style={{ fontWeight: 900, marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📊 {t('stats.legend.title')}</span>
                        <button onClick={() => setShowLegend(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900 }}>✕</button>
                    </div>
                    <div><strong>{t('stats.level')}</strong>: {t('stats.legend.level')}</div>
                    <div><strong>{t('stats.passion')}</strong>: {t('stats.legend.passion')}</div>
                    <div><strong>{t('stats.diligence')}</strong>: {t('stats.legend.diligence')}</div>
                    <div><strong>{t('stats.collection')}</strong>: {t('stats.legend.collection')}</div>
                    <div><strong>{t('stats.reading')}</strong>: {t('stats.legend.reading')}</div>
                    <div><strong>{t('stats.completion')}</strong>: {t('stats.legend.completion')}</div>
                </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="45%" data={data}>
                    <PolarGrid stroke="#000" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Stats"
                        dataKey="A"
                        stroke={themeColor}
                        strokeWidth={3}
                        fill={themeColor}
                        fillOpacity={0.6}
                    />
                </RadarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', bottom: -10, width: '100%', textAlign: 'center', fontSize: '0.6rem', opacity: 0.5, fontStyle: 'italic' }}>
                {t('stats.chart_title')}
            </div>
        </div>
    );
}
