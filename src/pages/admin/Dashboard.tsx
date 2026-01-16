import { useState, useEffect } from 'react';
import { Users, AlertCircle, TrendingUp, Activity, ExternalLink, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Link } from '@/components/routing/LocalizedLink';
import { getAdminStats, getAllUsers, getSevenDayActivityStats } from '@/firebase/firestore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFeedback: 0,
        newUsersToday: 0,
        pendingFeedback: 0
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const results = await Promise.allSettled([
                    getAdminStats(),
                    getAllUsers(),
                    getSevenDayActivityStats()
                ]);

                if (results[0].status === 'fulfilled') {
                    setStats(results[0].value);
                } else {
                    console.error("Failed to load stats:", results[0].reason);
                }

                if (results[1].status === 'fulfilled') {
                    setRecentUsers(results[1].value.slice(0, 5));
                } else {
                    console.error("Failed to load users:", results[1].reason);
                }

                if (results[2].status === 'fulfilled') {
                    setChartData(results[2].value as any[]);
                } else {
                    console.error("Failed to load chart data:", results[2].reason);
                }

            } catch (e) {
                console.error("Dashboard load failed", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>{t('admin.dashboard.loading')}</div>;
    }

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2rem',
        animation: 'fadeIn 0.5s ease',
        paddingBottom: '2rem'
    };

    const headerStyle = {
        fontFamily: 'var(--font-heading)',
        fontSize: '2.5rem',
        textTransform: 'uppercase' as const,
        marginBottom: '0.5rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
    };

    const statCardStyle = {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between',
        height: '100%',
        background: 'white'
    };

    const sectionTitleStyle = {
        fontFamily: 'var(--font-heading)',
        fontSize: '1.5rem',
        textTransform: 'uppercase' as const,
        borderBottom: '2px solid black',
        paddingBottom: '0.5rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div>
                <h1 style={headerStyle}>{t('admin.dashboard.title')}</h1>
                <p style={{
                    borderLeft: '4px solid black',
                    paddingLeft: '1rem',
                    fontFamily: 'monospace',
                    color: '#666'
                }}>
                    {t('admin.dashboard.subtitle')}
                </p>
            </div>

            {/* Stats Grid */}
            <div style={gridStyle}>
                <Card variant="manga" style={statCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>{t('admin.dashboard.users_label')}</p>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', lineHeight: 1 }}>{stats.totalUsers}</h3>
                        </div>
                        <div style={{ background: 'black', color: 'white', padding: '0.5rem', borderRadius: '4px' }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 'bold' }}>
                        <TrendingUp size={14} /> +{stats.newUsersToday} {t('admin.dashboard.today')}
                    </div>
                </Card>

                <Card variant="manga" style={statCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>{t('admin.dashboard.feedback_label')}</p>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', lineHeight: 1 }}>{stats.totalFeedback}</h3>
                        </div>
                        <div style={{ background: 'black', color: 'white', padding: '0.5rem', borderRadius: '4px' }}>
                            <AlertCircle size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', fontWeight: 'bold', color: stats.pendingFeedback > 0 ? '#ef4444' : '#10b981' }}>
                        {stats.pendingFeedback} {t('admin.dashboard.tickets_pending')}
                    </div>
                </Card>

                <Card variant="manga" style={statCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>{t('admin.dashboard.system_label')}</p>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', lineHeight: 1 }}>OK</h3>
                        </div>
                        <div style={{ background: 'black', color: 'white', padding: '0.5rem', borderRadius: '4px' }}>
                            <Activity size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        Version 3.0.0
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <Card variant="manga" style={{ padding: '1.5rem', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity className="text-red-500" size={24} />
                        <h3 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '1.25rem' }}>{t('admin.dashboard.activity_volume')}</h3>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666', fontFamily: 'monospace' }}>{t('admin.dashboard.last_7_days')}</div>
                </div>
                <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ background: 'black', border: '2px solid white', color: 'white', fontFamily: 'var(--font-heading)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="activities"
                                name="Activité"
                                stroke="#ef4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorActivity)"
                            />
                            <Area
                                type="monotone"
                                dataKey="new"
                                name="Inscriptions"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNew)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Recent Users */}
                <div>
                    <h2 style={sectionTitleStyle}>
                        <Users size={24} /> {t('admin.dashboard.recent_members')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentUsers.map(user => (
                            <Card key={user.uid} variant="manga" style={{
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {/* Avatar placeholder */}
                                    <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '50%', border: '2px solid black', overflow: 'hidden' }}>
                                        {user.photoURL && <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{user.displayName || t('admin.dashboard.anonymous')}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {user.isAdmin && <span style={{ background: 'black', color: 'white', padding: '0.2rem 0.5rem', fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>ADMIN</span>}
                                    <Link to={`/admin/users?highlight=${user.uid}`} style={{ padding: '0.5rem', border: '2px solid black', display: 'flex', alignItems: 'center' }}>
                                        <ExternalLink size={16} />
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 style={sectionTitleStyle}>
                        <Shield size={24} /> {t('admin.dashboard.quick_actions')}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                            <Card variant="manga" style={{
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'white',
                                height: '100%',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem'
                            }}>
                                <Users size={32} />
                                <span style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 900 }}>{t('admin.dashboard.manage_users')}</span>
                            </Card>
                        </Link>
                        <Link to="/admin/feedback" style={{ textDecoration: 'none' }}>
                            <Card variant="manga" style={{
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'white',
                                height: '100%',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem'
                            }}>
                                <AlertCircle size={32} />
                                <span style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 900 }}>{t('admin.dashboard.view_feedback')}</span>
                            </Card>
                        </Link>
                        <Link to="/admin/system" style={{ textDecoration: 'none', gridColumn: 'span 2' }}>
                            <Card variant="manga" style={{
                                padding: '1.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'black',
                                color: 'white',
                                height: '100%',
                                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1rem'
                            }}>
                                <Activity size={24} color="#ef4444" />
                                <span style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 900 }}>{t('admin.dashboard.live_console')}</span>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
