import { useState, useEffect } from 'react';
import { Star, Mail, Trash2 } from 'lucide-react';
import { getAllFeedback, type FeedbackData } from '@/firebase/firestore';

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);


    useEffect(() => {
        const fetchFeedback = async () => {
            // For now we mock logic or fetch real if available
            // But let's assume we want to use the real one if permissions allowed
            // Or fallback to mock for UI dev
            try {
                const data = await getAllFeedback();
                setFeedbacks(data);
            } catch (e) {
                console.error("Failed to load feedback", e);
            }
        };
        fetchFeedback();
    }, []);

    const handleDelete = (id: string) => {
        // Mock delete
        setFeedbacks(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div>
            <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                textTransform: 'uppercase',
                marginBottom: '2rem'
            }}>
                Feedback Center
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {feedbacks.map((item) => (
                    <div key={item.id} style={{
                        background: '#fff',
                        border: '3px solid #000',
                        padding: '1.5rem',
                        boxShadow: '6px 6px 0 rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        {/* Status Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '20px',
                            background: item.category === 'bug' ? '#ef4444' : '#3b82f6',
                            color: '#fff',
                            padding: '0.25rem 0.75rem',
                            border: '2px solid #000',
                            fontWeight: 900,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase'
                        }}>
                            {item.category}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                {item.userName || 'Anonyme'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Star size={16} fill="#000" />
                                <span style={{ fontWeight: 900 }}>{item.rating}/10</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem', color: '#444' }}>
                            {item.message}
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            borderTop: '1px solid #eee',
                            paddingTop: '1rem'
                        }}>
                            {item.contactEmail && (
                                <a href={`mailto:${item.contactEmail}`} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: '#000', color: '#fff',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.9rem'
                                }}>
                                    <Mail size={16} />
                                    Répondre
                                </a>
                            )}
                            <button onClick={() => handleDelete(item.id)} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'transparent', color: '#ef4444',
                                border: '2px solid #ef4444',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}>
                                <Trash2 size={16} />
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
