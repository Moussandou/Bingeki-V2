import { Shield, PenTool, LogOut, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type UserProfile } from '@/firebase/firestore';
import { BADGE_ICONS } from '@/utils/badges';

interface HunterLicenseCardProps {
    user: Partial<UserProfile> & { uid: string, photoURL?: string | null, displayName?: string | null };
    stats: {
        level: number;
        xp: number;
        xpToNextLevel: number;
        streak: number;
        badgeCount: number;
    };
    isOwnProfile?: boolean;
    onEdit?: () => void;
    onLogout?: () => void;
    featuredBadgeData?: { icon: string, rarity: string, name: string } | null; // Pass full badge data if needed
    favoriteMangaData?: { title: string, image: string } | null;
}

export function HunterLicenseCard({ user, stats, isOwnProfile, onEdit, onLogout, featuredBadgeData, favoriteMangaData }: HunterLicenseCardProps) {
    const borderColor = user.borderColor || '#000';
    const accentColor = user.themeColor || 'var(--color-primary)';
    const bgColor = user.cardBgColor || '#fff';
    const textColor = bgColor === '#000000' || bgColor === '#000' ? '#fff' : '#000'; // Simple contrast check

    return (
        <div className="manga-panel" style={{ padding: '0', overflow: 'hidden', background: bgColor, color: textColor, position: 'relative', border: `3px solid ${borderColor} ` }}>
            {/* Banner */}
            <div style={{
                height: '120px',
                background: user.banner ? `url(${user.banner}) center / cover` : accentColor,
                borderBottom: `2px solid ${borderColor} `,
                position: 'relative'
            }}>
                {!user.banner && <div className="manga-halftone" style={{ opacity: 0.2 }}></div>}
            </div>

            {/* Header Strip */}
            <div style={{ background: borderColor, color: '#fff', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <span style={{ fontWeight: 900, letterSpacing: '2px' }}>HUNTER LICENSE</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>

                    <Shield size={16} />
                </div>
            </div>

            <div style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
                {/* Avatar with Level Badge */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem', marginTop: '-5rem' }}>
                    <div style={{ width: '140px', height: '140px', borderRadius: '4px', border: `3px solid ${borderColor} `, overflow: 'hidden', background: '#333', boxShadow: '4px 4px 0 rgba(0,0,0,0.2)' }}>
                        <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div >
                    <div className="manga-title" style={{ position: 'absolute', bottom: -10, right: -10, fontSize: '1.5rem', transform: 'rotate(-5deg)', color: '#fff', background: accentColor, border: `2px solid ${borderColor}` }}>
                        LVL {stats.level}
                    </div>
                </div >

                {/* Name & ID */}
                < h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.2rem', color: textColor }}> {user.displayName || 'Chasseur'}</h2 >
                <p style={{ fontFamily: 'monospace', fontSize: '1rem', opacity: 0.7, marginBottom: '1rem' }}>ID: {user.uid.slice(0, 8).toUpperCase()}</p>

                {/* Bio */}
                {
                    user.bio && (
                        <p style={{ fontStyle: 'italic', marginBottom: '2rem', maxWidth: '300px', margin: '0 auto 2rem', borderLeft: `2px solid ${accentColor}`, paddingLeft: '1rem' }}>
                            "{user.bio}"
                        </p>
                    )
                }

                {/* Featured Section (Flexible Grid) */}
                {
                    (favoriteMangaData || featuredBadgeData) && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            {favoriteMangaData && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${borderColor}`, padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                                    <img src={favoriteMangaData.image} alt="Fav" style={{ width: '30px', height: '40px', objectFit: 'cover' }} />
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase' }}>FAVORI</div>
                                        <div style={{ fontWeight: 900, fontSize: '0.8rem', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{favoriteMangaData.title}</div>
                                    </div>
                                </div>
                            )}
                            {featuredBadgeData && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${borderColor}`, padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                                    <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: featuredBadgeData.rarity === 'legendary' ? '#ffd700' : textColor }}>
                                        {/* Clone element to force size if needed, or just render */}
                                        {BADGE_ICONS[featuredBadgeData.icon] || <Star size={20} />}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase' }}>BADGE</div>
                                        <div style={{ fontWeight: 900, fontSize: '0.8rem' }}>{featuredBadgeData.name}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* XP Bar */}
                <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
                        <span>EXPÉRIENCE</span>
                        <span>{stats.xp} / {stats.xpToNextLevel}</span>
                    </div>
                    <div style={{ height: '12px', background: '#eee', border: `2px solid ${borderColor}` }}>
                        <div style={{ height: '100%', width: `${Math.min((stats.xp / stats.xpToNextLevel) * 100, 100)}%`, background: accentColor }} />
                    </div>
                </div>

                {/* Grid Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ border: `2px solid ${borderColor}`, padding: '0.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.streak}</div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Jours Streak</div>
                    </div>
                    <div style={{ border: `2px solid ${borderColor}`, padding: '0.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.badgeCount}</div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Badges</div>
                    </div>
                </div>

                {
                    isOwnProfile && onLogout && (
                        <Button variant="outline" style={{ width: '100%', borderRadius: 0, fontWeight: 900, borderColor: borderColor, color: textColor === '#fff' ? borderColor : undefined }} icon={<LogOut size={16} />} onClick={onLogout}>DECONNEXION</Button>
                    )
                }
            </div >
        </div >
    );
}
