import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Trophy, Users, Search, UserPlus, Check, User, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
    getLeaderboard,
    getFriends,
    getUserProfile,
    searchUserByEmail,
    searchUserByName,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    type Friend,
    type UserProfile
} from '@/firebase/firestore';


export default function Social() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'ranking' | 'friends'>('ranking');
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);



    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        // Always load friends to check status even in ranking
        if (user) {
            const friendsData = await getFriends(user.uid);
            setFriends(friendsData);
        }

        if (activeTab === 'ranking') {
            const data = await getLeaderboard(20);
            setLeaderboard(data);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!searchEmail) return;
        setLoading(true);
        setSearchResult(null);
        setRequestSent(false);

        // Try exact email match first
        let result = await searchUserByEmail(searchEmail);

        // If not found, try by display name
        if (!result) {
            result = await searchUserByName(searchEmail);
        }

        setSearchResult(result);
        setLoading(false);
    };

    const handleQuickAdd = async (targetUser: UserProfile) => {
        if (!user) return;
        try {
            await sendFriendRequest(
                user.uid,
                { displayName: user.displayName || 'Héros', photoURL: user.photoURL || '' },
                targetUser
            );
            // Refresh to update UI
            loadData();
            alert(`Demande envoyée à ${targetUser.displayName} !`);
        } catch (error) {
            console.error("Failed to add friend", error);
        }
    };

    const getFriendStatus = (uid: string) => {
        const friend = friends.find(f => f.uid === uid);
        if (!friend) return 'none';
        return friend.status; // 'pending' or 'accepted'
    };

    // ... inside return ...
    // Update Ranking View to include buttons


    const handleSendRequest = async () => {
        if (!user || !searchResult) return;
        try {
            await sendFriendRequest(
                user.uid,
                { displayName: user.displayName || 'Héros', photoURL: user.photoURL || '' },
                searchResult
            );
            setRequestSent(true);
            loadData(); // Refresh list to maybe show pending outgoing
        } catch (error) {
            console.error("Failed to send request", error);
        }
    };

    const handleAccept = async (friendUid: string) => {
        if (!user) return;
        try {
            await acceptFriendRequest(user.uid, friendUid);
            loadData(); // Refresh to show accepted status
        } catch (error) {
            console.error("Failed to accept", error);
        }
    };

    const handleReject = async (friendUid: string) => {
        if (!user) return;
        try {
            await rejectFriendRequest(user.uid, friendUid);
            loadData(); // Refresh to remove from list
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                    SOCIAL
                </h1>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <Button
                        variant={activeTab === 'ranking' ? 'primary' : 'ghost'}
                        onClick={() => setActiveTab('ranking')}
                        icon={<Trophy size={20} />}
                    >
                        CLASSEMENT
                    </Button>
                    <Button
                        variant={activeTab === 'friends' ? 'primary' : 'ghost'}
                        onClick={() => setActiveTab('friends')}
                        icon={<Users size={20} />}
                    >
                        AMIS
                    </Button>
                </div>

                {/* RANKING VIEW */}
                {activeTab === 'ranking' && (
                    <div className="manga-panel" style={{ padding: '0' }}>
                        {leaderboard.map((player, index) => (
                            <div key={player.uid} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                borderBottom: '1px solid #eee',
                                background: player.uid === user?.uid ? '#f0f0f0' : '#fff'
                            }}>
                                <div style={{ width: '40px', fontSize: '1.5rem', fontWeight: 900, color: index < 3 ? '#ffce00' : '#000' }}>
                                    #{index + 1}
                                </div>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', marginRight: '1rem', border: '2px solid #000' }}>
                                    <img src={player.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.displayName}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, marginRight: '0.5rem' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.displayName || 'Anonyme'}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Lvl {player.level || 1}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                    <div style={{ fontWeight: 900, fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                                        {player.xp || 0} XP
                                    </div>
                                    {player.uid !== user?.uid && (
                                        <>
                                            {getFriendStatus(player.uid) === 'none' && (
                                                <Button size="sm" variant="ghost" onClick={() => handleQuickAdd(player)}>
                                                    <UserPlus size={18} />
                                                </Button>
                                            )}
                                            {getFriendStatus(player.uid) === 'pending' && (
                                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>En attente</span>
                                            )}
                                            {getFriendStatus(player.uid) === 'accepted' && (
                                                <User size={18} style={{ opacity: 0.3 }} />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FRIENDS VIEW */}
                {activeTab === 'friends' && (
                    <div>
                        {/* Add Friend Section */}
                        <div className="manga-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#fff' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem' }}>AJOUTER UN AMI</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', border: '2px solid #000', padding: '0.5rem' }}>
                                    <Search size={20} style={{ marginRight: '0.5rem', opacity: 0.5 }} />
                                    <input
                                        type="email"
                                        placeholder="Pseudo ou Email exact..."
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <Button onClick={handleSearch} disabled={loading}>CHERCHER</Button>
                            </div>

                            {/* Search Result */}
                            {searchResult && (
                                <div style={{ marginTop: '1rem', padding: '1rem', border: '2px dashed #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #000' }}>
                                            <img src={searchResult.photoURL} alt="Avatar" style={{ width: '100%', height: '100%' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{searchResult.displayName}</div>
                                        </div>
                                    </div>
                                    {requestSent ? (
                                        <Button variant="ghost" icon={<Check size={18} />}>DEMANDE ENVOYÉE</Button>
                                    ) : (
                                        <Button variant="manga" onClick={handleSendRequest} icon={<UserPlus size={18} />}>AJOUTER</Button>
                                    )}
                                </div>
                            )}
                            {searchResult === null && searchEmail && !loading && searchResult !== undefined && ( // Check if strictly null (not found) vs undefined (initial)
                                <div style={{ marginTop: '0.5rem', color: 'red', fontWeight: 600 }}>Aucun utilisateur trouvé avec cet email.</div>
                            )}
                        </div>

                        {/* Requests List */}
                        {friends.filter(f => f.status === 'pending' && f.direction === 'incoming').length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem' }}>DEMANDES REÇUES</h3>
                                <div className="manga-panel" style={{ padding: 0 }}>
                                    {friends.filter(f => f.status === 'pending' && f.direction === 'incoming').map(friend => (
                                        <div key={friend.uid} style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #000' }}>
                                                    <img src={friend.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ fontWeight: 700 }}>{friend.displayName}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleReject(friend.uid)}
                                                    style={{ color: '#ef4444' }}
                                                    title="Refuser"
                                                >
                                                    <X size={20} />
                                                </Button>
                                                <Button variant="primary" onClick={() => handleAccept(friend.uid)}>ACCEPTER</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Friends List */}
                        <div className="manga-panel" style={{ padding: 0 }}>
                            {friends.filter(f => f.status === 'accepted').length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                                    Vous n'avez pas encore d'amis. Lancez une recherche !
                                </div>
                            ) : (
                                friends.filter(f => f.status === 'accepted').map(friend => (
                                    <div key={friend.uid} style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #000' }}>
                                            <img src={friend.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, fontWeight: 700 }}>{friend.displayName}</div>
                                        <Button variant="ghost" size="icon"><User size={20} /></Button>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                )}
            </div>
        </Layout>
    );
}
