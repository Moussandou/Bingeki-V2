import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { getPublicTierLists } from '@/firebase/firestore';
import type { TierList } from '@/firebase/firestore';
import { TierListCard } from '@/components/tierlist/TierListCard';
import { Button } from '@/components/ui/Button';
import { Plus, Flame, Clock } from 'lucide-react'; // Removed unused imports
import { useNavigate } from 'react-router-dom';

export default function TierListFeed() {
    const [lists, setLists] = useState<TierList[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'recent' | 'popular'>('recent');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLists = async () => {
            setLoading(true);
            try {
                const data = await getPublicTierLists(50);
                // Sort client-side for now as we lack 'likeCount' index
                if (filter === 'popular') {
                    data.sort((a, b) => b.likes.length - a.likes.length);
                }
                setLists(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchLists();
    }, [filter]);

    return (
        <Layout>
            <div className="container" style={{ padding: '2rem', minHeight: '80vh', background: '#09090b', borderRadius: '1rem', marginTop: '1rem' }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-heading)',
                            color: 'white',
                            lineHeight: 1,
                            margin: 0
                        }}>
                            TIER LISTS
                        </h1>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>
                            Discover community rankings
                        </p>
                    </div>
                    <Button
                        size="lg"
                        variant="primary"
                        icon={<Plus size={20} />}
                        onClick={() => navigate('/tierlist/create')}
                    >
                        Create Your Own
                    </Button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <Button
                        variant={filter === 'recent' ? 'primary' : 'outline'}
                        onClick={() => setFilter('recent')}
                        icon={<Clock size={16} />}
                        size="sm"
                    >
                        Most Recent
                    </Button>
                    <Button
                        variant={filter === 'popular' ? 'primary' : 'outline'}
                        onClick={() => setFilter('popular')}
                        icon={<Flame size={16} />}
                        size="sm"
                    >
                        Top Rated
                    </Button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>
                        Loading...
                    </div>
                ) : lists.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {lists.map(list => (
                            <TierListCard key={list.id} tierList={list} />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        border: '2px dashed #333',
                        borderRadius: '1rem',
                        color: '#666'
                    }}>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>No Tier Lists Found</h2>
                        <p>Be the first to create one!</p>
                        <Button
                            className="mt-4"
                            onClick={() => navigate('/tierlist/create')}
                            variant="primary"
                        >
                            Create Now
                        </Button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
