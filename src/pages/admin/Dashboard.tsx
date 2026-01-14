import { useState, useEffect } from 'react';
import { Users, AlertCircle, TrendingUp, Activity, ExternalLink, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Link } from 'react-router-dom';
import { getAdminStats, getAllUsers } from '@/firebase/firestore';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFeedback: 0,
        newUsersToday: 0,
        pendingFeedback: 0
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>Chargement du dashboard...</div>;
    }

    useEffect(() => {
        const load = async () => {
            try {
                const [statsData, usersData] = await Promise.all([
                    getAdminStats(),
                    getAllUsers()
                ]);
                setStats(statsData);
                setRecentUsers(usersData.slice(0, 5));
            } catch (e) {
                console.error("Dashboard load failed", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2rem',
        animation: 'fadeIn 0.5s ease'
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
                    </div>
                </div>
            </div>
        </div>
    );
}
