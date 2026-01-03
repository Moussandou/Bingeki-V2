import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useLibraryStore } from '@/store/libraryStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal'; // Import Modal
import { ArrowLeft, Star, BookOpen, Check, Trash2, Tv, FileText, Trophy, AlertTriangle, MessageCircle, Heart, Send, EyeOff, Reply, Video, Calendar, BarChart, Music, Disc } from 'lucide-react';
import { useState, useEffect } from 'react';
import { statusToFrench } from '@/utils/statusTranslation';
import { useGamificationStore } from '@/store/gamificationStore';
import { useToast } from '@/context/ToastContext';
import { ContentList, type ContentItem } from '@/components/ContentList';
import { getAnimeEpisodes, getAnimeEpisodeDetails } from '@/services/animeApi';
import { getCommentsWithReplies, addComment, toggleCommentLike, getFriendsReadingWork, type UserProfile } from '@/firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { CommentWithReplies } from '@/types/comment';
import logoCrunchyroll from '@/assets/logo_crunchyroll.png';
import logoADN from '@/assets/logo_adn.png';

import { getWorkDetails, getWorkCharacters, getWorkRelations, getWorkRecommendations, getWorkPictures, getWorkThemes, type JikanCharacter, type JikanRelation, type JikanRecommendation, type JikanPicture, type JikanTheme } from '@/services/animeApi';
import { handleProgressUpdateWithXP } from '@/utils/progressUtils';
import styles from './WorkDetails.module.css';

