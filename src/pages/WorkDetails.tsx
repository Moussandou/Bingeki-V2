import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useLibraryStore } from '@/store/libraryStore';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, Check, Trophy } from 'lucide-react';
import { useState } from 'react';
import { statusToFrench } from '@/utils/statusTranslation';

export default function WorkDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getWork, updateProgress, updateStatus } = useLibraryStore();
    const work = getWork(Number(id));
    const [isEditing, setIsEditing] = useState(false);
    const [progress, setProgress] = useState(work?.currentChapter || 0);

    if (!work) {
        return (
            <Layout>
                <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>ŒUVRE INTROUVABLE</h1>
                    <Button onClick={() => navigate('/library')} style={{ marginTop: '1rem' }}>Retour à la base</Button>
                </div>
            </Layout>
        );
    }

    const handleSave = () => {
        updateProgress(work.id, progress);
        setIsEditing(false);
    };

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
                <Button
                    onClick={() => navigate('/library')}
                    variant="ghost"
                    icon={<ArrowLeft size={20} />}
                    style={{ marginBottom: '2rem', paddingLeft: 0 }}
                >
                    RETOUR
                </Button>

                <div className="manga-panel" style={{ background: '#fff', color: '#000', padding: '2rem', display: 'flex', gap: '2rem', flexDirection: 'row', alignItems: 'flex-start' }}>

                    {/* Cover Image */}
                    <div style={{ width: '250px', flexShrink: 0 }}>
                        <div style={{ border: '4px solid #000', boxShadow: '8px 8px 0 #000', position: 'relative' }}>
                            <img
                                src={work.image}
                                alt={work.title}
                                style={{ width: '100%', display: 'block' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '-10px',
                                background: '#000',
                                color: '#fff',
                                padding: '0.25rem 1rem',
                                transform: 'rotate(-5deg)',
                                fontWeight: 900,
                                fontSize: '1.2rem',
                                border: '2px solid #fff'
                            }}>
                                {work.type.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '3rem',
                            lineHeight: 1,
                            marginBottom: '1rem',
                            textTransform: 'uppercase',
                            textShadow: '3px 3px 0 rgba(0,0,0,0.1)',
                            color: '#000'
                        }}>
                            {work.title}
                        </h1>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', color: '#000' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: '2px solid #000', padding: '0.5rem 1rem' }}>
                                <Trophy size={20} />
                                <span>Score: {work.score || '?'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: '2px solid #000', padding: '0.5rem 1rem' }}>
                                <BookOpen size={20} />
                                <span>{work.totalChapters || '?'} Chaps</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>PROGRESSION</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#000' }}>
                                {isEditing ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            value={progress}
                                            onChange={(e) => setProgress(Number(e.target.value))}
                                            style={{
                                                fontSize: '2rem',
                                                fontWeight: 900,
                                                width: '100px',
                                                border: '2px solid #000',
                                                padding: '0.5rem',
                                                textAlign: 'center',
                                                color: '#000',
                                                background: '#fff'
                                            }}
                                        />
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>/ {work.totalChapters || '?'}</span>
                                        <Button onClick={handleSave} variant="primary" icon={<Check size={20} />}>OK</Button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>
                                            {work.currentChapter} <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>/ {work.totalChapters || '?'}</span>
                                        </span>
                                        <Button onClick={() => setIsEditing(true)} variant="manga">Mettre à jour</Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>STATUT</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['reading', 'completed', 'plan_to_read', 'dropped'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(work.id, s as any)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: '2px solid #000',
                                            background: work.status === s ? '#000' : '#fff',
                                            color: work.status === s ? '#fff' : '#000',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            cursor: 'pointer',
                                            transform: work.status === s ? 'translateY(-2px)' : 'none',
                                            boxShadow: work.status === s ? '4px 4px 0 rgba(0,0,0,0.2)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {statusToFrench(s)}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
}
