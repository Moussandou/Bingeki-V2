import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import styles from '@/pages/WorkDetails.module.css';

interface SynopsisSectionProps {
    synopsis: string | undefined;
    aiSynopsis: string | null;
    loadingSynopsis: boolean;
    spoilerMode: boolean;
}

export function SynopsisSection({
    synopsis,
    aiSynopsis,
    loadingSynopsis,
    spoilerMode
}: SynopsisSectionProps) {
    const { t } = useTranslation();
    const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

    if (!synopsis) return null;

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3 className={styles.synopsisTitle}>{t('work_details.synopsis.title')}</h3>
            <div
                onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                style={{ cursor: 'pointer', position: 'relative' }}
            >
                <div style={{ position: 'relative' }}>
                    {loadingSynopsis && (
                        <div style={{ 
                            marginBottom: '1rem',
                            fontStyle: 'italic', 
                            color: 'var(--color-text-dim)',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0.5rem 1rem',
                            background: 'rgba(var(--color-primary-rgb), 0.1)',
                            borderLeft: '4px solid var(--color-primary)',
                            borderRadius: '4px'
                        }}>
                            <Loader2 size={16} className="animate-spin" />
                            {t('common.translating', 'Traduction en cours...')}
                        </div>
                    )}
                </div>
                <p className={`${spoilerMode ? 'spoiler-blur' : ''} ${styles.synopsisText}`} style={{
                    maxHeight: isSynopsisExpanded ? 'none' : '100px',
                    WebkitLineClamp: isSynopsisExpanded ? 'none' : 4,
                    opacity: loadingSynopsis ? 0.6 : 1,
                    transition: 'opacity 0.3s ease'
                }}>
                    {aiSynopsis || synopsis}
                </p>
                {!isSynopsisExpanded && (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40px',
                        background: 'linear-gradient(transparent, var(--color-surface))',
                        pointerEvents: 'none'
                    }} />
                )}
            </div>
            <button
                onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                style={{
                    background: 'none',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    marginTop: '0.5rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    color: 'var(--color-text)'
                }}
            >
                {isSynopsisExpanded ? t('work_details.synopsis.show_less') : t('work_details.synopsis.show_more')}
            </button>
        </div>
    );
}
