import { useState, useEffect, useCallback } from 'react';
import { getCommentsWithReplies, addComment, toggleCommentLike } from '@/firebase/firestore';
import type { CommentWithReplies } from '@/types/comment';

export interface UseWorkCommentsResult {
    comments: CommentWithReplies[];
    isLoading: boolean;
    error: string | null;
    newComment: string;
    setNewComment: (text: string) => void;
    isSpoiler: boolean;
    setIsSpoiler: (spoiler: boolean) => void;
    replyingTo: string | null;
    setReplyingTo: (id: string | null) => void;
    replyText: string;
    setReplyText: (text: string) => void;
    revealedSpoilers: string[];
    setRevealedSpoilers: React.Dispatch<React.SetStateAction<string[]>>;
    submitComment: (workId: number, userId: string, userName: string, userPhoto: string) => Promise<boolean>;
    likeComment: (commentId: string, userId: string) => void;
    submitReply: (parentId: string, workId: number, userId: string, userName: string, userPhoto: string) => Promise<boolean>;
    refreshComments: () => void;
}

/**
 * Custom hook to manage comments for a work
 * Extracts all comments logic from WorkDetails component
 */
export function useWorkComments(
    workId: number | undefined,
    t: (key: string) => string
): UseWorkCommentsResult {
    const [comments, setComments] = useState<CommentWithReplies[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [newComment, setNewComment] = useState('');
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [revealedSpoilers, setRevealedSpoilers] = useState<string[]>([]);

    // Load comments
    const loadComments = useCallback(async () => {
        if (!workId) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await getCommentsWithReplies(workId);
            setComments(data);
        } catch (err) {
            console.error('Error loading comments:', err);
            const error = err as { code?: string; message?: string };
            if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
                setError(t('work_details.comments.permission_error'));
            } else {
                setError(t('work_details.comments.generic_error'));
            }
        } finally {
            setIsLoading(false);
        }
    }, [workId, t]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // Submit new comment
    const submitComment = useCallback(async (
        wId: number,
        userId: string,
        userName: string,
        userPhoto: string
    ): Promise<boolean> => {
        if (!newComment.trim()) return false;

        try {
            await addComment({
                workId: wId,
                userId,
                userName,
                userPhoto,
                text: newComment,
                spoiler: isSpoiler
            });
            setNewComment('');
            setIsSpoiler(false);
            await loadComments();
            return true;
        } catch (err) {
            console.error('Error adding comment:', err);
            return false;
        }
    }, [newComment, isSpoiler, loadComments]);

    // Like/unlike comment
    const likeComment = useCallback((commentId: string, userId: string) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const likes = c.likes.includes(userId)
                    ? c.likes.filter(l => l !== userId)
                    : [...c.likes, userId];
                return { ...c, likes };
            }
            return c;
        }));

        toggleCommentLike(commentId, userId).catch(console.error);
    }, []);

    // Submit reply (a comment with replyTo field)
    const submitReply = useCallback(async (
        parentId: string,
        wId: number,
        userId: string,
        userName: string,
        userPhoto: string
    ): Promise<boolean> => {
        if (!replyText.trim()) return false;

        try {
            await addComment({
                workId: wId,
                userId,
                userName,
                userPhoto,
                text: replyText,
                spoiler: false,
                replyTo: parentId
            });
            setReplyText('');
            setReplyingTo(null);
            await loadComments();
            return true;
        } catch (err) {
            console.error('Error adding reply:', err);
            return false;
        }
    }, [replyText, loadComments]);

    return {
        comments,
        isLoading,
        error,
        newComment,
        setNewComment,
        isSpoiler,
        setIsSpoiler,
        replyingTo,
        setReplyingTo,
        replyText,
        setReplyText,
        revealedSpoilers,
        setRevealedSpoilers,
        submitComment,
        likeComment,
        submitReply,
        refreshComments: loadComments
    };
}
