import { useState, useEffect } from 'react';
import { Star, Mail, Trash2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getAllFeedback, deleteFeedback, updateFeedbackStatus, type FeedbackData } from '@/firebase/firestore';
import { useTranslation } from 'react-i18next';

export default function AdminFeedback() {
    const { t } = useTranslation();
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const data = await getAllFeedback();
            setFeedbacks(data);
        } catch (e) {
            console.error("Failed to load feedback", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.feedback.confirm_delete'))) {
            try {
                await deleteFeedback(id);
                setFeedbacks(prev => prev.filter(f => f.id !== id));
            } catch (e) {
                alert(t('admin.feedback.delete_error'));
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string | undefined) => {
        const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
        try {
            await updateFeedbackStatus(id, newStatus);
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        } catch (e) {
            alert(t('admin.feedback.status_error'));
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'bug': return '#ef4444'; // Red
            case 'feature': return '#3b82f6'; // Blue
            default: return '#6b7280'; // Gray
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', textTransform: 'uppercase' }}>{t('admin.feedback.title')}</h1>
                    <p style={{
                        borderLeft: '2px solid black',
                        paddingLeft: '0.5rem',
                        color: '#666',
                        fontStyle: 'italic'
                    }}>
                        {t('admin.feedback.tickets_pending', { count: feedbacks.filter(f => (f as any).status !== 'resolved').length })}
                    </p>
                </div>
                <button
                    onClick={loadFeedback}
                    style={{
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        color: 'black'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'black'}
                >
                    {t('admin.feedback.refresh')}
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {loading ? (
                    <p>{t('admin.feedback.loading')}</p>
                ) : feedbacks.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#666' }}>
                        {t('admin.feedback.no_messages')}
                    </div>
                ) : (
                    feedbacks.map((item) => {
                        const isResolved = (item as any).status === 'resolved';
                        return (
                            <Card
                                key={item.id}
                                variant="manga"
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '250px',
                                    position: 'relative',
                                    background: 'white',
                                    opacity: isResolved ? 0.75 : 1,
                                    filter: isResolved ? 'grayscale(80%)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {/* Badges */}
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', display: 'flex', gap: '0.5rem' }}>
                                    <div style={{
                                        backgroundColor: getCategoryColor(item.category),
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        border: '2px solid black',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        fontSize: '0.75rem',
                                        boxShadow: '2px 2px 0 #000'
                                    }}>
                                        {item.category}
                                    </div>
                                    {isResolved && (
                                        <div style={{
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            border: '2px solid black',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            fontSize: '0.75rem',
                                            boxShadow: '2px 2px 0 #000',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            <CheckCircle size={12} strokeWidth={3} /> {t('admin.feedback.resolved')}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', lineHeight: 1.25, textTransform: 'uppercase' }}>
                                                {item.userName || t('admin.feedback.anonymous')}
                                            </h3>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'black', color: 'white', padding: '0.25rem 0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                            <Star size={12} fill="currentColor" /> {item.rating}/10
                                        </div>
                                    </div>

                                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                        <MessageSquare size={48} style={{ position: 'absolute', top: '-0.5rem', left: '-0.5rem', opacity: 0.05, color: 'black' }} />
                                        <p style={{ color: '#374151', lineHeight: 1.625, fontWeight: 500, position: 'relative', zIndex: 10 }}>
                                            "{item.message}"
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #f3f4f6', marginTop: 'auto', gap: '0.5rem' }}>
                                    {item.contactEmail ? (
                                        <a href={`mailto:${item.contactEmail}`} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                                            padding: '0.25rem 0.5rem', borderRadius: '0.125rem',
                                            color: 'black', textDecoration: 'none'
                                        }} title={item.contactEmail}>
                                            <Mail size={14} /> {t('admin.feedback.reply')}
                                        </a>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>{t('admin.feedback.no_email')}</span>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleToggleStatus(item.id, (item as any).status)}
                                            style={{
                                                padding: '0.5rem',
                                                border: '2px solid black',
                                                backgroundColor: isResolved ? '#fbbf24' : '#4ade80',
                                                cursor: 'pointer',
                                                transition: 'transform 0.1s'
                                            }}
                                            title={isResolved ? t('admin.feedback.reopen') : t('admin.feedback.mark_resolved')}
                                        >
                                            {isResolved ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            style={{
                                                padding: '0.5rem',
                                                border: '2px solid black',
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                                color: '#ef4444'
                                            }}
                                            title={t('admin.feedback.delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
