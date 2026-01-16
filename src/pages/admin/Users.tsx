import { useState, useEffect } from 'react';
import { Search, Shield, Ban, ExternalLink, Edit, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { getAllUsers, toggleUserBan, toggleUserAdmin, adminUpdateUserGamification, type UserProfile } from '@/firebase/firestore';
import { Link } from '@/components/routing/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminUsers() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [modalType, setModalType] = useState<'level' | 'details' | null>(null);
    const [editLevel, setEditLevel] = useState(1);
    const [editXp, setEditXp] = useState(0);

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
        const action = currentStatus ? t('admin.users.action_unban') : t('admin.users.action_ban');
        if (!confirm(t('admin.users.confirm_ban', { action }))) return;

        // Optimistic update
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: !currentStatus } : u));

        try {
            await toggleUserBan(uid, !currentStatus);
        } catch (e) {
            alert(t('admin.users.update_error'));
            // Revert
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: currentStatus } : u));
        }
    };

    const handleAdmin = async (uid: string, currentStatus?: boolean) => {
        const action = currentStatus ? t('admin.users.action_remove') : t('admin.users.action_give');
        if (!confirm(t('admin.users.confirm_admin', { action }))) return;

        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isAdmin: !currentStatus } : u));

        try {
            await toggleUserAdmin(uid, !currentStatus);
        } catch (e) {
            alert(t('admin.users.update_error'));
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isAdmin: currentStatus } : u));
        }
    };

    const openLevelModal = (user: UserProfile) => {
        setSelectedUser(user);
        setEditLevel(user.level || 1);
        setEditXp(user.xp || 0);
        setModalType('level');
    };

    const openDetailsModal = (user: UserProfile) => {
        setSelectedUser(user);
        setModalType('details');
    };

    const handleSaveLevel = async () => {
        if (!selectedUser) return;
        try {
            await adminUpdateUserGamification(selectedUser.uid, Number(editLevel), Number(editXp));
            setUsers(prev => prev.map(u => u.uid === selectedUser.uid ? { ...u, level: Number(editLevel), xp: Number(editXp) } : u));
            setModalType(null);
            alert("User stats updated successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to update user stats.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        {t('admin.users.title')}
                    </h1>
                    <p style={{ color: '#666', fontFamily: 'monospace' }}>
                        {t('admin.users.members_count', { count: users.length })}
                    </p>
                </div>

                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder={t('admin.users.search_placeholder')}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <p>{t('admin.users.loading')}</p>
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
                                        {user.displayName || t('admin.users.no_name')}
                                    </h3>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                                </div>
                            </div>
                            {user.isAdmin && (
                                <div style={{ background: 'black', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Shield size={10} /> {t('admin.users.admin')}
                                </div>
                            )}
                        </div>

                        {/* Stats Strip */}
                        <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: '1rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            <div>LVL <b>{user.level || 1}</b></div>
                            <div>XP <b>{user.xp || 0}</b></div>
                            <div>Ban <b>{user.isBanned ? t('admin.users.ban_yes') : t('admin.users.ban_no')}</b></div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Ban size={16} /> {t('admin.users.ban')}
                                </span>
                                <Switch isOn={!!user.isBanned} onToggle={() => handleBan(user.uid, user.isBanned)} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={16} /> {t('admin.users.admin')}
                                </span>
                                <Switch isOn={!!user.isAdmin} onToggle={() => handleAdmin(user.uid, user.isAdmin)} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openLevelModal(user)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}
                                >
                                    <Edit size={14} /> Edit Level
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDetailsModal(user)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}
                                >
                                    <Eye size={14} /> Details
                                </Button>
                            </div>

                            <Link to={`/profile/${user.uid}`} style={{
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
                                <ExternalLink size={14} /> {t('admin.users.view_profile')}
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Level Edit Modal */}
            <Modal isOpen={modalType === 'level'} onClose={() => setModalType(null)} title="Edit User Stats">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Level</label>
                        <Input type="number" value={editLevel} onChange={(e) => setEditLevel(Number(e.target.value))} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>XP</label>
                        <Input type="number" value={editXp} onChange={(e) => setEditXp(Number(e.target.value))} />
                    </div>
                    <Button onClick={handleSaveLevel} style={{ width: '100%' }}>Save Changes</Button>
                </div>
            </Modal>

            {/* User Details Modal */}
            <Modal isOpen={modalType === 'details'} onClose={() => setModalType(null)} title="User Details">
                {selectedUser && (
                    <div style={{
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {/* Basic Info */}
                        <div style={{ background: '#fff', border: '2px solid #000', padding: '1rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>BASIC INFO</h3>
                            <table style={{ width: '100%', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                <tbody>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0', width: '40%' }}>UID:</td><td style={{ wordBreak: 'break-all' }}>{selectedUser.uid}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>Display Name:</td><td>{selectedUser.displayName || 'N/A'}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>Email:</td><td>{selectedUser.email || 'N/A'}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>Photo URL:</td><td style={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>{selectedUser.photoURL || 'N/A'}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Gamification */}
                        <div style={{ background: '#fff', border: '2px solid #000', padding: '1rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>GAMIFICATION</h3>
                            <table style={{ width: '100%', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                <tbody>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0', width: '40%' }}>Level:</td><td>{selectedUser.level || 1}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>XP:</td><td>{selectedUser.xp || 0}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>Streak:</td><td>{selectedUser.streak || 0} days</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>Last Login:</td><td>{selectedUser.lastLogin || 'N/A'}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Admin Status */}
                        <div style={{ background: '#fff', border: '2px solid #000', padding: '1rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>PERMISSIONS</h3>
                            <table style={{ width: '100%', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                <tbody>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0', width: '40%' }}>Is Admin:</td><td>{selectedUser.isAdmin ? '✅ YES' : '❌ NO'}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>Is Banned:</td><td>{selectedUser.isBanned ? '🚫 YES' : '✅ NO'}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Profile Customization */}
                        {(selectedUser as any).profileCustomization && (
                            <div style={{ background: '#fff', border: '2px solid #000', padding: '1rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>PROFILE CUSTOMIZATION</h3>
                                <table style={{ width: '100%', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                    <tbody>
                                        <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0', width: '40%' }}>Banner:</td><td style={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>{(selectedUser as any).profileCustomization.banner || 'N/A'}</td></tr>
                                        <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>Bio:</td><td>{(selectedUser as any).profileCustomization.bio || 'N/A'}</td></tr>
                                        <tr><td style={{ fontWeight: 'bold', padding: '0.25rem 0' }}>Colors:</td><td>{JSON.stringify((selectedUser as any).profileCustomization.colors || {})}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Raw JSON (Collapsed) */}
                        <details style={{ background: '#f5f5f5', border: '2px solid #000', padding: '1rem' }}>
                            <summary style={{ fontFamily: 'var(--font-heading)', fontWeight: 'bold', cursor: 'pointer' }}>📄 VIEW RAW JSON</summary>
                            <pre style={{ marginTop: '1rem', fontSize: '0.75rem', overflow: 'auto', background: '#fff', padding: '1rem', border: '1px solid #ccc' }}>
                                {JSON.stringify(selectedUser, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </Modal>
        </div>
    );
}
