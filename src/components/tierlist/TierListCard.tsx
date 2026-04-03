import type { TierList } from '@/firebase/firestore';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TierListCard.module.css';

interface TierListCardProps {
    tierList: TierList;
}

export function TierListCard({ tierList }: TierListCardProps) {
    const navigate = useNavigate();
    const { lang } = useParams();

    // Find the first tier with items to show as preview
    const previewTier = tierList.tiers.find(t => t.items.length > 0) || tierList.tiers[0];
    const previewItems = previewTier?.items.slice(0, 5) || [];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ x: -2, y: -2, boxShadow: '8px 8px 0 var(--color-primary)' }}
            onClick={() => navigate(`/${lang}/tierlist/${tierList.id}`)}
            className={styles.card}
        >
            {/* Preview Section */}
            <div
                className={styles.preview}
                style={{ background: previewTier?.color || 'var(--color-border)' }}
            >
                <div className={styles.previewLabel}>
                    {previewTier?.label || 'RANK'}
                </div>
                {previewItems.map(item => (
                    <OptimizedImage
                        key={item.id}
                        src={item.image}
                        alt={item.name}
                        className={styles.previewImage}
                        style={{ width: '60px', height: '80px' }}
                        objectFit="cover"
                        showSkeleton={false}
                    />
                ))}
            </div>

            {/* Info Section */}
            <div className={styles.info}>
                <h3 className={styles.infoTitle}>
                    {tierList.title}
                </h3>

                <div className={styles.infoMeta}>
                    <div className={styles.metaAuthor}>
                        {tierList.authorPhoto ? (
                            <OptimizedImage
                                src={tierList.authorPhoto}
                                className={styles.authorAvatar}
                                style={{ width: 24, height: 24 }}
                                alt="Author"
                                objectFit="cover"
                                showSkeleton={false}
                            />
                        ) : (
                            <User size={16} />
                        )}
                        <span>{tierList.authorName}</span>
                    </div>
                    <div className={styles.metaLikes}>
                        <Heart
                            size={16}
                            fill={tierList.likes.length > 0 ? 'var(--color-primary)' : 'none'}
                            color={tierList.likes.length > 0 ? 'var(--color-primary)' : 'var(--color-text-dim)'}
                        />
                        <span>{tierList.likes.length}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