// Helper Component for Recursive Comments
function RecursiveComment({
    comment,
    user,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    handleReply,
    handleLike,
    revealedSpoilers,
    setRevealedSpoilers
}: any) {
    const isRevealed = revealedSpoilers.includes(comment.id);
    const timeDiff = Date.now() - comment.timestamp;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const timeAgo = hours < 1 ? 'À l\'instant' : hours < 24 ? `Il y a ${hours}h` : `Il y a ${Math.floor(hours / 24)}j`;
    const isReplying = replyingTo === comment.id;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            width: '100%'
        }}>
            {/* Comment Card */}
            <div style={{
                padding: '1rem',
                background: '#fff',
                border: '2px solid #000', // Brutalist border
                boxShadow: '4px 4px 0 rgba(0,0,0,0.1)', // Subtle shadow
                transition: 'transform 0.2s',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid #000' }}>
                        <img src={comment.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
                            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>{comment.userName}</p>
                        <p style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 600 }}>{timeAgo}</p>
                    </div>
                </div>

                {/* Content */}
                {comment.spoiler && !isRevealed ? (
                    <div
                        onClick={() => setRevealedSpoilers((prev: any) => [...prev, comment.id])}
                        style={{
                            padding: '0.75rem',
                            background: '#000',
                            color: '#fff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <EyeOff size={14} /> SPOILER
                    </div>
                ) : (
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>{comment.text}</p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                    <button
                        onClick={() => handleLike(comment.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: user && comment.likes.includes(user.uid) ? '#ef4444' : '#000',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                        }}
                    >
                        <Heart size={16} fill={user && comment.likes.includes(user.uid) ? '#ef4444' : 'none'} />
                        {comment.likes.length}
                    </button>
                    {user && (
                        <button
                            onClick={() => {
                                if (isReplying) {
                                    setReplyingTo(null);
                                    setReplyText('');
                                } else {
                                    setReplyingTo(comment.id);
                                    setReplyText(''); // Clear text when opening new reply
                                }
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: isReplying ? '#3b82f6' : '#000',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                opacity: isReplying ? 1 : 0.6
                            }}
                        >
                            <Reply size={16} />
                            RÉPONDRE
                        </button>
                    )}
                </div>

                {/* Reply Form (Localized) */}
                {isReplying && (
                    <div style={{ marginTop: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e: any) => setReplyText(e.target.value)}
                                placeholder={`Répondre à ${comment.userName}...`}
                                autoFocus
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '2px solid #000',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    background: '#f9f9f9'
                                }}
                                onKeyDown={(e: any) => e.key === 'Enter' && handleReply(comment.id)}
                            />
                            <button
                                onClick={() => handleReply(comment.id)}
                                style={{
                                    background: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0 1.25rem',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Nested Replies (Staircase) */}
            {comment.replies && comment.replies.length > 0 && (
                <div style={{
                    marginLeft: '2rem', // Staircase indent
                    paddingLeft: '1rem',
                    borderLeft: '2px solid #e5e5e5', // Guide line
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {comment.replies.map((reply: any) => (
                        <RecursiveComment
                            key={reply.id}
                            comment={reply}
                            user={user}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            handleReply={handleReply}
                            handleLike={handleLike}
                            revealedSpoilers={revealedSpoilers}
                            setRevealedSpoilers={setRevealedSpoilers}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function WorkDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast(); // Initialize hook
    const { getWork, addWork, updateStatus, updateWorkDetails, removeWork } = useLibraryStore(); // Add removeWork
    const { } = useGamificationStore(); // Removed unused destructuring
    const { user } = useAuthStore();
    const { spoilerMode } = useSettingsStore();

    // Query Params for Public/Guest Access
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type') as 'anime' | 'manga' | null;
    const [fetchedWork, setFetchedWork] = useState<any | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    const libraryWork = getWork(Number(id));

    // Merge library work with fetched details to get the best of both worlds (user progress + rich API data)
    const work = libraryWork ? {
        ...libraryWork,
        ...(fetchedWork ? {
            trailer: fetchedWork.trailer,
            studios: fetchedWork.studios,
            genres: fetchedWork.genres,
            season: fetchedWork.season,
            year: fetchedWork.year,
            rank: fetchedWork.rank,
            popularity: fetchedWork.popularity,
            duration: fetchedWork.duration,
            ratingString: fetchedWork.ratingString,
            source: fetchedWork.source
        } : {})
    } : fetchedWork;

    const [isEditing, setIsEditing] = useState(false);
    const [progress, setProgress] = useState(libraryWork?.currentChapter || 0); // Use libraryWork for initial progress
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
    const [isNotesExpanded, setIsNotesExpanded] = useState(false);
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

    // Tab & Episodes State
    const [activeTab, setActiveTab] = useState<'info' | 'episodes' | 'gallery' | 'themes'>('info');
    const [episodes, setEpisodes] = useState<ContentItem[]>([]);
    const [episodesPage, setEpisodesPage] = useState(1);
    const [hasMoreEpisodes, setHasMoreEpisodes] = useState(false);
    const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

    // Comments State
    const [comments, setComments] = useState<CommentWithReplies[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [revealedSpoilers, setRevealedSpoilers] = useState<string[]>([]);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    // Friends reading this
    const [friendsReading, setFriendsReading] = useState<{ count: number; friends: UserProfile[] }>({ count: 0, friends: [] });

    // New Data: Characters & Relations
    const [characters, setCharacters] = useState<JikanCharacter[]>([]);
    const [relations, setRelations] = useState<JikanRelation[]>([]);
    const [recommendations, setRecommendations] = useState<JikanRecommendation[]>([]);
    const [pictures, setPictures] = useState<JikanPicture[]>([]);
    const [themes, setThemes] = useState<JikanTheme | null>(null);


    // Initial Fetch for non-library items
    useEffect(() => {
        // Fetch details if we don't have them in state (fetchedWork), even if we have the library work (which might be stale/minimal)
        if (id && !fetchedWork && !isFetchingDetails) {
            setIsFetchingDetails(true);
            let typeToFetch: 'anime' | 'manga' = 'anime';
            if (typeParam) {
                const normalized = typeParam.toLowerCase();
                if (['manga', 'novel', 'manhwa', 'manhua', 'doujinshi', 'oneshot', 'oel'].includes(normalized)) {
                    typeToFetch = 'manga';
                }
            }
            // Fallback: If unknown, try anime first (or maybe we should try both? For now default to anime)

            getWorkDetails(Number(id), typeToFetch).then(res => {
                // Map JikanResult to compatible format for UI (partial)
                const mapped = {
                    id: res.mal_id,
                    title: res.title,
                    type: res.type ? res.type.toLowerCase() : typeToFetch,
                    image: res.images.jpg.large_image_url,
                    synopsis: res.synopsis,
                    totalChapters: res.chapters || res.episodes || 0,
                    status: res.status ? res.status.toLowerCase().replace(/ /g, '_') : 'unknown',
                    score: res.score,
                    currentChapter: 0,
                    rating: 0,
                    notes: '',
                    isPublic: true,
                    // New Fields
                    trailer: res.trailer,
                    studios: res.studios || [],
                    genres: res.genres || [],
                    season: res.season,
                    year: res.year,
                    rank: res.rank,
                    popularity: res.popularity,
                    duration: res.duration,
                    ratingString: res.rating,
                    source: res.source
                };
                setFetchedWork(mapped);
                setIsFetchingDetails(false);
            }).catch(err => {
                console.error("Failed to fetch work details", err);
                setIsFetchingDetails(false);
            });
        }
    }, [id, libraryWork, fetchedWork, typeParam]);

    // Fetch Characters, Relations, Recommendations, Pictures
    useEffect(() => {
        if (id && work) {
            const type = work.type === 'manga' ? 'manga' : 'anime';
            getWorkCharacters(Number(id), type).then(setCharacters);
            getWorkRelations(Number(id), type).then(setRelations);
            getWorkRecommendations(Number(id), type).then(setRecommendations);
            getWorkPictures(Number(id), type).then(setPictures);
            if (type === 'anime') {
                getWorkThemes(Number(id)).then(setThemes);
            }
        }
    }, [id, work?.type]);



    // Normalize displayWork for UI usage (deprecated activeWork, just use work)
    // const activeWork = displayWork; 
    // const isInLibrary = !!work; <- This is wrong now, isInLibrary = !!libraryWork

    const handleSave = () => {
        if (!libraryWork) return; // Guard for guests
        // Use centralized utility for progress & XP logic
        const success = handleProgressUpdateWithXP(libraryWork.id, progress, work.totalChapters);
        if (success) {
            addToast('Progression sauvegardée !', 'success');
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

            if (work?.type === 'anime' || work?.type === 'tv' || work?.type === 'movie' || work?.type === 'ova' || work?.type === 'special' || work?.type === 'ona') {
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
            } else {
                // Generate chapters locally with simulated pagination (100 per page to be manageable)
                const itemsPerPage = 50; // Use 50 as default chunk size for chapters
                const total = work.totalChapters || 100; // Fallback if unknown
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
            }
        }
    }, [work?.id, work?.type, work?.totalChapters, activeTab, episodesPage]);

    // Load comments and friends reading when work changes
    useEffect(() => {
        if (work?.id) {
            // Load comments
            setIsLoadingComments(true);
            getCommentsWithReplies(Number(work.id)).then(data => {
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

    if (!work) {
        if (isFetchingDetails) {
            return (
                <Layout>
                    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>CHARGEMENT...</h1>
                    </div>
                </Layout>
            );
        }
        return (
            <Layout>
                <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>ŒUVRE INTROUVABLE</h1>
                    <p>Impossible de récupérer les détails. Vérifiez votre connexion ou l'ID.</p>
                    <Button onClick={() => navigate('/discover')} style={{ marginTop: '1rem' }}>Retour</Button>
                </div>
            </Layout>
        );
    }

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !user || !work) {
            console.log('[Comments] Submit blocked - missing data:', { hasComment: !!newComment.trim(), hasUser: !!user, hasWork: !!work });
            return;
        }

        try {
            const commentData = {
                userId: user.uid,
                userName: user.displayName || 'Anonyme',
                userPhoto: user.photoURL || '',
                workId: Number(work.id),
                text: newComment,
                spoiler: isSpoiler
            };

            console.log('[Comments] Submitting comment:', commentData);
            const result = await addComment(commentData);
            console.log('[Comments] Add result:', result);

            if (result) {
                setNewComment('');
                setIsSpoiler(false);
                addToast('Commentaire ajouté !', 'success');

                // Reload comments
                const updated = await getCommentsWithReplies(Number(work.id));
                console.log('[Comments] Reloaded comments:', updated.length);
                setComments(updated);
            } else {
                addToast('Erreur lors de l\'ajout du commentaire', 'error');
            }
        } catch (error) {
            console.error('[Comments] Submit error:', error);
            addToast('Erreur lors de l\'ajout du commentaire', 'error');
        }
    };

    const handleLikeComment = async (commentId: string) => {
        if (!user) return;
        await toggleCommentLike(commentId, user.uid);
        // Reload comments to reflect like change
        if (work) {
            const updated = await getCommentsWithReplies(Number(work.id));
            setComments(updated);
        }
    };

    const handleReply = async (parentId: string) => {
        if (!replyText.trim() || !user || !work) return;

        try {
            const replyData = {
                userId: user.uid,
                userName: user.displayName || 'Anonyme',
                userPhoto: user.photoURL || '',
                workId: Number(work.id),
                text: replyText,
                spoiler: false,
                replyTo: parentId
            };

            const result = await addComment(replyData);
            if (result) {
                setReplyText('');
                setReplyingTo(null);
                addToast('Réponse ajoutée !', 'success');
                const updated = await getCommentsWithReplies(Number(work.id));
                setComments(updated);
            }
        } catch (error) {
            console.error('[Comments] Reply error:', error);
            addToast('Erreur lors de la réponse', 'error');
        }
    };

    const handleEpisodeSelect = (number: number) => {
        if (work && libraryWork) {
            const success = handleProgressUpdateWithXP(work.id, number, work.totalChapters);
            if (success) {
                setProgress(number);
                // addToast(`Progression mise à jour...`); // Removed to prevent spam on rapid clicks
            }
        }
    };

    const handleExpandEpisode = async (episodeNumber: number) => {
        if (work.type !== 'anime' && work.type !== 'tv' && work.type !== 'ova' && work.type !== 'movie') return;

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
            <div className={`container ${styles.container}`}>
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    icon={<ArrowLeft size={20} />}
                    className={styles.backButton}
                >
                    RETOUR
                </Button>

                <div className={`manga-panel ${styles.detailsPanel}`}>

                    {/* Cover Image */}
                    <div className={styles.coverSection}>
                        <div className={styles.coverImageWrapper}>
                            <img
                                src={work.image}
                                alt={work.title}
                                className={styles.coverImage}
                            />
                            <div className={styles.typeLabel}>
                                {work.type ? work.type.toUpperCase() : 'TYPE'}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className={styles.infoSection}>
                        <div className={styles.tabsContainer}>
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`${styles.tabButton} ${activeTab === 'info' ? styles.activeTab : ''}`}
                            >
                                GÉNÉRAL
                            </button>
                            {(work.type) && (
                                <button
                                    onClick={() => setActiveTab('episodes')}
                                    className={`${styles.tabButton} ${activeTab === 'episodes' ? styles.activeTab : ''}`}
                                >
                                    {['manga', 'novel', 'manhwa', 'manhua', 'doujinshi', 'oneshot', 'oel'].includes(work.type?.toLowerCase()) ? 'LISTE DES CHAPITRES' : 'LISTE DES ÉPISODES'}
                                </button>
                            )}
                            {!['manga', 'novel', 'manhwa', 'manhua', 'doujinshi', 'oneshot', 'oel'].includes(work.type?.toLowerCase() || '') && (
                                <button
                                    className={`${styles.tabButton} ${activeTab === 'themes' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab('themes')}
                                >
                                    MUSIQUES
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`${styles.tabButton} ${activeTab === 'gallery' ? styles.activeTab : ''}`}
                            >
                                GALERIE
                            </button>
                        </div>

                        {activeTab === 'episodes' && (
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
                                    workType={work.type === 'manga' ? 'manga' : 'anime'}
                                    readOnly={!libraryWork}
                                />
                            )
                        )}

                        {activeTab === 'info' && (
                            <>
                                <h1 className={styles.title}>
                                    {work.title}
                                </h1>

                                <div className={styles.metaContainer}>
                                    <div className={styles.metaItem}>
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
                                        className={styles.metaItem}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
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
                                        <h3 className={styles.synopsisTitle}>SYNOPSIS</h3>
                                        <div
                                            onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                                            style={{ cursor: 'pointer', position: 'relative' }}
                                        >
                                            <p className={`${spoilerMode ? 'spoiler-blur' : ''} ${styles.synopsisText}`} style={{
                                                maxHeight: isSynopsisExpanded ? 'none' : '100px',
                                                WebkitLineClamp: isSynopsisExpanded ? 'none' : 4,
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

                                {/* DETAILED INFO & TRAILER SECTION */}
                                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                    {/* Info Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                                        {work.season && (
                                            <div style={{
                                                background: '#fff',
                                                padding: '0.75rem',
                                                border: '2px solid #000',
                                                boxShadow: '4px 4px 0 rgba(0,0,0,1)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', opacity: 0.8, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                                    <Calendar size={14} strokeWidth={3} /> SAISON
                                                </div>
                                                <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{work.season} {work.year}</div>
                                            </div>
                                        )}
                                        {work.studios && work.studios.length > 0 && (
                                            <div style={{
                                                background: '#fff',
                                                padding: '0.75rem',
                                                border: '2px solid #000',
                                                boxShadow: '4px 4px 0 rgba(0,0,0,1)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', opacity: 0.8, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                                    <Video size={14} strokeWidth={3} /> STUDIO
                                                </div>
                                                <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{work.studios[0].name}</div>
                                            </div>
                                        )}
                                        {work.rank && (
                                            <div style={{
                                                background: '#fff',
                                                padding: '0.75rem',
                                                border: '2px solid #000',
                                                boxShadow: '4px 4px 0 rgba(0,0,0,1)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', opacity: 0.8, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                                    <Trophy size={14} strokeWidth={3} /> RANG
                                                </div>
                                                <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>#{work.rank}</div>
                                            </div>
                                        )}
                                        {work.popularity && (
                                            <div style={{
                                                background: '#fff',
                                                padding: '0.75rem',
                                                border: '2px solid #000',
                                                boxShadow: '4px 4px 0 rgba(0,0,0,1)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', opacity: 0.8, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                                    <BarChart size={14} strokeWidth={3} /> POPULARITÉ
                                                </div>
                                                <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>#{work.popularity}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Trailer */}
                                    {work.trailer && work.trailer.embed_url && (
                                        <div style={{ width: '100%', marginTop: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                <Video size={20} strokeWidth={2.5} />
                                                <h3 className={styles.synopsisTitle} style={{ marginBottom: 0 }}>BANDE-ANNONCE</h3>
                                            </div>
                                            <div style={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                paddingBottom: '56.25%',
                                                height: 0,
                                                background: '#000',
                                                border: '4px solid #000',
                                                boxShadow: '8px 8px 0 rgba(0,0,0,1)'
                                            }}>
                                                <iframe
                                                    src={`${work.trailer.embed_url}?autoplay=0`}
                                                    title="Trailer"
                                                    frameBorder="0"
                                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* CASTING SECTION */}
                                    {characters.length > 0 && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <h3 className={styles.synopsisTitle} style={{ marginBottom: '1rem' }}>CASTING</h3>
                                            <div className="scrollbar-hide" style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                overflowX: 'auto',
                                                paddingBottom: '1rem',
                                                scrollSnapType: 'x mandatory'
                                            }}>
                                                {characters.filter(c => c.character.images?.jpg?.image_url).map((c) => (
                                                    <div key={c.character.mal_id} style={{
                                                        flex: '0 0 100px',
                                                        scrollSnapAlign: 'start',
                                                        position: 'relative'
                                                    }}>
                                                        <div style={{
                                                            width: '100px',
                                                            height: '100px',
                                                            borderRadius: '50%',
                                                            border: '3px solid #000',
                                                            overflow: 'hidden',
                                                            marginBottom: '0.5rem',
                                                            background: '#f0f0f0'
                                                        }}>
                                                            <img
                                                                src={c.character.images.jpg.image_url}
                                                                alt={c.character.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
                                                            {c.character.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'center', fontWeight: 600, marginTop: '2px' }}>
                                                            {c.role}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* RELATIONS SECTION */}
                                    {relations.length > 0 && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <h3 className={styles.synopsisTitle} style={{ marginBottom: '1rem' }}>UNIVERS ÉTENDU</h3>
                                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                {relations.map((rel, idx) => (
                                                    <div key={idx} style={{
                                                        background: '#fff',
                                                        border: '2px solid #000',
                                                        padding: '1rem',
                                                        boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
                                                    }}>
                                                        <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.5 }}>
                                                            {rel.relation}
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                            {rel.entry.map(e => (
                                                                <a
                                                                    key={e.mal_id}
                                                                    href={`/work/${e.mal_id}?type=${e.type}`}
                                                                    style={{
                                                                        textDecoration: 'none',
                                                                        color: '#000',
                                                                        fontWeight: 700,
                                                                        fontSize: '0.95rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.5rem'
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                                >
                                                                    • {e.name}
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        background: '#000',
                                                                        color: '#fff',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px'
                                                                    }}>
                                                                        {e.type.toUpperCase()}
                                                                    </span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* THEMES SECTION (Openings/Endings) */}

                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    {!libraryWork ? (
                                        <div style={{ padding: '2rem', background: '#f9f9f9', textAlign: 'center', border: '2px dashed #000' }}>
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>INTÉRESSÉ ?</h3>
                                            <p style={{ marginBottom: '1.5rem' }}>Ajoutez cette œuvre à votre bibliothèque pour suivre votre progression !</p>
                                            <Button
                                                onClick={() => {
                                                    if (user) {
                                                        addWork(fetchedWork);
                                                        addToast('Ajouté à votre bibliothèque !', 'success');
                                                    } else {
                                                        navigate('/auth');
                                                    }
                                                }}
                                                variant="primary"
                                                size="lg"
                                                icon={<BookOpen size={20} />}
                                            >
                                                {user ? 'AJOUTER À MA COLLECTION' : 'SE CONNECTER POUR AJOUTER'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>PROGRESSION</h3>
                                            <div style={{ color: '#000' }}>
                                                {isEditing ? (
                                                    <div className={styles.progressContainer}>
                                                        <input
                                                            type="number"
                                                            value={progress}
                                                            onChange={(e) => setProgress(Number(e.target.value))}
                                                            className={styles.progressInput}
                                                        />
                                                        <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>/ {work.totalChapters || '?'}</span>
                                                        <Button onClick={handleSave} variant="primary" icon={<Check size={20} />}>OK</Button>
                                                    </div>
                                                ) : (
                                                    <div className={styles.progressControls}>
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
                                                        <span className={styles.progressDisplay}>
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
                                        </>
                                    )}
                                </div>

                                {libraryWork && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>STATUT</h3>
                                        <div className={styles.statusButtons}>
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
                                )
                                }

                                {/* Rating Section */}
                                {libraryWork && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>MA NOTE</h3>
                                        <div className={styles.ratingContainer}>
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
                                )}


                                {/* Notes Section */}
                                {libraryWork && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3
                                            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                                            style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '1.5rem',
                                                marginBottom: '1rem',
                                                color: '#000',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                userSelect: 'none'
                                            }}
                                        >
                                            MES NOTES {isNotesExpanded ? '▼' : '►'}
                                        </h3>
                                        {isNotesExpanded && (
                                            <textarea
                                                value={work.notes || ''}
                                                onChange={(e) => updateWorkDetails(work.id, { notes: e.target.value })}
                                                placeholder="Écrivez vos pensées ici..."
                                                className={styles.notesArea}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Comments Section */}
                                <div style={{
                                    marginBottom: '2rem',
                                    border: '2px solid #000',
                                    padding: '1.5rem',
                                    boxShadow: '8px 8px 0 #000',
                                    background: '#fff'
                                }}>
                                    <h3
                                        onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '1.5rem',
                                            marginBottom: isCommentsExpanded ? '1.5rem' : 0,
                                            color: '#000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageCircle size={24} /> COMMENTAIRES ({comments.length})
                                        </div>
                                        <span>{isCommentsExpanded ? '▼' : '►'}</span>
                                    </h3>

                                    {isCommentsExpanded && (
                                        <div>

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
                                                <div style={{
                                                    marginBottom: '2rem',
                                                    background: '#fff',
                                                    padding: '1.5rem',
                                                    border: '3px solid #000',
                                                    boxShadow: '6px 6px 0 #000', // Brutalist shadow
                                                    position: 'relative'
                                                }}>
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Partagez votre avis..."
                                                        style={{
                                                            width: '100%',
                                                            minHeight: '100px',
                                                            border: '2px solid #000',
                                                            padding: '1rem',
                                                            fontFamily: 'inherit',
                                                            fontSize: '1rem',
                                                            fontWeight: 500,
                                                            resize: 'vertical',
                                                            marginBottom: '1rem',
                                                            outline: 'none',
                                                            background: '#f9f9f9',
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSpoiler}
                                                                onChange={(e) => setIsSpoiler(e.target.checked)}
                                                                style={{ accentColor: '#000', width: 16, height: 16 }}
                                                            />
                                                            <EyeOff size={16} /> Contient des spoilers
                                                        </label>
                                                        <Button
                                                            onClick={handleSubmitComment}
                                                            variant="primary"
                                                            size="md"
                                                            icon={<Send size={18} />}
                                                            style={{
                                                                border: '2px solid #000',
                                                                boxShadow: '4px 4px 0 #000',
                                                                fontWeight: 900
                                                            }}
                                                        >
                                                            PUBLIER
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
                                                    {comments.map(comment => (
                                                        <RecursiveComment
                                                            key={comment.id}
                                                            comment={comment}
                                                            user={user}
                                                            replyingTo={replyingTo}
                                                            setReplyingTo={setReplyingTo}
                                                            replyText={replyText}
                                                            setReplyText={setReplyText}
                                                            handleReply={handleReply}
                                                            handleLike={handleLikeComment}
                                                            revealedSpoilers={revealedSpoilers}
                                                            setRevealedSpoilers={setRevealedSpoilers}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Danger Zone */}
                                {libraryWork && (
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
                                )}
                            </>
                        )}

                        {activeTab === 'gallery' && (
                            <div className="animate-fade-in">
                                <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>GALERIE OFFICIELLE</h2>
                                {pictures.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                        gap: '0.5rem'
                                    }}>
                                        {pictures.map((pic, idx) => (
                                            <div key={idx} style={{
                                                border: '2px solid #000',
                                                boxShadow: '4px 4px 0 #000',
                                                aspectRatio: '1/1.4',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                background: '#fff',
                                                transition: 'transform 0.1s'
                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
                                                onClick={() => window.open(pic.jpg.large_image_url, '_blank')}
                                            >
                                                <img
                                                    src={pic.jpg.large_image_url}
                                                    alt={`Gallery ${idx}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6, fontStyle: 'italic' }}>
                                        Aucune image disponible.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'themes' && themes && (
                            <div className="animate-fade-in">
                                <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>BANDES ORIGINALES</h2>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '2rem'
                                }}>
                                    {/* Openings */}
                                    <div style={{
                                        background: '#fff',
                                        border: '2px solid #000',
                                        boxShadow: '4px 4px 0 #000',
                                        padding: '1.5rem'
                                    }}>
                                        <h3 style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '1.25rem',
                                            marginBottom: '1rem',
                                            borderBottom: '4px solid #000',
                                            paddingBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Music size={24} /> OPENINGS ({themes.openings.length})
                                        </h3>
                                        <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="scrollbar-hide">
                                            {themes.openings.length > 0 ? (
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {themes.openings.map((theme, idx) => (
                                                        <li key={idx} style={{ marginBottom: '0.75rem', borderBottom: '1px dashed #ccc', paddingBottom: '0.75rem' }}>
                                                            <a
                                                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(theme + ' ' + work.title)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    textDecoration: 'none',
                                                                    color: '#000',
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    gap: '0.75rem'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.color = '#555'}
                                                                onMouseLeave={(e) => e.currentTarget.style.color = '#000'}
                                                            >
                                                                <span style={{
                                                                    background: '#000',
                                                                    color: '#fff',
                                                                    fontFamily: 'var(--font-heading)',
                                                                    padding: '2px 6px',
                                                                    fontSize: '0.8rem',
                                                                    height: 'fit-content'
                                                                }}>#{idx + 1}</span>
                                                                <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{theme} ↗</span>
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Aucun opening trouvé.</p>}
                                        </div>
                                    </div>

                                    {/* Endings */}
                                    <div style={{
                                        background: '#fff',
                                        border: '2px solid #000',
                                        boxShadow: '4px 4px 0 #000',
                                        padding: '1.5rem'
                                    }}>
                                        <h3 style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '1.25rem',
                                            marginBottom: '1rem',
                                            borderBottom: '4px solid #000',
                                            paddingBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Disc size={24} /> ENDINGS ({themes.endings.length})
                                        </h3>
                                        <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="scrollbar-hide">
                                            {themes.endings.length > 0 ? (
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {themes.endings.map((theme, idx) => (
                                                        <li key={idx} style={{ marginBottom: '0.75rem', borderBottom: '1px dashed #ccc', paddingBottom: '0.75rem' }}>
                                                            <a
                                                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(theme + ' ' + work.title)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    textDecoration: 'none',
                                                                    color: '#000',
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    gap: '0.75rem'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.color = '#555'}
                                                                onMouseLeave={(e) => e.currentTarget.style.color = '#000'}
                                                            >
                                                                <span style={{
                                                                    background: '#000',
                                                                    color: '#fff',
                                                                    fontFamily: 'var(--font-heading)',
                                                                    padding: '2px 6px',
                                                                    fontSize: '0.8rem',
                                                                    height: 'fit-content'
                                                                }}>#{idx + 1}</span>
                                                                <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{theme} ↗</span>
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Aucun ending trouvé.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RECOMMENDATIONS SECTION (Outside infoSection for full width or bottom) */}
                {recommendations.length > 0 && (
                    <div className="manga-panel" style={{ marginTop: '3rem', padding: '2rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '2rem',
                            marginBottom: '1.5rem',
                            textTransform: 'uppercase',
                            textAlign: 'center'
                        }}>
                            VOUS AIMEREZ AUSSI
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {recommendations.map((rec) => (
                                <a
                                    key={rec.entry.mal_id}
                                    href={`/work/${rec.entry.mal_id}?type=${work.type}`}
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                >
                                    <div style={{
                                        position: 'relative',
                                        marginBottom: '0.75rem',
                                        border: '3px solid #000',
                                        boxShadow: '6px 6px 0 #000',
                                        transition: 'transform 0.2s',
                                        background: '#000'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-4px, -4px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
                                    >
                                        <img
                                            src={rec.entry.images.jpg.large_image_url}
                                            alt={rec.entry.title}
                                            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: '#000',
                                            color: '#fff',
                                            padding: '4px 8px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            textAlign: 'center'
                                        }}>
                                            {rec.votes} VOTES
                                        </div>
                                    </div>
                                    <h4 style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 800,
                                        lineHeight: 1.3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        textTransform: 'uppercase'
                                    }}>
                                        {rec.entry.title}
                                    </h4>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

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
        </Layout >
    );
}


