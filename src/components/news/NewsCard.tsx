import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface NewsCardProps {
    title: string;
    slug: string;
    imageUrl?: string | null;
    sourceName?: string;
    publishedAt: string;
    tags?: string[];
}

export function NewsCard({ title, slug, imageUrl, sourceName, publishedAt, tags = [] }: NewsCardProps) {
    const { i18n } = useTranslation();
    const dateLocale = i18n.language === 'fr' ? fr : enUS;

    let timeAgo = '';
    try {
        timeAgo = formatDistanceToNow(new Date(publishedAt), { addSuffix: true, locale: dateLocale });
    } catch (e) {
        timeAgo = publishedAt;
    }

    const primaryTag = tags.length > 0 ? tags[0] : 'News';
    const langPrefix = i18n.language === 'fr' ? '/fr' : '/en';

    return (
        <Link to={`${langPrefix}/news/article/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--color-surface)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    height: '100%',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                {/* Thumbnail */}
                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'var(--color-surface-hover)', position: 'relative', overflow: 'hidden' }}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                            News
                        </div>
                    )}
                    {/* Tag Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {primaryTag}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        marginBottom: '12px',
                        color: 'var(--color-text)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4
                    }}>
                        {title}
                    </h3>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ fontWeight: 600 }}>{sourceName || 'Anime News'}</span>
                        <span>{timeAgo}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
