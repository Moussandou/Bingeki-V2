import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { NewsCard } from '@/components/news/NewsCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

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

    return (
        <>
            <Helmet>
                <title>Anime & Manga News - Bingeki</title>
                <meta name="description" content="Get the latest anime and manga news, trailers, and release dates." />
            </Helmet>

            <div className="container" style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    marginBottom: '2rem',
                    color: 'var(--color-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    Actualités Anime & Manga
                </h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px'
                }}>
                    {news.length === 0 ? (
                        <p>No news available at the moment.</p>
                    ) : (
                        news.map((item) => (
                            <NewsCard
                                key={item.slug}
                                title={item.title}
                                slug={item.slug}
                                imageUrl={item.imageUrl}
                                sourceName={item.sourceName}
                                publishedAt={item.publishedAt}
                                tags={item.tags}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
