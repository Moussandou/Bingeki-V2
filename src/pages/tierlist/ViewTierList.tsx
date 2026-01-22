import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { getTierListById } from '@/firebase/firestore';
import type { TierList } from '@/firebase/firestore';
import { TierRow } from '@/components/tierlist/TierRow';
import { Button } from '@/components/ui/Button';
import { Download, Copy, User, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas'; // Fixed import
import { useToast } from '@/context/ToastContext';

export default function ViewTierList() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const tiersRef = useRef<HTMLDivElement>(null);
    const [tierList, setTierList] = useState<TierList | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchList = async () => {
            try {
                const data = await getTierListById(id);
                setTierList(data);
            } catch (error) {
                console.error(error);
                addToast(t('tierlist.load_error'), 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [id, addToast, t]);

    const handleExportImage = async () => {
        if (!tiersRef.current || !tierList) return;
        try {
            const canvas = await html2canvas(tiersRef.current, {
                backgroundColor: '#111',
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            const link = document.createElement('a');
            link.download = `${tierList.title.replace(/\s+/g, '_')}_tierlist.png`;
            link.href = canvas.toDataURL();
            link.click();
            addToast(t('tierlist.export_success'), 'success');
        } catch (error) {
            console.error(error);
            addToast(t('tierlist.export_error'), 'error');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>Loading...</div>
            </Layout>
        );
    }

    if (!tierList) {
        return (
            <Layout>
                <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>
                    <h2>Tier List Not Found</h2>
                    <Button onClick={() => navigate('/tierlist')} variant="outline">Back to Feed</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container" style={{ padding: '2rem' }}>
                {/* Header Info */}
                <div style={{ marginBottom: '2rem', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{
                                fontSize: '3rem',
                                fontFamily: 'var(--font-heading)',
                                margin: '0 0 1rem 0',
                                lineHeight: 1
                            }}>
                                {tierList.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '2rem', color: '#888' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={18} />
                                    <span>Created by <strong>{tierList.authorName}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={18} />
                                    <span>{new Date(tierList.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button onClick={handleExportImage} variant="primary" icon={<Download size={20} />}>
                                Export Image
                            </Button>
                            <Button onClick={() => navigate('/tierlist/create')} variant="outline" icon={<Copy size={20} />}>
                                Create Your Own
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tier List Display */}
                <div
                    ref={tiersRef}
                    style={{
                        background: '#111',
                        padding: '1rem',
                        border: '2px solid white',
                        borderRadius: '8px'
                    }}
                >
                    {tierList.tiers.map(tier => (
                        <TierRow
                            key={tier.id}
                            tier={tier}
                            readOnly={true}
                        />
                    ))}
                </div>
            </div>
        </Layout>
    );
}
