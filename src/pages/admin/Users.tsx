import { useState, useEffect } from 'react';
import { Search, Shield, Ban, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { getAllUsers, toggleUserBan, toggleUserAdmin, type UserProfile } from '@/firebase/firestore';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getAllUsers();
                setUsers(data as UserProfile[]);
            } catch (e) {
                console.error("Failed to load users", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredUsers = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.uid.includes(searchTerm)
    );

    const handleBan = async (uid: string, currentStatus?: boolean) => {
        if (!confirm(`Voulez-vous vraiment ${currentStatus ? 'débannir' : 'bannir'} cet utilisateur ?`)) return;

        // Optimistic update
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: !currentStatus } : u));

        try {
            await toggleUserBan(uid, !currentStatus);
        } catch (e) {
            alert("Erreur lors de la mise à jour");
            // Revert
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: currentStatus } : u));
        }
    };

    const handleAdmin = async (uid: string, currentStatus?: boolean) => {
        if (!confirm(`ATTENTION: ${currentStatus ? 'Retirer' : 'Donner'} les droits administrateur ?`)) return;

        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isAdmin: !currentStatus } : u));

        try {
            await toggleUserAdmin(uid, !currentStatus);
        } catch (e) {
            alert("Erreur lors de la mise à jour");
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isAdmin: currentStatus } : u));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Gestion Utilisateurs
                    </h1>
                    <p style={{ color: '#666', fontFamily: 'monospace' }}>
                        {users.length} membres enregistrés
                    </p>
                </div>

                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Rechercher (Email, Pseudo...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            border: '2px solid black',
                            fontFamily: 'monospace',
                            minWidth: '300px',
                            width: '100%',
                            outline: 'none'
                        }}
                    />
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <p>Chargement...</p>
                ) : filteredUsers.map(user => (
                    <Card key={user.uid} variant="manga" style={{
                        padding: '1.5rem',
                        background: 'white',
                        position: 'relative',
                        opacity: user.isBanned ? 0.7 : 1,
                        filter: user.isBanned ? 'grayscale(100%)' : 'none'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '50%',
                                    border: '2px solid black',
                                    overflow: 'hidden',
                                    background: '#eee'
                                }}>
                                    {user.photoURL && <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', lineHeight: 1 }}>
                                        {user.displayName || 'Sans nom'}
                                    </h3>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                                </div>
                            </div>
                            {user.isAdmin && (
                                <div style={{ background: 'black', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Shield size={10} /> Admin
                                </div>
                            )}
                        </div>

                        {/* Stats Strip */}
                        <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: '1rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            <div>LVL <b>{user.level || 1}</b></div>
                            <div>XP <b>{user.xp || 0}</b></div>
                            <div>Ban <b>{user.isBanned ? 'OUI' : 'NON'}</b></div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Ban size={16} /> Bannir
                                </span>
                                <Switch isOn={!!user.isBanned} onToggle={() => handleBan(user.uid, user.isBanned)} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={16} /> Admin
                                </span>
                                <Switch isOn={!!user.isAdmin} onToggle={() => handleAdmin(user.uid, user.isAdmin)} />
                            </div>

                            <Link to={`/profile/${user.uid}`} style={{
                                marginTop: '0.5rem',
                                width: '100%',
                                padding: '0.5rem',
                                background: 'black',
                                color: 'white',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                fontSize: '0.9rem',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                            }}>
                                <ExternalLink size={14} /> Voir Profil
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
