import { Star } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useTranslation } from 'react-i18next';
import type { UserProfile } from '@/firebase/users';
import type { Work } from '@/store/libraryStore';
import styles from '@/pages/WorkDetails.module.css';

interface FriendsActivitySectionProps {
    friendsReading: { count: number; friends: { profile: UserProfile; work: Work }[] };
}

export function FriendsActivitySection({ friendsReading }: FriendsActivitySectionProps) {
    const { t } = useTranslation();

    if (friendsReading.count === 0) return null;

    return (
        <div style={{
            marginBottom: '2rem',
            border: '2px solid var(--color-border-heavy)',
            padding: '1.5rem',
            boxShadow: '8px 8px 0 var(--color-shadow-solid)',
            background: 'var(--color-surface)'
        }}>
            <div className={styles.friendsActivitySection}>
                <h4 className={styles.friendsActivityHeader}>
                    👥 {t('work_details.comments.friends_count', { count: friendsReading.count })}
                </h4>
                <div className={styles.friendsCardsList}>
                    {friendsReading.friends.map(({ profile, work: friendWork }) => (
                        <div key={profile.uid} className={styles.friendCard}>
                            <div className={styles.friendCardMain}>
                                <div className={styles.friendAvatarWrapper}>
                                    <OptimizedImage
                                        src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}`}
                                        alt={profile.displayName || ''}
                                    />
                                </div>
                                <div className={styles.friendCardInfo}>
                                    <span className={styles.friendNameText}>{profile.displayName}</span>
                                    <div className={styles.friendRatingStars}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={12} 
                                                fill={i < Math.round((friendWork.rating || 0) / 2) ? '#ffb800' : 'none'}
                                                color={i < Math.round((friendWork.rating || 0) / 2) ? '#ffb800' : 'rgba(255,255,255,0.2)'}
                                            />
                                        ))}
                                        <span className={styles.friendRatingValue}>{friendWork.rating || 0}/10</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.friendProgressBadge}>
                                <span>
                                    {friendWork.type === 'manga' ? t('library.chapters') : t('library.episodes')}: 
                                    <strong> {friendWork.currentChapter} / {friendWork.totalChapters || '?'}</strong>
                                </span>
                            </div>

                            {friendWork.notes && (
                                <div className={styles.friendNoteBubble}>
                                    <p>"{friendWork.notes}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
