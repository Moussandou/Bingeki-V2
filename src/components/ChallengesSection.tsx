import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Trophy, Swords, Target, Flame, Plus, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
    getUserChallenges,
    createChallenge,
    getFriends,
    type Friend,
} from '@/firebase/firestore';
import type { Challenge, ChallengeParticipant } from '@/types/challenge';
import { CHALLENGE_LABELS } from '@/types/challenge';
import { useToast } from '@/context/ToastContext';

interface ChallengesSectionProps {
    onNavigateToProfile?: (uid: string) => void;
}

export function ChallengesSection({ onNavigateToProfile }: ChallengesSectionProps) {
    const { user } = useAuthStore();
    const { addToast } = useToast();

    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state
    const [newChallenge, setNewChallenge] = useState({
        title: '',
        type: 'race_to_finish' as Challenge['type'],
        workTitle: '',
        selectedFriends: [] as string[]
    });

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setIsLoading(true);

        const [challengeData, friendData] = await Promise.all([
            getUserChallenges(user.uid),
            getFriends(user.uid)
        ]);

        setChallenges(challengeData);
        setFriends(friendData.filter(f => f.status === 'accepted'));
        setIsLoading(false);
    };

    const handleCreateChallenge = async () => {
        if (!user || !newChallenge.title || newChallenge.selectedFriends.length === 0) {
            addToast('Remplissez tous les champs et sélectionnez des amis', 'error');
            return;
        }

        const participants: ChallengeParticipant[] = [
            {
                id: user.uid,
                name: user.displayName || 'Moi',
                photo: user.photoURL || '',
                progress: 0,
                joinedAt: Date.now()
            },
            ...newChallenge.selectedFriends.map(friendUid => {
                const friend = friends.find(f => f.uid === friendUid);
                return {
                    id: friendUid,
                    name: friend?.displayName || 'Ami',
                    photo: friend?.photoURL || '',
                    progress: 0,
                    joinedAt: Date.now()
                };
            })
        ];

        const challenge: Omit<Challenge, 'id'> = {
            title: newChallenge.title,
            type: newChallenge.type,
            workTitle: newChallenge.workTitle || undefined,
            participants,
            startDate: Date.now(),
            status: 'active',
            createdBy: user.uid
        };

        await createChallenge(challenge);
        addToast('Défi créé !', 'success');
        setIsCreateModalOpen(false);
        setNewChallenge({ title: '', type: 'race_to_finish', workTitle: '', selectedFriends: [] });
        loadData();
    };

    const toggleFriendSelect = (uid: string) => {
        setNewChallenge(prev => ({
            ...prev,
            selectedFriends: prev.selectedFriends.includes(uid)
                ? prev.selectedFriends.filter(id => id !== uid)
                : [...prev.selectedFriends, uid]
        }));
    };

    const getStatusColor = (status: Challenge['status']) => {
        switch (status) {
            case 'active': return '#22c55e';
            case 'pending': return '#eab308';
            case 'completed': return '#6b7280';
        }
    };

    const getChallengeIcon = (type: Challenge['type']) => {
        switch (type) {
            case 'race_to_finish': return <Target size={20} />;
            case 'most_chapters': return <Swords size={20} />;
            case 'streak_battle': return <Flame size={20} />;
        }
    };

    if (!user) {
        return (
            <div className="manga-panel" style={{ padding: '2rem', textAlign: 'center', background: '#fff' }}>
                <p style={{ opacity: 0.6 }}>Connectez-vous pour voir vos défis</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={24} /> MES DÉFIS
                </h2>
                <Button onClick={() => setIsCreateModalOpen(true)} variant="manga" size="sm" icon={<Plus size={16} />}>
                    NOUVEAU DÉFI
                </Button>
            </div>

            {isLoading ? (
                <p style={{ textAlign: 'center', opacity: 0.6 }}>Chargement...</p>
            ) : challenges.length === 0 ? (
                <div className="manga-panel" style={{ padding: '2rem', textAlign: 'center', background: '#fff' }}>
                    <Trophy size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 600 }}>Aucun défi en cours</p>
                    <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>Créez un défi et affrontez vos amis !</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="manga-panel" style={{ padding: '1.25rem', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        {getChallengeIcon(challenge.type)}
                                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{challenge.title}</h3>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{CHALLENGE_LABELS[challenge.type]}</p>
                                    {challenge.workTitle && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                                            📖 {challenge.workTitle}
                                        </p>
                                    )}
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: getStatusColor(challenge.status),
                                    color: '#fff',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    {challenge.status === 'active' ? 'En cours' : challenge.status === 'pending' ? 'En attente' : 'Terminé'}
                                </span>
                            </div>

                            {/* Participants */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {challenge.participants
                                    .sort((a, b) => b.progress - a.progress)
                                    .map((p, index) => (
                                        <div
                                            key={p.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                cursor: onNavigateToProfile ? 'pointer' : 'default'
                                            }}
                                            onClick={() => onNavigateToProfile?.(p.id)}
                                        >
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem', width: '24px', color: index === 0 ? '#ffd700' : '#666' }}>
                                                #{index + 1}
                                            </span>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid #000' }}>
                                                <img
                                                    src={p.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {p.name} {p.id === user.uid && <span style={{ opacity: 0.5 }}>(Vous)</span>}
                                                </p>
                                            </div>
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                                                {p.progress} {challenge.type === 'streak_battle' ? 'jours' : 'ch.'}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Challenge Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="NOUVEAU DÉFI">
                <div style={{ padding: '1rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Nom du défi</label>
                        <input
                            type="text"
                            value={newChallenge.title}
                            onChange={e => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Ex: Qui finira One Piece en premier ?"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #000',
                                fontSize: '1rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Type de défi</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {(['race_to_finish', 'most_chapters', 'streak_battle'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setNewChallenge(prev => ({ ...prev, type }))}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '2px solid #000',
                                        background: newChallenge.type === type ? '#000' : '#fff',
                                        color: newChallenge.type === type ? '#fff' : '#000',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {getChallengeIcon(type)} {CHALLENGE_LABELS[type]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Œuvre (optionnel)</label>
                        <input
                            type="text"
                            value={newChallenge.workTitle}
                            onChange={e => setNewChallenge(prev => ({ ...prev, workTitle: e.target.value }))}
                            placeholder="Ex: One Piece, Naruto..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #000',
                                fontSize: '1rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                            <Users size={16} style={{ marginRight: '0.5rem' }} />
                            Inviter des amis ({newChallenge.selectedFriends.length} sélectionnés)
                        </label>
                        {friends.length === 0 ? (
                            <p style={{ opacity: 0.6, fontStyle: 'italic' }}>Vous n'avez pas encore d'amis</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                {friends.map(friend => (
                                    <div
                                        key={friend.uid}
                                        onClick={() => toggleFriendSelect(friend.uid)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            border: newChallenge.selectedFriends.includes(friend.uid) ? '2px solid #000' : '1px solid #eee',
                                            background: newChallenge.selectedFriends.includes(friend.uid) ? '#f0f0f0' : '#fff',
                                            cursor: 'pointer',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid #000' }}>
                                            <img
                                                src={friend.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.displayName}`}
                                                alt=""
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{friend.displayName}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                        <Button variant="manga" onClick={handleCreateChallenge}>Créer le défi</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
