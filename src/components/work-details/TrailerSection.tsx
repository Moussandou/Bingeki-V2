import { useTranslation } from 'react-i18next';
import { Video, ExternalLink } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { YoutubeIcon } from '@/components/ui/BrandIcons';
import styles from '@/pages/WorkDetails.module.css';

interface JikanTrailer {
    youtube_id: string;
    url: string;
    embed_url: string;
    images: {
        image_url?: string;
        small_image_url?: string;
        medium_image_url?: string;
        large_image_url?: string;
        maximum_image_url?: string;
    };
}

interface TrailerSectionProps {
    trailer?: JikanTrailer;
    isTrailerOpen: boolean;
    setIsTrailerOpen: (open: boolean) => void;
}

export function TrailerSection({ trailer, isTrailerOpen, setIsTrailerOpen }: TrailerSectionProps) {
    const { t } = useTranslation();

    if (!trailer || !trailer.embed_url) return null;

    const trailerThumbnail = trailer.images?.maximum_image_url
        || trailer.images?.large_image_url
        || trailer.images?.medium_image_url
        || trailer.images?.small_image_url
        || (trailer.youtube_id ? `https://img.youtube.com/vi/${trailer.youtube_id}/maxresdefault.jpg` : null);

    const trailerFallback = trailer.youtube_id
        ? `https://img.youtube.com/vi/${trailer.youtube_id}/hqdefault.jpg`
        : undefined;

    return (
        <div className={styles.trailerSection}>
            <div className={styles.infoLabel}>
                <Video size={14} />
                {t('work_details.trailer.title')}
            </div>

            <div
                className={styles.trailerCard}
                onClick={() => !isTrailerOpen && setIsTrailerOpen(true)}
            >
                {isTrailerOpen ? (
                    <div className={styles.videoWrapper}>
                        <iframe
                            src={`${trailer.embed_url}${trailer.embed_url.includes('?') ? '&' : '?'}autoplay=1&mute=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`}
                            title="Trailer"
                            className={styles.iframe}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    </div>
                ) : (
                    <>
                        <OptimizedImage
                            src={trailerThumbnail || ''}
                            fallback={trailerFallback}
                            alt="Trailer Thumbnail"
                            className={styles.trailerThumbnail}
                        />
                        <div className={styles.playButton}>
                            <div style={{
                                width: 0,
                                height: 0,
                                borderTop: '15px solid transparent',
                                borderBottom: '15px solid transparent',
                                borderLeft: '25px solid currentColor',
                                marginLeft: '8px'
                            }} />
                        </div>
                    </>
                )}
            </div>

            <div className={styles.trailerActions}>
                {isTrailerOpen ? (
                    <button
                        className={styles.closeTrailer}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsTrailerOpen(false);
                        }}
                    >
                        {t('work_details.trailer.close')}
                    </button>
                ) : (
                    <div />
                )}

                <a
                    href={trailer.url || `https://www.youtube.com/watch?v=${trailer.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.youtubeLink}
                >
                    <YoutubeIcon size={18} />
                    {t('work_details.trailer.watch_on_youtube')}
                    <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
}
