import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { getDisplayTitle } from '@/utils/titleUtils';
import styles from '@/pages/WorkDetails.module.css';

interface WorkCoverSectionProps {
    work: any;
    titleLanguage: 'default' | 'romaji' | 'native' | 'english';
}

export function WorkCoverSection({ work, titleLanguage }: WorkCoverSectionProps) {
    return (
        <div className={styles.coverSection}>
            <div className={styles.coverImageWrapper}>
                <OptimizedImage
                    src={work.image}
                    lowResSrc={work.image_small}
                    alt={getDisplayTitle(work, titleLanguage)}
                    className={styles.poster}
                />

                <div className={styles.typeLabel}>
                    {work.type ? work.type.toUpperCase() : 'TYPE'}
                </div>
            </div>
        </div>
    );
}
