import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/context/ToastContext';
import { submitFeedback } from '@/firebase/firestore';
import { Star, Send, Bug, Lightbulb, MessageSquare, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Feedback.module.css';

export default function Feedback() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('general');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(''); // For guests
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            addToast(t('feedback.toast_select_rating'), 'error');
            return;
        }
        if (!message.trim()) {
            addToast(t('feedback.toast_write_message'), 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const success = await submitFeedback({
                rating,
                category,
                message,
                userId: user?.uid,
                userName: user?.displayName || 'Guest',
                contactEmail: user?.email || email,
                userAgent: navigator.userAgent
            });

            if (success) {
                setIsSuccess(true);
                addToast(t('feedback.toast_success'), 'success');
                // Reset form
                setRating(0);
                setMessage('');
                if (!user) setEmail('');

                // Redirect after delay
                setTimeout(() => navigate('/'), 3000);
            } else {
                addToast(t('feedback.toast_error'), 'error');
            }
        } catch (error) {
            console.error('Feedback error:', error);
            addToast(t('feedback.toast_unexpected'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Layout>
                <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                        {t('feedback.success_icon')}
                    </div>
                    <h1 className={styles.successTitle}>{t('feedback.success_title')}</h1>
                    <p className={styles.successMessage}>
                        {t('feedback.success_message')}
                    </p>
                    <Button onClick={() => navigate('/')}>{t('feedback.back_home')}</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    {t('feedback.title')}
                </h1>
                <p className={styles.subtitle}>
                    {t('feedback.subtitle_1')}<br />
                    {t('feedback.subtitle_2')}
                </p>

                <div className={styles.formCard}>
                    {/* Corner accents */}
                    <div className={`${styles.cornerAccent} ${styles.cornerTL}`} />
                    <div className={`${styles.cornerAccent} ${styles.cornerTR}`} />
                    <div className={`${styles.cornerAccent} ${styles.cornerBL}`} />
                    <div className={`${styles.cornerAccent} ${styles.cornerBR}`} />

                    <form onSubmit={handleSubmit} className={styles.form}>

                        {/* Rating */}
                        <div style={{ textAlign: 'center' }}>
                            <label className={styles.sectionLabel}>
                                {t('feedback.rating_label')}
                            </label>
                            <div className={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={styles.starButton}
                                        style={{ opacity: rating >= star ? 1 : 0.3 }}
                                    >
                                        <Star fill={rating >= star ? '#000' : 'none'} color="#000" size={28} strokeWidth={2.5} />
                                    </button>
                                ))}
                            </div>
                            <div className={styles.ratingScore}>
                                {rating > 0 ? `${rating}/10` : ''}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className={styles.sectionLabel}>
                                {t('feedback.category_label')}
                            </label>
                            <div className={styles.categoryGrid}>
                                <button
                                    type="button"
                                    onClick={() => setCategory('bug')}
                                    className={`${styles.categoryButton} ${styles.catBug} ${category === 'bug' ? styles.categoryActive : ''}`}
                                >
                                    <Bug size={32} />
                                    <span>{t('feedback.category_bug')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategory('feature')}
                                    className={`${styles.categoryButton} ${styles.catIdea} ${category === 'feature' ? styles.categoryActive : ''}`}
                                >
                                    <Lightbulb size={32} />
                                    <span>{t('feedback.category_idea')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategory('general')}
                                    className={`${styles.categoryButton} ${styles.catGeneral} ${category === 'general' ? styles.categoryActive : ''}`}
                                >
                                    <MessageSquare size={32} />
                                    <span>{t('feedback.category_general')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className={styles.sectionLabel}>
                                {t('feedback.message_label')}
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('feedback.message_placeholder')}
                                className={styles.textarea}
                            />
                        </div>

                        {/* Guest Contact Info */}
                        {!user && (
                            <div>
                                <label className={styles.sectionLabel}>
                                    {t('feedback.email_label')}
                                </label>
                                <div className={styles.inputWrapper}>
                                    <Mail className={styles.inputIcon} size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('feedback.email_placeholder')}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                            icon={<Send size={20} />}
                        >
                            {isSubmitting ? t('feedback.submit_sending') : t('feedback.submit_btn')}
                        </Button>

                    </form>
                </div>
            </div>
        </Layout>
    );
}

