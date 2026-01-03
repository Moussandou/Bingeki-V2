import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Heart, User, Loader2, Mic } from 'lucide-react';
import { getCharacterFull, type JikanCharacterFull, type JikanCharacterAnime, type JikanCharacterVoice } from '@/services/animeApi';
import styles from './CharacterDetails.module.css';

type CharacterFullData = JikanCharacterFull & {
    anime: JikanCharacterAnime[];
    manga: JikanCharacterAnime[];
    voices: JikanCharacterVoice[];
};

export default function CharacterDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [character, setCharacter] = useState<CharacterFullData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        getCharacterFull(Number(id)).then(data => {
            setCharacter(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <Loader2 size={48} className="spin" />
                </div>
            </Layout>
        );
    }

    if (!character) {
        return (
            <Layout>
                <div className={styles.container}>
                    <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowLeft size={20} />}>
                        RETOUR
                    </Button>
                    <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>
                        Personnage introuvable.
                    </div>
                </div>
            </Layout>
        );
    }

    const jpVoice = character.voices?.find(v => v.language === 'Japanese');

    return (
        <Layout>
            <div className={styles.container}>
                {/* Back Button */}
                <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowLeft size={20} />} className={styles.backButton}>
                    RETOUR
                </Button>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.imageWrapper}>
                        <img
                            src={character.images?.jpg?.image_url || character.images?.webp?.image_url}
                            alt={character.name}
                            className={styles.image}
                        />
                    </div>
                    <div className={styles.infoSection}>
                        <h1 className={styles.name}>{character.name}</h1>
                        {character.name_kanji && (
                            <p className={styles.nameKanji}>{character.name_kanji}</p>
                        )}
                        <div className={styles.metaContainer}>
                            <div className={styles.metaItem}>
                                <Heart size={16} fill="#e11d48" color="#e11d48" />
                                <span>{character.favorites?.toLocaleString() || 0} favoris</span>
                            </div>
                            {character.nicknames && character.nicknames.length > 0 && (
                                <div className={styles.metaItem}>
                                    <User size={16} />
                                    <span>{character.nicknames[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Wiki-Style About Section */}
                {character.about && (() => {
                    // Parse the about text to extract key-value pairs
                    const parseAbout = (text: string) => {
                        const lines = text.split('\n').filter(line => line.trim());
                        const data: { key: string; value: string }[] = [];
                        let description = '';
                        let source = '';

                        // Extended key patterns for anime/manga characters
                        const keyPatterns = [
                            // Basic info
                            'Age', 'Birthday', 'Birthdate', 'Date of Birth', 'Date of birth', 'Birthplace', 'Birth place',
                            'Height', 'Weight', 'Blood Type', 'Blood type', 'Gender', 'Sex',
                            // Appearance
                            'Hair', 'Hair Color', 'Hair color', 'Eye', 'Eyes', 'Eye Color', 'Eye color',
                            // Identity
                            'Occupation', 'Affiliation', 'Affiliations', 'Status', 'Race', 'Species', 'Nationality',
                            'Planet of Origin', 'Horoscope', 'Zodiac', 'Sign',
                            // Rank & Position
                            'Rank', 'Position', 'Title', 'Class', 'Grade', 'Level',
                            // Naruto specific
                            'Ninja Registration', 'Ninja Registration No', 'Registration', 'Kekkei Genkai',
                            // Family & Relations
                            'Family', 'Parents', 'Relatives', 'Known relatives', 'Siblings', 'Married to', 'Spouse',
                            'Clan', 'Team', 'Squad', 'Group', 'Organization',
                            // Powers & Abilities
                            'Abilities', 'Skills', 'Powers', 'Quirk', 'Nen', 'Nen Type', 'Nen type',
                            'Magic', 'Magic Type', 'Djinn', 'Devil Fruit', 'Cursed Technique', 'Breathing Style',
                            'Weapon', 'Weapons', 'Fighting Style', 'Zanpakuto', 'Bankai', 'Kagune', 'Titan',
                            'Talents', 'Talent', 'Special Skill',
                            // Preferences
                            'Likes', 'Dislikes', 'Hates', 'Hobby', 'Hobbies', 'Favorite food', 'Favourite food',
                            // Enemies & Allies
                            'Enemies', 'Rivals', 'Allies', 'Partner', 'Master', 'Student', 'Mentor',
                            // Media
                            'Voice Actor', 'Seiyuu', 'CV', 'Voiced by',
                            'First Appearance', 'Debut', 'Manga Debut', 'Anime Debut',
                            // Other
                            'Alias', 'Aliases', 'Nickname', 'Nicknames', 'Also known as', 'Known as',
                            'Japanese', 'Romaji', 'Kanji'
                        ];

                        for (const line of lines) {
                            let matched = false;

                            // Check for Source line
                            if (line.toLowerCase().startsWith('source:') || line.toLowerCase().startsWith('(source:')) {
                                source = line.replace(/^\(?source:?\s*/i, '').replace(/\)$/, '').trim();
                                matched = true;
                            } else {
                                for (const key of keyPatterns) {
                                    const regex = new RegExp(`^${key}s?[:\\s]+(.+)`, 'i');
                                    const match = line.match(regex);
                                    if (match) {
                                        data.push({ key: key, value: match[1].trim() });
                                        matched = true;
                                        break;
                                    }
                                }
                            }
                            if (!matched && line.trim().length > 0) {
                                description += (description ? '\n\n' : '') + line.trim();
                            }
                        }
                        return { data, description, source };
                    };

                    const { data, description, source } = parseAbout(character.about);

                    return (
                        <div className={styles.aboutSection}>
                            <h2 className={styles.sectionTitle}>
                                <User size={20} /> FICHE D'IDENTITÉ
                            </h2>

                            {/* Info tags */}
                            {data.length > 0 && (
                                <div className={styles.infoTags}>
                                    {data.map((item, idx) => (
                                        <div key={idx} className={styles.infoTag}>
                                            <span className={styles.infoTagLabel}>{item.key}</span>
                                            <span className={styles.infoTagValue}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Full description */}
                            {description && (
                                <div className={styles.biographySection}>
                                    <h3 className={styles.biographyTitle}>BIOGRAPHIE</h3>
                                    <p className={styles.biographyText}>{description}</p>
                                </div>
                            )}

                            {/* Source */}
                            {source && (
                                <div className={styles.sourceTag}>
                                    Source: {source}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Japanese Voice Actor */}
                {jpVoice && (
                    <div className={styles.voiceActorSection}>
                        <h2 className={styles.sectionTitle}>
                            <Mic size={20} /> SEIYUU (DOUBLAGE JP)
                        </h2>
                        <div
                            className={styles.voiceActorCard}
                            onClick={() => navigate(`/person/${jpVoice.person.mal_id}`)}
                        >
                            <img
                                src={jpVoice.person.images?.jpg?.image_url}
                                alt={jpVoice.person.name}
                                className={styles.voiceActorImage}
                            />
                            <div className={styles.voiceActorInfo}>
                                <div className={styles.voiceActorName}>{jpVoice.person.name}</div>
                                <div className={styles.voiceActorLang}>{jpVoice.language}</div>
                            </div>
                            <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
                        </div>
                    </div>
                )}

                {/* Anime Appearances */}
                {character.anime && character.anime.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h2 className={styles.sectionTitle}>APPARITIONS ANIME</h2>
                        <div className={styles.grid}>
                            {character.anime.slice(0, 12).map((a) => (
                                <div
                                    key={a.anime.mal_id}
                                    className={styles.card}
                                    onClick={() => navigate(`/work/${a.anime.mal_id}?type=anime`)}
                                >
                                    <img
                                        src={a.anime.images?.jpg?.image_url}
                                        alt={a.anime.title}
                                        className={styles.cardImage}
                                    />
                                    <div className={styles.cardTitle}>{a.anime.title}</div>
                                    <div className={styles.cardRole}>{a.role}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Manga Appearances */}
                {character.manga && character.manga.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h2 className={styles.sectionTitle}>APPARITIONS MANGA</h2>
                        <div className={styles.grid}>
                            {character.manga.slice(0, 12).filter((m: any) => m.manga?.images?.jpg?.image_url).map((m: any) => (
                                <div
                                    key={m.manga?.mal_id || Math.random()}
                                    className={styles.card}
                                    onClick={() => navigate(`/work/${m.manga?.mal_id}?type=manga`)}
                                >
                                    <img
                                        src={m.manga?.images?.jpg?.image_url}
                                        alt={m.manga?.title || 'Manga'}
                                        className={styles.cardImage}
                                    />
                                    <div className={styles.cardTitle}>{m.manga?.title || 'Unknown'}</div>
                                    <div className={styles.cardRole}>{m.role}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
