import { useEffect, useState } from 'react';
import { Users, MessageSquare, Activity, ArrowUpRight, ShieldAlert, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getAdminStats, getAllUsers, type UserProfile } from '@/firebase/firestore';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFeedback: 0,
        newUsersToday: 0,
        pendingFeedback: 0
    });
    const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, usersData] = await Promise.all([
                    getAdminStats(),
                    getAllUsers()
                ]);
                setStats(statsData);
                setRecentUsers(usersData.slice(0, 5)); // Top 5 recent
            } catch (error) {
                console.error("Failed to fetch admin dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ label, value, subtext, icon: Icon, colorClass }: any) => (
        <Card variant="manga" className="p-6 flex flex-col justify-between h-48 relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
                <h3 className="font-heading text-xl uppercase text-gray-600">{label}</h3>
                <div className={`p-3 border-2 border-black flex items-center justify-center bg-white ${colorClass}`}>
                    <Icon size={24} className="text-black" strokeWidth={2.5} />
                </div>
            </div>

            <div className="z-10 mt-auto">
                <span className="font-heading text-6xl font-black leading-none block">
                    {loading ? '...' : value}
                </span>
                {subtext && (
                    <span className="text-sm font-bold text-gray-500 mt-2 block flex items-center gap-1">
                        <ArrowUpRight size={16} /> {subtext}
                    </span>
                )}
            </div>

            {/* Background Pattern */}
            <div className="absolute -bottom-6 -right-6 opacity-5 transform group-hover:scale-110 transition-transform duration-500">
                <Icon size={120} />
            </div>
        </Card>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="font-heading text-5xl uppercase mb-2">Centre de Contrôle</h1>
                <p className="text-lg border-l-4 border-primary pl-4 py-1 italic text-gray-600 bg-white/50 backdrop-blur-sm inline-block">
                    "Si tu ne te bats pas, tu ne peux pas gagner." - Système Admin
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Utilisateurs"
                    value={stats.totalUsers}
                    subtext={`+${stats.newUsersToday} aujourd'hui`}
                    icon={Users}
                    colorClass="bg-secondary" // Cyan
                />
                <StatCard
                    label="Retours"
                    value={stats.totalFeedback}
                    subtext={`${stats.pendingFeedback} en attente`}
                    icon={MessageSquare}
                    colorClass="bg-primary" // Pink/Red
                />
                <StatCard
                    label="Santé Système"
                    value="100%"
                    subtext="Tous les systèmes opérationnels"
                    icon={Activity}
                    colorClass="bg-green-400"
                />
                <Card variant="manga" className="p-6 flex flex-col justify-center items-center h-48 bg-black text-white border-white">
                    <ShieldAlert size={48} className="mb-4 text-primary animate-pulse" />
                    <h3 className="font-heading text-2xl uppercase text-center mb-2">Mode Admin</h3>
                    <p className="text-center text-sm text-gray-400">Accès sécurisé actif</p>
                </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Users */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-2xl uppercase border-b-4 border-black inline-block pr-8">
                            Membres Récents
                        </h2>
                        <Link to="/admin/users" className="font-heading uppercase text-sm hover:text-primary underline decoration-2 underline-offset-4">
                            Voir tout
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <p>Chargement des données...</p>
                        ) : recentUsers.map(user => (
                            <Card key={user.uid} variant="default" className="p-4 border-2 border-black shadow-none hover:translate-x-1 transition-transform flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                                        alt={user.displayName || 'User'}
                                        className="w-12 h-12 rounded-none border-2 border-black object-cover bg-gray-200"
                                    />
                                    <div>
                                        <h4 className="font-heading text-lg leading-none">{user.displayName || 'Anonyme'}</h4>
                                        <p className="text-xs text-gray-500 font-mono mt-1">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.isAdmin && <span className="px-2 py-0.5 bg-black text-white text-xs font-bold uppercase">Admin</span>}
                                    {user.isBanned && <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold uppercase">Banni</span>}
                                    <span className="text-xs font-bold text-gray-400">
                                        {new Date(user.lastLogin).toLocaleDateString()}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* System Terminal / Quick Actions */}
                <div className="space-y-6">
                    <h2 className="font-heading text-2xl uppercase border-b-4 border-black inline-block pr-8">
                        Actions Rapides
                    </h2>

                    <Card variant="manga" className="p-0 bg-black text-green-400 font-mono text-sm h-full max-h-[400px] overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-gray-800 bg-gray-900 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="ml-2 text-xs text-gray-500">system_log.sh</span>
                        </div>
                        <div className="p-4 space-y-2 overflow-y-auto flex-1">
                            <p><span className="text-blue-400">[INFO]</span> Admin session started</p>
                            <p><span className="text-blue-400">[INFO]</span> Data sync: <span className="text-green-400">OK</span></p>
                            <p><span className="text-yellow-400">[WARN]</span> 3 failed login attempts (IP: 192.168.x.x)</p>
                            <p><span className="text-blue-400">[INFO]</span> New user registration: {recentUsers[0]?.displayName || 'Ghost'}</p>
                            <p className="animate-pulse">_</p>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-3">
                        <button className="flex items-center justify-center gap-2 w-full p-4 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors font-heading uppercase text-sm font-bold">
                            <Zap size={16} /> Purger le Cache
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
