import { useState, useEffect } from 'react';
import { Users, AlertCircle, TrendingUp, Activity, ExternalLink, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Link } from 'react-router-dom';
import { getAdminStats, getAllUsers } from '@/firebase/firestore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFeedback: 0,
        newUsersToday: 0,
        pendingFeedback: 0
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock data for the chart (since we don't have historical stats yet)
    // In a real app, this would come from an aggregation collection
    const chartData = [
        { name: 'Lun', active: 400, new: 24, activities: 240 },
        { name: 'Mar', active: 300, new: 13, activities: 198 },
        { name: 'Mer', active: 200, new: 58, activities: 480 },
        { name: 'Jeu', active: 278, new: 39, activities: 308 },
        { name: 'Ven', active: 189, new: 48, activities: 400 },
        { name: 'Sam', active: 239, new: 38, activities: 380 },
        { name: 'Dim', active: 349, new: 43, activities: 430 },
    ];

    useEffect(() => {
        const load = async () => {
            try {
                const results = await Promise.allSettled([
                    getAdminStats(),
                    getAllUsers()
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
            } catch (e) {
                console.error("Dashboard load failed", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>Chargement du dashboard...</div>;
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
                <h1 style={headerStyle}>Centre de Contrôle</h1>
                <p style={{
                    borderLeft: '4px solid black',
                    paddingLeft: '1rem',
                    fontFamily: 'monospace',
                    color: '#666'
                }}>
                    Vue d'ensemble de l'activité sur Bingeki
                </p>
            </div>

            {/* Stats Grid */}
            <div style={gridStyle}>
                <Card variant="manga" style={statCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>Utilisateurs</p>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', lineHeight: 1 }}>{stats.totalUsers}</h3>
                        </div>
                        <div style={{ background: 'black', color: 'white', padding: '0.5rem', borderRadius: '4px' }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 'bold' }}>
                        <TrendingUp size={14} /> +{stats.newUsersToday} aujourd'hui
                    </div>
                </Card>

                <Card variant="manga" style={statCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>Feedback</p>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', lineHeight: 1 }}>{stats.totalFeedback}</h3>
                        </div>
                        <div style={{ background: 'black', color: 'white', padding: '0.5rem', borderRadius: '4px' }}>
                            <AlertCircle size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', fontWeight: 'bold', color: stats.pendingFeedback > 0 ? '#ef4444' : '#10b981' }}>
                        {stats.pendingFeedback} tickets en attente
                    </div>
                </Card>

                <Card variant="manga" style={statCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>Système</p>
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
                        <h3 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '1.25rem' }}>Volume d'Activité</h3>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666', fontFamily: 'monospace' }}>DERNIERS 7 JOURS</div>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                                itemStyle={{ color: '#ef4444' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="activities"
                                stroke="#ef4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorActivity)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Recent Users */}
                <div>
                    <h2 style={sectionTitleStyle}>
                        <Users size={24} /> Derniers Membres
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
                                        <div style={{ fontWeight: 'bold' }}>{user.displayName || 'Anonyme'}</div>
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
                        <Shield size={24} /> Actions Rapides
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
                                <span style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 900 }}>Gérer Utilisateurs</span>
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
                                <span style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 900 }}>Voir Feedback</span>
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
                                <span style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 900 }}>Live Console</span>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
