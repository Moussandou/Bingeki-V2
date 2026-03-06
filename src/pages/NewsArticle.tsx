import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
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
    const { i18n } = useTranslation();
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
    }, [slug]);

    if (loading) return <LoadingScreen />;

    if (error || !article) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <h2>Article introuvable</h2>
                <Link to={`/${i18n.language}/news`}>Retour aux actus</Link>
            </div>
        );
    }

    const dateLocale = i18n.language === 'fr' ? fr : enUS;
    let formattedDate = article.publishedAt;
    try {
        formattedDate = format(new Date(article.publishedAt), 'PPP', { locale: dateLocale });
    } catch (e) { }

    return (
        <>
            <Helmet>
                <title>{article.title} - Bingeki News</title>
                <meta name="description" content={article.contentSnippet ? article.contentSnippet.substring(0, 150) + '...' : article.title} />
                {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
                {/* Canonical link to original source is REQUIRED for SEO since we aggregate */}
                <link rel="canonical" href={article.sourceUrl} />
            </Helmet>

            <div className="container" style={{ paddingTop: '100px', maxWidth: '800px', paddingBottom: '4rem' }}>

                <Link to={`/${i18n.language}/news`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem' }}>
                    &larr; Retour
                </Link>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {article.tags?.map(tag => (
                        <span key={tag} style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    lineHeight: 1.2,
                    marginBottom: '1.5rem',
                    color: 'var(--color-text)'
                }}>
                    {article.title}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Source: {article.sourceName}</span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                </div>

                {article.imageUrl && (
                    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', backgroundColor: 'var(--color-surface)' }}>
                        <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                )}

                {/* Since data is sanitized during scraping, we use dangerouslySetInnerHTML safely */}
                <div
                    style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--color-text)' }}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--color-surface-hover)', borderRadius: '12px', textAlign: 'center', border: '1px dashed var(--color-primary)' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 800 }}>Lire l'information complète originelle</h3>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>Cet article est un extrait informatif public relayant l'information issue de <strong>{article.sourceName}</strong>.</p>
                    <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            borderRadius: '8px',
                            fontWeight: 800,
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(255, 94, 91, 0.4)'
                        }}
                    >
                        Voir l'article source &rarr;
                    </a>
                </div>

            </div>
        </>
    );
}
