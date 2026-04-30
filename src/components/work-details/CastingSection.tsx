import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/components/routing/LocalizedLink';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Button } from '@/components/ui/Button';
import type { JikanCharacter } from '@/services/animeApi';
import styles from '@/pages/WorkDetails.module.css';

interface CastingSectionProps {
    characters: JikanCharacter[];
    isCastingExpanded: boolean;
    setIsCastingExpanded: (expanded: boolean) => void;
}

export function CastingSection({ characters, isCastingExpanded, setIsCastingExpanded }: CastingSectionProps) {
    const { t } = useTranslation();
    const navigate = useLocalizedNavigate();

    if (characters.length === 0) return null;

    return (
        <div style={{ marginTop: '1rem' }}>
            <h3 className={styles.synopsisTitle} style={{ marginBottom: '1rem' }}>
                {t('work_details.casting.title')}
            </h3>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center'
            }}>
                {characters
                    .filter(c => c.character.images?.jpg?.image_url)
                    .slice(0, isCastingExpanded ? undefined : 12)
                    .map((c) => {
                        const jpVa = c.voice_actors?.find((va) => va.language === 'Japanese');
                        return (
                            <div key={c.character.mal_id} className={styles.castingItem} style={{ flex: '1 1 100px', maxWidth: '120px' }}>
                                {/* Character Image - Clickable */}
                                <div
                                    onClick={() => navigate(`/character/${c.character.mal_id}`)}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        border: '3px solid var(--color-border-heavy)',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem',
                                        background: 'var(--color-surface-hover)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        margin: '0 auto'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <OptimizedImage
                                        src={c.character.images.jpg.image_url}
                                        alt={c.character.name}
                                        objectFit="cover"
                                    />
                                </div>
                                <div
                                    onClick={() => navigate(`/character/${c.character.mal_id}`)}
                                    style={{ fontSize: '0.8rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.2, marginBottom: '4px', cursor: 'pointer' }}
                                >
                                    {c.character.name}
                                </div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'center', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    {c.role}
                                </div>

                                {/* Seiyuu Info - Clickable */}
                                {jpVa && (
                                    <div
                                        onClick={() => navigate(`/person/${jpVa.person.mal_id}`)}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto',
                                            borderTop: '1px dashed var(--color-border)', paddingTop: '4px', width: '100%', cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '2px solid var(--color-border-heavy)',
                                            marginBottom: '2px'
                                        }}>
                                            <OptimizedImage
                                                src={jpVa.person.images.jpg.image_url}
                                                alt={jpVa.person.name}
                                                objectFit="cover"
                                            />
                                        </div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-dim)', textAlign: 'center', lineHeight: 1.1 }}>
                                            {jpVa.person.name}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>

            {/* Show More / Show Less Button */}
            {characters.length > 12 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Button
                        onClick={() => setIsCastingExpanded(!isCastingExpanded)}
                        variant="ghost"
                        style={{ border: '1px dashed var(--color-border-heavy)', color: 'var(--color-text)' }}
                    >
                        {isCastingExpanded ? t('work_details.casting.show_less') : t('work_details.casting.show_more', { count: characters.length - 12 })}
                    </Button>
                </div>
            )}
        </div>
    );
}
