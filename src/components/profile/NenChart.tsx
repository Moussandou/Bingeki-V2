import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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
    // Normalize data for the chart (0-100 scale ideally, but we'll use log/linear mix or just raw with domain max)
    // For visual balance, we'll cap values or use relative scores.
    // Let's assume a "Master" level for each stat to normalize.

    // Level: Max 100
    // Streak: Max 365
    // XP: Max 10000 (arbitrary for visual)
    // Collection: Max 500
    // Chapters: Max 5000
    // Completed: Max 100

    const data = [
        { subject: 'Niveau', A: Math.min(stats.level * 2, 100), fullMark: 100 },
        { subject: 'Passion (XP)', A: Math.min(stats.xp / 100, 100), fullMark: 100 },
        { subject: 'Assiduité', A: Math.min(stats.streak, 100), fullMark: 100 },
        { subject: 'Collection', A: Math.min(stats.totalWorksAdded / 2, 100), fullMark: 100 },
        { subject: 'Lecture', A: Math.min(stats.totalChaptersRead / 10, 100), fullMark: 100 },
        { subject: 'Complétion', A: Math.min(stats.totalWorksCompleted * 5, 100), fullMark: 100 },
    ];

    return (
        <div style={{ width: '100%', height: '300px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#000" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 12, fontWeight: 900 }} />
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
            <div style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic' }}>
                GRAPH DU CHASSEUR
            </div>
        </div>
    );
}
