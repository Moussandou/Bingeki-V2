import { useState, useEffect } from 'react';
import { Search, Ban, ShieldCheck, Mail, Calendar, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { getAllUsers, toggleUserBan, toggleUserAdmin, type UserProfile } from '@/firebase/firestore';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredUsers(users.filter(u =>
                (u.displayName?.toLowerCase().includes(lower) || '') ||
                (u.email?.toLowerCase().includes(lower) || '') ||
                (u.uid === lower)
            ));
        }
    }, [searchTerm, users]);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
        setLoading(false);
    };

    const handleToggleBan = async (uid: string, currentStatus: boolean) => {
        if (window.confirm(`Voulez-vous vraiment ${currentStatus ? 'débannir' : 'bannir'} cet utilisateur ?`)) {
            try {
                await toggleUserBan(uid, !currentStatus);
                // Optimistic update
                setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: !currentStatus } : u));
            } catch (error) {
                alert("Erreur lors de la mise à jour du statut.");
            }
        }
    };

    const handleToggleAdmin = async (uid: string, currentStatus: boolean) => {
        if (window.confirm(`ATTENTION: Vous êtes sur le point de ${currentStatus ? 'retirer' : 'donner'} les droits ADMIN à cet utilisateur. Continuer ?`)) {
            try {
                await toggleUserAdmin(uid, !currentStatus);
                // Optimistic update
                setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isAdmin: !currentStatus } : u));
            } catch (error) {
                alert("Erreur lors de la mise à jour des droits.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-4xl uppercase">Gestion Utilisateurs</h1>
                    <p className="text-gray-500 font-mono text-sm border-l-2 border-black pl-2">
                        {users.length} membres enregistrés
                    </p>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Chercher (Nom, Email, ID)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 border-4 border-black font-mono text-sm w-full md:w-[350px] focus:outline-none focus:shadow-[4px_4px_0_var(--color-primary)] transition-shadow"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black" size={18} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <p className="font-heading text-2xl animate-pulse">Chargement des dossiers...</p>
                ) : filteredUsers.length === 0 ? (
                    <Card className="p-8 text-center border-2 border-dashed border-gray-400">
                        <p className="text-gray-500">Aucun utilisateur trouvé.</p>
                    </Card>
                ) : (
                    filteredUsers.map(user => (
                        <Card key={user.uid} variant="manga" className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white transition-colors">
                            {/* User Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                    <img
                                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                                        alt={user.displayName || 'User'}
                                        className={`w-16 h-16 object-cover border-2 border-black ${user.isBanned ? 'grayscale opacity-50' : ''}`}
                                    />
                                    {user.isAdmin && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-400 border-2 border-black p-1 rounded-full text-black" title="Administrateur">
                                            <ShieldCheck size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-heading text-xl uppercase ${user.isBanned ? 'line-through text-red-500' : ''}`}>
                                            {user.displayName || 'Sans Nom'}
                                        </h3>
                                        <Link to={`/profile/${user.uid}`} target="_blank" className="text-gray-400 hover:text-black transition-colors">
                                            <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm text-gray-500 font-mono">
                                        <span className="flex items-center gap-2"><Mail size={12} /> {user.email}</span>
                                        <span className="flex items-center gap-2"><Calendar size={12} /> {new Date(user.lastLogin).toLocaleDateString()}</span>
                                        <span className="text-xs text-gray-400">ID: {user.uid}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 md:border-l-2 md:border-gray-200 md:pl-4 font-mono text-sm leading-tight">
                                <div>
                                    <div className="text-gray-400 text-xs uppercase">Niveau</div>
                                    <div className="font-bold text-lg">{user.level || 1}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs uppercase">XP</div>
                                    <div className="font-bold text-lg">{user.xp || 0}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col md:items-end gap-3 md:border-l-2 md:border-black md:pl-6 min-w-[200px]">
                                <div className="flex items-center justify-between w-full gap-4">
                                    <span className="font-heading uppercase text-sm text-gray-600 flex items-center gap-1" title="Donne accès au dashboard admin">
                                        <ShieldCheck size={16} /> Admin
                                    </span>
                                    <Switch
                                        isOn={!!user.isAdmin}
                                        onToggle={() => handleToggleAdmin(user.uid, !!user.isAdmin)}
                                    />
                                </div>
                                <div className="flex items-center justify-between w-full gap-4">
                                    <span className="font-heading uppercase text-sm text-red-600 flex items-center gap-1" title="Bloque l'accès au compte">
                                        <Ban size={16} /> Bannir
                                    </span>
                                    <Switch
                                        isOn={!!user.isBanned}
                                        onToggle={() => handleToggleBan(user.uid, !!user.isBanned)}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
