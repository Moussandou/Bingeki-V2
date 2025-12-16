import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useLibraryStore } from '@/store/libraryStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal'; // Import Modal
import { ArrowLeft, BookOpen, Check, Trophy, Star, Trash2, AlertTriangle } from 'lucide-react'; // Import AlertTriangle
import { useState } from 'react';
import { statusToFrench } from '@/utils/statusTranslation';
import { useGamificationStore, XP_REWARDS } from '@/store/gamificationStore';

export default function WorkDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getWork, updateProgress, updateStatus, updateWorkDetails, removeWork } = useLibraryStore(); // Add removeWork
    const { addXp, recordActivity, incrementStat } = useGamificationStore();
    const work = getWork(Number(id));
    const [isEditing, setIsEditing] = useState(false);
    const [progress, setProgress] = useState(work?.currentChapter || 0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State

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
        const oldProgress = work?.currentChapter || 0;
        updateProgress(work.id, progress);

        // Award XP if progress increased
        if (progress > oldProgress) {
            const chaptersRead = progress - oldProgress;
            for (let i = 0; i < chaptersRead; i++) {
                incrementStat('chapters');
            }
            addXp(XP_REWARDS.UPDATE_PROGRESS * chaptersRead);
            recordActivity();

            // Bonus XP if work is completed
            if (work.totalChapters && progress >= work.totalChapters) {
                addXp(XP_REWARDS.COMPLETE_WORK);
                updateStatus(work.id, 'completed');
                incrementStat('completed');
            }
        }

        setIsEditing(false);
    };

    const handleDelete = () => {
        removeWork(work.id);
        navigate('/library');
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

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>STATUT</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

                        {/* Rating Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>MA NOTE</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => updateWorkDetails(work.id, { rating: star })}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Star
                                            size={32}
                                            fill={(work.rating || 0) >= star ? '#000' : 'none'}
                                            color="#000"
                                            strokeWidth={2}
                                        />
                                    </button>
                                ))}
                                <span style={{ marginLeft: '1rem', fontSize: '1.5rem', fontWeight: 900 }}>{work.rating ? `${work.rating}/10` : '-/10'}</span>
                            </div>
                        </div>


                        {/* Notes Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>MES NOTES</h3>
                            <textarea
                                value={work.notes || ''}
                                onChange={(e) => updateWorkDetails(work.id, { notes: e.target.value })}
                                placeholder="Écrivez vos pensées ici..."
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    border: '2px solid #000',
                                    padding: '1rem',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    background: '#f9f9f9',
                                    marginBottom: '2rem'
                                }}
                            />
                        </div>

                        {/* Danger Zone */}
                        <div style={{ borderTop: '2px dashed #000', paddingTop: '2rem' }}>
                            <Button
                                onClick={() => setIsDeleteModalOpen(true)}
                                style={{
                                    background: '#ff0000',
                                    color: '#fff',
                                    width: '100%',
                                    fontWeight: 900,
                                    textTransform: 'uppercase'
                                }}
                                icon={<Trash2 size={20} />}
                            >
                                Supprimer de la bibliothèque
                            </Button>
                        </div>

                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="SUPPRESSION">
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '50%', color: '#dc2626' }}>
                                <AlertTriangle size={32} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#000' }}>
                            Supprimer "{work.title}" ?
                        </h3>
                        <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                            Cette action est irréversible. Votre progression et vos notes seront perdues.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                                ANNULER
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDelete}
                                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                            >
                                SUPPRIMER
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
}
