import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useLibraryStore } from '@/store/libraryStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal'; // Import Modal
import { ArrowLeft, Star, BookOpen, Check, Trash2, Tv, FileText, Trophy, AlertTriangle, MessageCircle, Heart, Send, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { statusToFrench } from '@/utils/statusTranslation';
import { useGamificationStore, XP_REWARDS } from '@/store/gamificationStore';
import { useToast } from '@/context/ToastContext';
import { ContentList, type ContentItem } from '@/components/ContentList';
import { getAnimeEpisodes, getAnimeEpisodeDetails } from '@/services/animeApi';
import { getComments, addComment, toggleCommentLike, getFriendsReadingWork, type UserProfile } from '@/firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import type { Comment } from '@/types/comment';
import logoCrunchyroll from '@/assets/logo_crunchyroll.png';
import logoADN from '@/assets/logo_adn.png';

export default function WorkDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast(); // Initialize hook
    const { getWork, updateProgress, updateStatus, updateWorkDetails, removeWork } = useLibraryStore(); // Add removeWork
    const { addXp, recordActivity, incrementStat } = useGamificationStore();
    const { user } = useAuthStore();
    const work = getWork(Number(id));
    const [isEditing, setIsEditing] = useState(false);
    const [progress, setProgress] = useState(work?.currentChapter || 0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

    // Tab & Episodes State
    const [activeTab, setActiveTab] = useState<'info' | 'episodes'>('info');
    const [episodes, setEpisodes] = useState<ContentItem[]>([]);
    const [episodesPage, setEpisodesPage] = useState(1);
    const [hasMoreEpisodes, setHasMoreEpisodes] = useState(false);
    const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

    // Comments State
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [revealedSpoilers, setRevealedSpoilers] = useState<string[]>([]);

    // Friends reading this
    const [friendsReading, setFriendsReading] = useState<{ count: number; friends: UserProfile[] }>({ count: 0, friends: [] });

    if (!work) {
        return (
            <Layout>
                <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>ŒUVRE INTROUVABLE</h1>
                    <Button onClick={() => navigate('/library')} style={{ marginTop: '1rem' }}>Retour à la base</Button>
                </div>
            </Layout>
        );
    }

    const handleSave = () => {
        const oldProgress = work?.currentChapter || 0;
        updateProgress(work.id, progress);

        // Award XP if progress increased
        if (progress > oldProgress) {
            const chaptersRead = progress - oldProgress;
            for (let i = 0; i < chaptersRead; i++) {
                incrementStat('chapters');
            }
            addXp(XP_REWARDS.UPDATE_PROGRESS * chaptersRead);
            recordActivity();

            // Bonus XP if work is completed
            if (work.totalChapters && progress >= work.totalChapters) {
                addXp(XP_REWARDS.COMPLETE_WORK);
                updateStatus(work.id, 'completed');
                incrementStat('completed');
            }
        }

        setIsEditing(false);
    };

    const handleDelete = () => {
        removeWork(work.id);
        addToast(`"${work.title}" a été supprimé`, 'error');
        navigate('/library');
    };

    // Fetch episodes or generate chapters when tab updates
    useEffect(() => {
        if (activeTab === 'episodes') {
            setIsLoadingEpisodes(true);

            if (work?.type === 'anime') {
                getAnimeEpisodes(Number(work.id), episodesPage).then(res => {
                    const mapped = res.data.map((ep: any) => ({
                        id: ep.mal_id,
                        title: ep.title,
                        number: ep.mal_id,
                        date: ep.aired,
                        isFiller: ep.filler,
                        synopsis: null // Initialize with null
                    }));
                    setEpisodes(mapped);
                    setHasMoreEpisodes(res.pagination.has_next_page);
                    setIsLoadingEpisodes(false);
                });
            } else if (work?.type === 'manga' && work.totalChapters) {
                // Generate chapters locally with simulated pagination (100 per page to be manageable)
                const itemsPerPage = 50; // Use 50 as default chunk size for chapters
                const total = work.totalChapters;
                const start = (episodesPage - 1) * itemsPerPage + 1;
                const end = Math.min(start + itemsPerPage - 1, total);

                const generated: ContentItem[] = [];
                for (let i = start; i <= end; i++) {
                    generated.push({
                        id: i,
                        title: `Chapitre ${i}`,
                        number: i,
                        date: null,
                        isFiller: false
                    });
                }

                // Simulate network delay for feeling
                setTimeout(() => {
                    setEpisodes(generated);
                    setHasMoreEpisodes(end < total);
                    setIsLoadingEpisodes(false);
                }, 300);
            } else {
                setEpisodes([]);
                setIsLoadingEpisodes(false);
            }
        }
    }, [work?.id, work?.type, work?.totalChapters, activeTab, episodesPage]);

    // Load comments and friends reading when work changes
    useEffect(() => {
        if (work?.id) {
            // Load comments
            setIsLoadingComments(true);
            getComments(Number(work.id)).then(data => {
                setComments(data);
                setIsLoadingComments(false);
            });

            // Load friends reading this work
            if (user) {
                getFriendsReadingWork(user.uid, Number(work.id)).then(data => {
                    setFriendsReading(data);
                });
            }
        }
    }, [work?.id, user?.uid]);

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !user || !work) return;

        const commentData = {
            userId: user.uid,
            userName: user.displayName || 'Anonyme',
            userPhoto: user.photoURL || '',
            workId: Number(work.id),
            text: newComment,
            spoiler: isSpoiler
        };

        await addComment(commentData);
        setNewComment('');
        setIsSpoiler(false);
        addToast('Commentaire ajouté !', 'success');

        // Reload comments
        const updated = await getComments(Number(work.id));
        setComments(updated);
    };

    const handleLikeComment = async (commentId: string) => {
        if (!user) return;
        await toggleCommentLike(commentId, user.uid);
        // Reload comments to reflect like change
        if (work) {
            const updated = await getComments(Number(work.id));
            setComments(updated);
        }
    };

    const handleEpisodeSelect = (number: number) => {
        if (work) {
            updateProgress(work.id, number);
            setProgress(number);

            const oldProgress = work.currentChapter || 0;
            if (number > oldProgress) {
                const diff = number - oldProgress;
                addXp(XP_REWARDS.UPDATE_PROGRESS * diff);
                incrementStat('chapters');
                recordActivity();
            }
            addToast(`Progression mise à jour: Épisode ${number}`, 'success');
        }
    };

    const handleExpandEpisode = async (episodeNumber: number) => {
        if (work.type !== 'anime') return;

        console.log(`Fetching details for anime ${work.id} episode ${episodeNumber}`);
        try {
            const details = await getAnimeEpisodeDetails(Number(work.id), episodeNumber);
            console.log("Details received:", details);
            if (details) {
                setEpisodes(prev => prev.map(ep =>
                    ep.number === episodeNumber ? { ...ep, synopsis: details.synopsis } : ep
                ));
            } else {
                console.warn("No details returned from API");
            }
        } catch (error) {
            console.error("Failed to fetch episode details", error);
        }
    };

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
                <Button
                    onClick={() => navigate('/library')}
                    variant="ghost"
                    icon={<ArrowLeft size={20} />}
                    style={{ marginBottom: '2rem', paddingLeft: 0 }}
                >
                    RETOUR
                </Button>

                <div className="manga-panel" style={{ background: '#fff', color: '#000', padding: '2rem', display: 'flex', gap: '2rem', flexDirection: 'row', alignItems: 'flex-start' }}>

                    {/* Cover Image */}
                    <div style={{ width: '250px', flexShrink: 0 }}>
                        <div style={{ border: '4px solid #000', boxShadow: '8px 8px 0 #000', position: 'relative' }}>
                            <img
                                src={work.image}
                                alt={work.title}
                                style={{ width: '100%', display: 'block' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '-10px',
                                background: '#000',
                                color: '#fff',
                                padding: '0.25rem 1rem',
                                transform: 'rotate(-5deg)',
                                fontWeight: 900,
                                fontSize: '1.2rem',
                                border: '2px solid #fff'
                            }}>
                                {work.type.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #EEE' }}>
                            <button
                                onClick={() => setActiveTab('info')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    background: activeTab === 'info' ? '#000' : 'transparent',
                                    color: activeTab === 'info' ? '#fff' : '#000',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === 'info' ? '4px solid #000' : 'none',
                                    marginBottom: '-2px'
                                }}
                            >
                                GÉNÉRAL
                            </button>
                            {(work.type === 'anime' || work.type === 'manga') && (
                                <button
                                    onClick={() => setActiveTab('episodes')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontWeight: 900,
                                        fontSize: '1rem',
                                        background: activeTab === 'episodes' ? '#000' : 'transparent',
                                        color: activeTab === 'episodes' ? '#fff' : '#000',
                                        border: 'none',
                                        cursor: 'pointer',
                                        borderBottom: activeTab === 'episodes' ? '4px solid #000' : 'none',
                                        marginBottom: '-2px'
                                    }}
                                >
                                    {work.type === 'manga' ? 'LISTE DES CHAPITRES' : 'LISTE DES ÉPISODES'}
                                </button>
                            )}
                        </div>

                        {activeTab === 'episodes' ? (
                            work.type === 'manga' && (!work.totalChapters || work.totalChapters === 0) ? (
                                <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed #000' }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>NOMBRE DE CHAPITRES INCONNU</h3>
                                    <p style={{ marginBottom: '1rem' }}>Veuillez définir le nombre total de chapitres dans l'onglet "Général" pour générer la liste.</p>
                                    <Button
                                        onClick={() => {
                                            const newTotal = prompt("Entrez le nombre total de chapitres :", "0");
                                            if (newTotal && !isNaN(Number(newTotal))) {
                                                updateWorkDetails(work.id, { totalChapters: Number(newTotal) });
                                            }
                                        }}
                                        variant="manga"
                                    >
                                        Définir le nombre de chapitres
                                    </Button>
                                </div>
                            ) : (
                                <ContentList
                                    items={episodes}
                                    currentProgress={work.currentChapter || 0}
                                    onSelect={handleEpisodeSelect}
                                    onExpand={handleExpandEpisode}
                                    isLoading={isLoadingEpisodes}
                                    page={episodesPage}
                                    hasNextPage={hasMoreEpisodes}
                                    hasPrevPage={episodesPage > 1}
                                    onNextPage={() => setEpisodesPage(p => p + 1)}
                                    onPrevPage={() => setEpisodesPage(p => p - 1)}
                                    workTitle={work.title}
                                    workType={work.type}
                                />
                            )
                        ) : (
                            <>
                                <h1 style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '3rem',
                                    lineHeight: 1,
                                    marginBottom: '1rem',
                                    textTransform: 'uppercase',
                                    textShadow: '3px 3px 0 rgba(0,0,0,0.1)',
                                    color: '#000'
                                }}>
                                    {work.title}
                                </h1>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', color: '#000', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: '2px solid #000', padding: '0.5rem 1rem' }}>
                                        <Trophy size={20} />
                                        <span>Score: {work.score || '?'}</span>
                                    </div>
                                    <div
                                        onClick={() => {
                                            const newTotal = prompt("Entrez le nombre total:", work.totalChapters?.toString() || "");
                                            if (newTotal && !isNaN(Number(newTotal))) {
                                                updateWorkDetails(Number(work.id), { totalChapters: Number(newTotal) });
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: 600,
                                            border: '2px solid #000',
                                            padding: '0.5rem 1rem',
                                            cursor: 'pointer',
                                            background: '#fff',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                        title="Cliquez pour modifier le total"
                                    >
                                        <BookOpen size={20} />
                                        <span>{work.totalChapters || '?'} Chaps</span>
                                    </div>

                                    {/* Minimalist Streaming Buttons */}
                                    {work.type === 'anime' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {/* Crunchyroll */}
                                            <button
                                                onClick={() => {
                                                    const nextEp = (work.currentChapter || 0) + 1;
                                                    handleEpisodeSelect(nextEp);
                                                    window.open(`https://www.google.com/search?q=site:crunchyroll.com/fr/watch ${encodeURIComponent(work.title)} episode ${nextEp}`, '_blank');
                                                }}
                                                style={{ border: '2px solid #ea580c', padding: '0.5rem', background: '#fff', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                                                title={`Crunchyroll - Épisode ${(work.currentChapter || 0) + 1}`}
                                            >
                                                <img src={logoCrunchyroll} alt="CR" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                            </button>

                                            {/* ADN */}
                                            <button
                                                onClick={() => {
                                                    const nextEp = (work.currentChapter || 0) + 1;
                                                    handleEpisodeSelect(nextEp);
                                                    window.open(`https://www.google.com/search?q=site:animationdigitalnetwork.fr ${encodeURIComponent(work.title)} episode ${nextEp}`, '_blank');
                                                }}
                                                style={{ border: '2px solid #0099ff', padding: '0.5rem', background: '#fff', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                                                title={`ADN - Épisode ${(work.currentChapter || 0) + 1}`}
                                            >
                                                <img src={logoADN} alt="ADN" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                            </button>

                                            {/* Generic Streaming */}
                                            <button
                                                onClick={() => {
                                                    const nextEp = (work.currentChapter || 0) + 1;
                                                    handleEpisodeSelect(nextEp);
                                                    window.open(`https://www.google.com/search?q=${encodeURIComponent(work.title)} episode ${nextEp} streaming vostfr`, '_blank');
                                                }}
                                                style={{ border: '2px solid #000', padding: '0.5rem', background: '#fff', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                                                title={`Streaming - Épisode ${(work.currentChapter || 0) + 1}`}
                                            >
                                                <Tv size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                const nextChap = (work.currentChapter || 0) + 1;
                                                handleEpisodeSelect(nextChap);
                                                window.open(`https://www.google.com/search?q=${encodeURIComponent(work.title)} chapitre ${nextChap} scan fr`, '_blank');
                                            }}
                                            style={{ border: '2px solid #22c55e', color: '#22c55e', padding: '0.5rem 1rem', background: '#fff', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                                            title={`Lire - Chapitre ${(work.currentChapter || 0) + 1}`}
                                        >
                                            <FileText size={20} />
                                            <span>LIRE</span>
                                        </button>
                                    )}
                                </div>

                                {work.synopsis && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem', color: '#000' }}>SYNOPSIS</h3>
                                        <div
                                            onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                                            style={{ cursor: 'pointer', position: 'relative' }}
                                        >
                                            <p style={{
                                                fontSize: '1rem',
                                                lineHeight: '1.6',
                                                opacity: 0.8,
                                                color: '#000',
                                                maxHeight: isSynopsisExpanded ? 'none' : '100px',
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: isSynopsisExpanded ? 'none' : 4,
                                                WebkitBoxOrient: 'vertical',
                                                transition: 'max-height 0.3s ease'
                                            }}>
                                                {work.synopsis}
                                            </p>
                                            {!isSynopsisExpanded && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '40px',
                                                    background: 'linear-gradient(transparent, #fff)',
                                                    pointerEvents: 'none'
                                                }} />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontWeight: 900,
                                                fontSize: '0.9rem',
                                                marginTop: '0.5rem',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                padding: 0
                                            }}
                                        >
                                            {isSynopsisExpanded ? 'Moins' : 'Lire la suite'}
                                        </button>
                                    </div>
                                )}

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>PROGRESSION</h3>
                                    <div style={{ color: '#000' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="number"
                                                    value={progress}
                                                    onChange={(e) => setProgress(Number(e.target.value))}
                                                    style={{
                                                        fontSize: '2rem',
                                                        fontWeight: 900,
                                                        width: '100px',
                                                        border: '2px solid #000',
                                                        padding: '0.5rem',
                                                        textAlign: 'center',
                                                        color: '#000',
                                                        background: '#fff'
                                                    }}
                                                />
                                                <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>/ {work.totalChapters || '?'}</span>
                                                <Button onClick={handleSave} variant="primary" icon={<Check size={20} />}>OK</Button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {/* Decrement buttons */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEpisodeSelect(Math.max(0, (work.currentChapter || 0) - 5))}
                                                    style={{ fontWeight: 700, border: '1px solid #ccc' }}
                                                >-5</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEpisodeSelect(Math.max(0, (work.currentChapter || 0) - 3))}
                                                    style={{ fontWeight: 700, border: '1px solid #ccc' }}
                                                >-3</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEpisodeSelect(Math.max(0, (work.currentChapter || 0) - 1))}
                                                    style={{ fontWeight: 700, border: '1px solid #ccc' }}
                                                >-1</Button>

                                                {/* Progress display */}
                                                <span style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, margin: '0 0.5rem' }}>
                                                    {work.currentChapter} <span style={{ fontSize: '1.25rem', opacity: 0.5 }}>/ {work.totalChapters || '?'}</span>
                                                </span>

                                                {/* Increment buttons */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEpisodeSelect((work.currentChapter || 0) + 1)}
                                                    style={{ fontWeight: 700, border: '1px solid #ccc' }}
                                                >+1</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEpisodeSelect((work.currentChapter || 0) + 3)}
                                                    style={{ fontWeight: 700, border: '1px solid #ccc' }}
                                                >+3</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEpisodeSelect((work.currentChapter || 0) + 5)}
                                                    style={{ fontWeight: 700, border: '1px solid #ccc' }}
                                                >+5</Button>
                                                <Button onClick={() => setIsEditing(true)} variant="manga" size="sm">Éditer</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>STATUT</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {['reading', 'completed', 'plan_to_read', 'dropped'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => updateStatus(work.id, s as any)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    border: '2px solid #000',
                                                    background: work.status === s ? '#000' : '#fff',
                                                    color: work.status === s ? '#fff' : '#000',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    cursor: 'pointer',
                                                    transform: work.status === s ? 'translateY(-2px)' : 'none',
                                                    boxShadow: work.status === s ? '4px 4px 0 rgba(0,0,0,0.2)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {statusToFrench(s)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating Section */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>MA NOTE</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => updateWorkDetails(work.id, { rating: star })}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    transition: 'transform 0.1s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <Star
                                                    size={32}
                                                    fill={(work.rating || 0) >= star ? '#000' : 'none'}
                                                    color="#000"
                                                    strokeWidth={2}
                                                />
                                            </button>
                                        ))}
                                        <span style={{ marginLeft: '1rem', fontSize: '1.5rem', fontWeight: 900 }}>{work.rating ? `${work.rating}/10` : '-/10'}</span>
                                    </div>
                                </div>


                                {/* Notes Section */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>MES NOTES</h3>
                                    <textarea
                                        value={work.notes || ''}
                                        onChange={(e) => updateWorkDetails(work.id, { notes: e.target.value })}
                                        placeholder="Écrivez vos pensées ici..."
                                        style={{
                                            width: '100%',
                                            minHeight: '150px',
                                            border: '2px solid #000',
                                            padding: '1rem',
                                            fontFamily: 'inherit',
                                            fontSize: '1rem',
                                            resize: 'vertical',
                                            background: '#f9f9f9',
                                            marginBottom: '2rem'
                                        }}
                                    />
                                </div>

                                {/* Comments Section */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MessageCircle size={24} /> COMMENTAIRES ({comments.length})
                                    </h3>

                                    {/* Friends reading indicator */}
                                    {friendsReading.count > 0 && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            marginBottom: '1rem',
                                            border: '1px solid #c7d2fe'
                                        }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                👥 <strong>{friendsReading.count} ami{friendsReading.count > 1 ? 's' : ''}</strong> {work.type === 'anime' ? 'regarde' : 'lit'} aussi cette œuvre
                                            </p>
                                            <div style={{ display: 'flex', gap: '-8px', marginTop: '0.5rem' }}>
                                                {friendsReading.friends.slice(0, 5).map(f => (
                                                    <div key={f.uid} style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        border: '2px solid #fff',
                                                        marginLeft: '-8px'
                                                    }}>
                                                        <img src={f.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.displayName}`}
                                                            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* New comment form */}
                                    {user ? (
                                        <div style={{ marginBottom: '1.5rem', background: '#f9f9f9', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Partagez votre avis..."
                                                style={{
                                                    width: '100%',
                                                    minHeight: '80px',
                                                    border: '1px solid #ccc',
                                                    padding: '0.75rem',
                                                    fontFamily: 'inherit',
                                                    fontSize: '0.95rem',
                                                    resize: 'vertical',
                                                    borderRadius: '4px',
                                                    marginBottom: '0.75rem'
                                                }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSpoiler}
                                                        onChange={(e) => setIsSpoiler(e.target.checked)}
                                                    />
                                                    <EyeOff size={16} /> Contient des spoilers
                                                </label>
                                                <Button onClick={handleSubmitComment} variant="manga" size="sm" icon={<Send size={16} />}>
                                                    Publier
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ opacity: 0.6, fontStyle: 'italic', marginBottom: '1rem' }}>Connectez-vous pour commenter</p>
                                    )}

                                    {/* Comments list */}
                                    {isLoadingComments ? (
                                        <p style={{ textAlign: 'center', opacity: 0.6 }}>Chargement des commentaires...</p>
                                    ) : comments.length === 0 ? (
                                        <p style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>Aucun commentaire. Soyez le premier !</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {comments.map(comment => {
                                                const isRevealed = revealedSpoilers.includes(comment.id);
                                                const timeDiff = Date.now() - comment.timestamp;
                                                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                                                const timeAgo = hours < 1 ? 'À l\'instant' : hours < 24 ? `Il y a ${hours}h` : `Il y a ${Math.floor(hours / 24)}j`;

                                                return (
                                                    <div key={comment.id} style={{
                                                        padding: '1rem',
                                                        background: '#fff',
                                                        border: '1px solid #eee',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid #000' }}>
                                                                <img src={comment.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
                                                                    alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                            <div>
                                                                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{comment.userName}</p>
                                                                <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>{timeAgo}</p>
                                                            </div>
                                                        </div>

                                                        {comment.spoiler && !isRevealed ? (
                                                            <div
                                                                onClick={() => setRevealedSpoilers(prev => [...prev, comment.id])}
                                                                style={{
                                                                    padding: '1rem',
                                                                    background: '#000',
                                                                    color: '#fff',
                                                                    cursor: 'pointer',
                                                                    borderRadius: '4px',
                                                                    textAlign: 'center',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                <EyeOff size={16} style={{ marginRight: '0.5rem' }} />
                                                                ⚠️ Spoiler - Cliquez pour révéler
                                                            </div>
                                                        ) : (
                                                            <p style={{ lineHeight: 1.5, fontSize: '0.95rem' }}>{comment.text}</p>
                                                        )}

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                            <button
                                                                onClick={() => handleLikeComment(comment.id)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    color: user && comment.likes.includes(user.uid) ? '#ef4444' : '#666'
                                                                }}
                                                            >
                                                                <Heart size={16} fill={user && comment.likes.includes(user.uid) ? '#ef4444' : 'none'} />
                                                                <span style={{ fontSize: '0.85rem' }}>{comment.likes.length}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Danger Zone */}
                                <div style={{ borderTop: '2px dashed #000', paddingTop: '2rem' }}>
                                    <Button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        style={{
                                            background: '#ff0000',
                                            color: '#fff',
                                            width: '100%',
                                            fontWeight: 900,
                                            textTransform: 'uppercase'
                                        }}
                                        icon={<Trash2 size={20} />}
                                    >
                                        Supprimer de la bibliothèque
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="SUPPRESSION">
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '50%', color: '#dc2626' }}>
                                <AlertTriangle size={32} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#000' }}>
                            Supprimer "{work.title}" ?
                        </h3>
                        <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                            Cette action est irréversible. Votre progression et vos notes seront perdues.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                                ANNULER
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDelete}
                                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                            >
                                SUPPRIMER
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
}
