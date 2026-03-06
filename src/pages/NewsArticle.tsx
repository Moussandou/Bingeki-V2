import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/layout/SEO';
import { Link } from '@/components/routing/LocalizedLink';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ExternalLink, Calendar, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface NewsItem {
    slug: string;
    title: string;
    content: string;
    contentSnippet?: string;
    sourceUrl: string;
    sourceName: string;
    publishedAt: string;
    tags?: string[];
    imageUrl?: string;
}

export default function NewsArticle() {
    const { slug } = useParams<{ slug: string }>();
    const { i18n, t } = useTranslation();
    const [article, setArticle] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchArticle() {
            if (!slug) return;
            try {
                const docRef = doc(db, 'news', slug);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setArticle(docSnap.data() as NewsItem);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error fetching article:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchArticle();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) return <LoadingScreen />;

    if (error || !article) {
        return (
            <Layout>
                <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', minHeight: '60vh' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '2rem' }}>{t('news.not_found', 'Article introuvable')}</h2>
                    <Link to="/news">
                        <Button variant="manga" icon={<ArrowLeft size={18} />}>{t('news.back', 'Retour aux actus')}</Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    const dateLocale = i18n.language === 'fr' ? fr : enUS;
    let formattedDate = article.publishedAt;
    try {
        formattedDate = format(new Date(article.publishedAt), 'PPP', { locale: dateLocale });
    } catch (e) { }

    return (
        <Layout>
            <SEO
                title={`${article.title} - Bingeki News`}
                description={article.contentSnippet ? article.contentSnippet.substring(0, 150) + '...' : article.title}
                image={article.imageUrl}
            />
            {/* Inject canonical link manually since SEO component might not support it directly */}
            <head>
                <link rel="canonical" href={article.sourceUrl} />
            </head>

            <div className="container" style={{ paddingTop: '2rem', maxWidth: '900px', paddingBottom: '6rem' }}>

                <Link to="/news">
                    <Button variant="ghost" icon={<ArrowLeft size={20} />} style={{ marginBottom: '2rem', padding: '0.5rem 0' }}>
                        {t('news.back', 'Retour')}
                    </Button>
                </Link>

                <article style={{
                    background: 'var(--color-surface)',
                    border: '3px solid var(--color-border-heavy)',
                    boxShadow: '12px 12px 0 var(--color-shadow-solid)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Header Image */}
                    {article.imageUrl && (
                        <div style={{ width: '100%', height: '400px', borderBottom: '3px solid var(--color-border-heavy)', position: 'relative' }}>
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />

                            <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {article.tags?.map(tag => (
                                    <span key={tag} style={{
                                        background: 'var(--color-primary)',
                                        color: '#fff',
                                        padding: '4px 12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        boxShadow: '2px 2px 0 #000'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ padding: '2.5rem' }}>
                        {!article.imageUrl && article.tags && article.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                {article.tags.map(tag => (
                                    <span key={tag} style={{
                                        background: 'var(--color-primary)',
                                        color: '#fff',
                                        padding: '4px 12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-heading)',
                            lineHeight: 1.2,
                            marginBottom: '1.5rem',
                            color: 'var(--color-text)'
                        }}>
                            {article.title}
                        </h1>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            color: 'var(--color-text-dim)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            marginBottom: '2.5rem',
                            paddingBottom: '1.5rem',
                            borderBottom: '2px dashed var(--color-border)',
                            textTransform: 'uppercase'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                                <LinkIcon size={16} /> {article.sourceName}
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} /> {formattedDate}
                            </span>
                        </div>

                        {/* Article Content */}
                        <div
                            className="article-content"
                            style={{
                                lineHeight: 1.8,
                                fontSize: '1.1rem',
                                color: 'var(--color-text)',
                            }}
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* CTA Source */}
                        <div style={{
                            marginTop: '4rem',
                            padding: '2.5rem',
                            background: 'var(--color-surface-hover)',
                            border: '3px solid var(--color-border-heavy)',
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: '#fff', padding: '4px 16px', fontWeight: 900, textTransform: 'uppercase' }}>
                                {t('news.source_badge', 'Source Officielle')}
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                                {t('news.read_full', 'Lire l\'information complète')}
                            </h3>
                            <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                                {t('news.disclaimer', 'Cet extrait est proposé par Bingeki. Pour la version intégrale, consultez')} <strong>{article.sourceName}</strong>.
                            </p>
                            <a
                                href={article.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '16px 32px',
                                    background: 'var(--color-text)',
                                    color: 'var(--color-surface)',
                                    fontWeight: 900,
                                    fontFamily: 'var(--font-heading)',
                                    textTransform: 'uppercase',
                                    fontSize: '1.1rem',
                                    textDecoration: 'none',
                                    boxShadow: '6px 6px 0 var(--color-primary)',
                                    transition: 'transform 0.1s, box-shadow 0.1s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                                    e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translate(0, 0)';
                                    e.currentTarget.style.boxShadow = '6px 6px 0 var(--color-primary)';
                                }}
                            >
                                {t('news.go_to_source', 'Voir l\'article original')} <ExternalLink size={20} />
                            </a>
                        </div>
                    </div>
                </article>
            </div>

            {/* Inject Global Styles for Article inside this component just to ensure images scale properly */}
            <style>
                {`
                .article-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    border: 2px solid var(--color-border);
                    margin: 1.5rem 0;
                }
                .article-content a {
                    color: var(--color-primary);
                    font-weight: 700;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                }
                .article-content h2, .article-content h3 {
                    font-family: var(--font-heading);
                    font-weight: 900;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                }
                .article-content ul, .article-content ol {
                    margin-left: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .article-content blockquote {
                    border-left: 4px solid var(--color-primary);
                    padding-left: 1rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    color: var(--color-text-muted);
                    background: var(--color-surface-hover);
                    padding: 1rem;
                }
                `}
            </style>
        </Layout>
    );
}
