import { useState } from 'react';
import { Search, Ban, Eye } from 'lucide-react';

const UserRow = ({ user }: { user: any }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr 1fr 150px',
        borderBottom: '2px solid #000',
        padding: '1rem',
        alignItems: 'center',
        background: '#fff',
        fontFamily: 'monospace',
        fontSize: '0.9rem'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
                width: '32px', height: '32px', background: '#000', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
                {user.displayName?.charAt(0) || '?'}
            </div>
            <span style={{ fontWeight: 700 }}>{user.displayName || 'Anonyme'}</span>
        </div>
        <div>{user.email}</div>
        <div>Niveau {user.level || 1}</div>
        <div>{new Date(user.lastLogin || Date.now()).toLocaleDateString()}</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button title="Voir profil" style={{ padding: '0.25rem', border: '2px solid #000', background: 'transparent', cursor: 'pointer' }}>
                <Eye size={16} />
            </button>
            <button title="Bannir" style={{ padding: '0.25rem', border: '2px solid #000', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                <Ban size={16} />
            </button>
        </div>
    </div>
);

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for now
    const users = Array(10).fill(null).map((_, i) => ({
        id: `user-${i}`,
        displayName: `Hunter ${i + 1}`,
        email: `hunter${i + 1}@example.com`,
        level: Math.floor(Math.random() * 50) + 1,
        lastLogin: Date.now() - Math.random() * 1000000000
    }));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2.5rem',
                    textTransform: 'uppercase',
                    margin: 0
                }}>
                    Utilisateurs
                </h1>

                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            border: '3px solid #000',
                            fontFamily: 'monospace',
                            fontSize: '1rem',
                            width: '300px',
                            background: '#fff',
                            outline: 'none'
                        }}
                    />
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
            </div>

            <div style={{
                border: '4px solid #000',
                background: '#fff',
                boxShadow: '8px 8px 0 #000'
            }}>
                {/* Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr 1fr 150px',
                    padding: '1rem',
                    background: '#000',
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1px'
                }}>
                    <div>Utilisateur</div>
                    <div>Email</div>
                    <div>Niveau</div>
                    <div>Dernière activité</div>
                    <div>Actions</div>
                </div>

                {/* List */}
                <div>
                    {users.map(user => (
                        <UserRow key={user.id} user={user} />
                    ))}
                </div>
            </div>
        </div>
    );
}
