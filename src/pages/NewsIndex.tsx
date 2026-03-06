import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { NewsCard } from '@/components/news/NewsCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/layout/SEO';
import { useTranslation } from 'react-i18next';
import { Newspaper, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsItem {
    slug: string;
    title: string;
    imageUrl?: string;
    sourceName?: string;
    publishedAt: string;
    tags?: string[];
    contentSnippet?: string;
}

export default function NewsIndex() {
    const { t } = useTranslation();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            try {
                const q = query(collection(db, 'news'), orderBy('publishedAt', 'desc'), limit(30));
                const snapshot = await getDocs(q);
                const fetchedNews: NewsItem[] = [];
                snapshot.forEach((doc) => {
                    fetchedNews.push(doc.data() as NewsItem);
                });
                setNews(fetchedNews);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    const featuredNews = news.length > 0 ? news[0] : null;
    const regularNews = news.length > 1 ? news.slice(1) : [];

    return (
        <Layout>
            <SEO
                title={t('news.title', 'Anime & Manga News')}
                description={t('news.description', 'Get the latest anime and manga news, trailers, and release dates.')}
            />

            <div className="container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '6rem' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderBottom: '4px solid var(--color-border-heavy)', paddingBottom: '1rem' }}>
                    <div style={{ background: 'var(--color-primary)', padding: '12px', color: '#fff', boxShadow: '4px 4px 0 var(--color-shadow-solid)' }}>
                        <Newspaper size={32} />
                    </div>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-heading)',
                        margin: 0
                    }}>
                        {t('news.heading', 'Actualités')}
                    </h1>
                </div>

                {featuredNews && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: '#fff', padding: '0.5rem 1rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '-1px', position: 'relative', zIndex: 1, boxShadow: '4px 4px 0 var(--color-shadow-solid)' }}>
                            <Flame size={18} fill="#fff" /> {t('news.featured', 'À LA UNE')}
                        </div>
                        <div style={{ height: '400px' }}>
                            <NewsCard
                                title={featuredNews.title}
                                slug={featuredNews.slug}
                                imageUrl={featuredNews.imageUrl}
                                sourceName={featuredNews.sourceName}
                                publishedAt={featuredNews.publishedAt}
                                tags={featuredNews.tags}
                                featured={true}
                            />
                        </div>
                    </motion.div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {news.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--color-surface)', border: '2px dashed var(--color-border)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                            {t('news.empty', 'Aucune actualité disponible pour le moment.')}
                        </div>
                    ) : (
                        regularNews.map((item, index) => (
                            <motion.div
                                key={item.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ height: '100%' }}
                            >
                                <NewsCard
                                    title={item.title}
                                    slug={item.slug}
                                    imageUrl={item.imageUrl}
                                    sourceName={item.sourceName}
                                    publishedAt={item.publishedAt}
                                    tags={item.tags}
                                />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}
