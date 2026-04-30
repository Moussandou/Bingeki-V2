import { memo, useState, useMemo } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useTranslation } from 'react-i18next';
import { Heart, Reply, EyeOff, Send } from 'lucide-react';
import type { CommentWithReplies } from '@/types/comment';
import styles from '@/pages/WorkDetails.module.css';

interface RecursiveCommentProps {
    comment: CommentWithReplies;
    user: { uid: string; displayName: string | null; photoURL: string | null } | null;
    replyingTo: string | null;
    setReplyingTo: (id: string | null) => void;
    replyText: string;
    setReplyText: (text: string) => void;
    handleReply: (id: string) => void;
    handleLike: (id: string) => void;
    revealedSpoilers: string[];
    setRevealedSpoilers: React.Dispatch<React.SetStateAction<string[]>>;
}

export const RecursiveComment = memo(function RecursiveComment({
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
}: RecursiveCommentProps) {
    const isRevealed = revealedSpoilers.includes(comment.id);
     
    const { t } = useTranslation();

    const [now] = useState(() => Date.now());
    const timeAgo = useMemo(() => {
        const timeDiff = now - comment.timestamp;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        return hours < 1 
            ? t('work_details.comments.time_now') 
            : hours < 24 
                ? t('work_details.comments.time_hours', { hours }) 
                : t('work_details.comments.time_days', { days: Math.floor(hours / 24) });
    }, [comment.timestamp, t, now]);
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
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border-heavy)',
                boxShadow: '4px 4px 0 var(--color-shadow)',
                transition: 'transform 0.2s',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-border-heavy)' }}>
                        <OptimizedImage src={comment.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`} alt="" />
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>{comment.userName}</p>
                        <p style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 600 }}>{timeAgo}</p>
                    </div>
                </div>

                {/* Content */}
                {comment.spoiler && !isRevealed ? (
                    <div
                        onClick={() => setRevealedSpoilers((prev) => [...prev, comment.id])}
                        style={{
                            padding: '0.75rem',
                            background: 'var(--color-border-heavy)',
                            color: 'var(--color-text-inverse)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <EyeOff size={14} /> {t('work_details.comments.spoiler')}
                    </div>
                ) : (
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>{comment.text}</p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                    <button
                        onClick={() => handleLike(comment.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: user && comment.likes.includes(user.uid) ? '#ef4444' : 'var(--color-text)',
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
                                color: isReplying ? '#3b82f6' : 'var(--color-text)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                opacity: isReplying ? 1 : 0.6
                            }}
                        >
                            <Reply size={16} />
                            {t('work_details.comments.reply')}
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
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={t('work_details.comments.reply_to', { name: comment.userName })}
                                autoFocus
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '2px solid var(--color-border-heavy)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    background: 'var(--color-surface-hover)',
                                    color: 'var(--color-text)'
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleReply(comment.id)}
                            />
                            <button
                                onClick={() => handleReply(comment.id)}
                                style={{
                                    background: 'var(--color-border-heavy)',
                                    color: 'var(--color-text-inverse)',
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
                <div className={styles.commentReplyContainer}>
                    {comment.replies.map((reply) => (
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
});
