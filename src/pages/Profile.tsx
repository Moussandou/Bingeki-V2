
import { Layout } from '@/components/layout/Layout';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal'; // Assuming Modal exists, verified in previous steps

import { useGamificationStore } from '@/store/gamificationStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/firebase/auth';
import {
    Settings, Award, BookOpen, CheckCircle, Library, Trophy, Flame, Info,
    PenTool,
    X, Upload
} from 'lucide-react';
import { HunterLicenseCard } from '@/components/HunterLicenseCard';
import { getUserProfile, saveUserProfileToFirestore, compareLibraries, type UserProfile } from '@/firebase/firestore';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getBadgeIcon, getBadgeColors } from '@/utils/badges';
import type { Badge } from '@/types/badge';
import { storage } from '@/firebase/config';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/context/ToastContext';

export default function Profile() {
    const { user, setUser } = useAuthStore();
    // Default (local) stats
    const { level, xp, xpToNextLevel, streak, badges, totalChaptersRead, totalWorksAdded, totalWorksCompleted } = useGamificationStore();
    const { works } = useLibraryStore();
    const { addToast } = useToast();

    // Router
    const navigate = useNavigate();
    const { uid } = useParams<{ uid: string }>(); // Get uid from URL if present

    // Local UI State
    const [showGuide, setShowGuide] = useState(false);
    const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Extended Profile State (for current or visited user)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [extendedProfile, setExtendedProfile] = useState<Partial<UserProfile>>({});

    // Visited Profile Stats (if viewing someone else)
    const [visitedStats, setVisitedStats] = useState<any>(null);

    // Library comparison (for visited profiles)
    const [commonWorks, setCommonWorks] = useState<{ common: any[]; count: number } | null>(null);

    // Determine if we are viewing our own profile
    const isOwnProfile = !uid || (user && user.uid === uid);

    // Load Profile Data logic
    useEffect(() => {
        const targetUid = uid || user?.uid;
        if (!targetUid) return;

        setLoadingProfile(true);

        // Load User Profile (Banner, Bio, XP, Level, etc.) - main document has all data
        getUserProfile(targetUid).then(profile => {
            if (profile) {
                setExtendedProfile(profile);
                // For visited profiles, set stats from the profile data
                if (!isOwnProfile) {
                    setVisitedStats({
                        level: profile.level || 1,
                        xp: profile.xp || 0,
                        xpToNextLevel: 100,
                        streak: profile.streak || 0,
                        badges: profile.badges || [],
                        totalChaptersRead: profile.totalChaptersRead || 0,
                        totalWorksAdded: profile.totalWorksAdded || 0,
                        totalWorksCompleted: profile.totalWorksCompleted || 0
                    });
                }
            }
            setLoadingProfile(false);
        });

        // If own profile, sync form with loaded profile
        if (isOwnProfile && user?.uid) {
            getUserProfile(user.uid).then(p => {
                if (p) {
                    setExtendedProfile(p);
                    setEditForm({
                        banner: p.banner || '',
                        bio: p.bio || '',
                        themeColor: p.themeColor || '#000000',
                        cardBgColor: p.cardBgColor || '#ffffff',
                        borderColor: p.borderColor || '#000000',
                        favoriteManga: p.favoriteManga || '',
                        top3Favorites: p.top3Favorites || [],
                        featuredBadge: p.featuredBadge || ''
                    });
                }
            });
        }

        // Load common works if visiting another profile
        if (!isOwnProfile && user?.uid && uid) {
            compareLibraries(user.uid, uid).then(common => {
                setCommonWorks(common);
            });
        }

    }, [uid, user?.uid, isOwnProfile]);

    // Redirect guest if no UID provided (visiting /profile directly)
    useEffect(() => {
        // If checking own profile but no user is logged in, redirect
        if (!uid && !user) {
            navigate('/auth');
        }
    }, [uid, user, navigate]);

    // Computed Stats to display
    const displayStats = isOwnProfile ? {
        level, xp, xpToNextLevel, streak, badgeCount: badges.length
    } : (visitedStats ? {
        level: visitedStats.level || 1,
        xp: visitedStats.xp || 0,
        xpToNextLevel: visitedStats.xpToNextLevel || 100,
        streak: visitedStats.streak || 0,
        badgeCount: visitedStats.badges?.length || 0
    } : {
        level: 1, xp: 0, xpToNextLevel: 100, streak: 0, badgeCount: 0
    });

    const displayBadges = isOwnProfile ? badges : (visitedStats?.badges || []);

    // Extended stats for display
    const displayTotalChapters = isOwnProfile ? totalChaptersRead : (visitedStats?.totalChaptersRead || 0);
    const displayTotalWorks = isOwnProfile ? totalWorksAdded : (visitedStats?.totalWorksAdded || 0);
    const displayWorksCompleted = isOwnProfile ? totalWorksCompleted : (visitedStats?.totalWorksCompleted || 0);


    // Edit Form State
    const [isDragging, setIsDragging] = useState(false);
    const [editForm, setEditForm] = useState({
        banner: '',
        bio: '',
        themeColor: '#000000',
        cardBgColor: '#ffffff',
        borderColor: '#000000',
        favoriteManga: '',
        top3Favorites: [] as string[],
        featuredBadge: ''
    });

    // --- Drag & Drop Handlers ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let file: File | null = null;
        if ('files' in e.target && e.target.files) file = e.target.files[0];
        else if ('dataTransfer' in e && e.dataTransfer.files) file = e.dataTransfer.files[0];

        if (file && (file.type.startsWith('image/') || file.type === 'image/gif')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, banner: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    // ---------------------------

    // ---------------------------

    const handleSaveProfile = async () => {
        if (!user) return;

        let bannerUrl = editForm.banner;

        // If banner is a Data URL (new upload), upload to Storage
        if (bannerUrl && bannerUrl.startsWith('data:')) {
            try {
                const storageRef = ref(storage, `banners/${user.uid}_${Date.now()}`);
                await uploadString(storageRef, bannerUrl, 'data_url');
                bannerUrl = await getDownloadURL(storageRef);
            } catch (error) {
                console.error("Error uploading banner:", error);
                addToast('Erreur lors de l\'upload de la bannière', 'error');
                return; // Stop if upload fails is better?
            }
        }

        try {
            await saveUserProfileToFirestore({
                uid: user.uid,
                ...editForm,
                banner: bannerUrl
            });
            setExtendedProfile({ ...extendedProfile, ...editForm, banner: bannerUrl });
            addToast('Profil mis à jour !', 'success');
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error saving profile:", error);
            addToast('Erreur lors de la sauvegarde du profil', 'error');
        }
    };

    const handleLogout = async () => {
        await logout();
        setUser(null);
        navigate('/');
    };

    if (loadingProfile && !user) return <div style={{ padding: '2rem' }}>Chargement du profil...</div>;

    return (
        <Layout>
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 className="text-outline" style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', color: '#000', textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
                            Fiche de Chasseur
                        </h1>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {isOwnProfile && (
                                <>
                                    <Button variant="primary" onClick={() => setIsEditModalOpen(true)} icon={<PenTool size={20} />}>EDITER</Button>
                                    <Button variant="ghost" onClick={() => setShowGuide(true)} icon={<Info size={20} />}>GUIDE</Button>
                                    <Button variant="manga" size="icon" onClick={() => navigate('/settings')}><Settings size={20} /></Button>
                                </>
                            )}
                            {!isOwnProfile && (
                                <Button variant="ghost" onClick={() => navigate(-1)}>RETOUR</Button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {/* ID Card / Hunter License Style */}
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <HunterLicenseCard
                                user={{
                                    uid: uid || user?.uid || '',
                                    displayName: extendedProfile.displayName || (isOwnProfile ? user?.displayName : 'Héros'),
                                    photoURL: extendedProfile.photoURL || (isOwnProfile ? user?.photoURL : ''),
                                    ...extendedProfile
                                }}

                                isOwnProfile={!!isOwnProfile}
                                onLogout={handleLogout}
                                featuredBadgeData={extendedProfile.featuredBadge ? displayBadges.find((b: Badge) => b.id === extendedProfile.featuredBadge) : null}
                                favoriteMangaData={extendedProfile.favoriteManga ? (() => {
                                    if (!isOwnProfile) return null;
                                    const w = works.find(w => w.id === Number(extendedProfile.favoriteManga) || w.title === extendedProfile.favoriteManga);
                                    return w ? { title: w.title, image: w.image } : null;
                                })() : null}
                                top3FavoritesData={extendedProfile.top3Favorites ? extendedProfile.top3Favorites.map(fid => {
                                    const w = works.find(w => w.id === Number(fid) || w.title === fid);
                                    return w ? { id: String(w.id), title: w.title, image: w.image } : null;
                                }).filter(Boolean) as any[] : []}
                                stats={{
                                    ...displayStats,
                                    totalChaptersRead: displayTotalChapters,
                                    totalWorksAdded: displayTotalWorks,
                                    totalWorksCompleted: displayWorksCompleted
                                }}
                            />
                        </motion.div>

                        {/* Content & Stats */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                                {/* Chapitres lus */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#000', color: '#fff' }}>
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{displayTotalChapters}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>Chapitres lus</p>
                                    </div>
                                </div>

                                {/* En cours */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--color-primary)', color: '#fff' }}>
                                        <Flame size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{isOwnProfile ? works.filter(w => w.status === 'reading').length : '-'}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>En cours</p>
                                    </div>
                                </div>

                                {/* Terminées */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#22c55e', color: '#fff' }}>
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{displayWorksCompleted}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>Terminées</p>
                                    </div>
                                </div>

                                {/* Collection */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#000', color: '#fff' }}>
                                        <Library size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{displayTotalWorks}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>Collection</p>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#fbbf24', color: '#000' }}>
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{displayStats.badgeCount} / 16</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>Badges</p>
                                    </div>
                                </div>

                                {/* XP Total */}
                                <div className="manga-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', color: '#000' }}>
                                    <div style={{ padding: '0.75rem', background: '#8b5cf6', color: '#fff' }}>
                                        <Trophy size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{displayStats.xp}</div>
                                        <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>XP Total</p>
                                    </div>
                                </div>
                            </div>

                            {/* Common Works Section (only for visited profiles) */}
                            {!isOwnProfile && commonWorks && commonWorks.count > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 className="manga-title" style={{ fontSize: '1.2rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #dbeafe, #ede9fe)', color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Library size={20} /> {commonWorks.count} œuvre{commonWorks.count > 1 ? 's' : ''} en commun
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {commonWorks.common.slice(0, 8).map(work => (
                                            <div
                                                key={work.id}
                                                onClick={() => navigate(`/work/${work.id}?type=${work.type || 'manga'}`)}
                                                style={{
                                                    width: 80,
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <div style={{
                                                    width: 80,
                                                    height: 110,
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    border: '2px solid #000',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    <img
                                                        src={work.image || `https://via.placeholder.com/80x110?text=${work.type}`}
                                                        alt={work.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <p style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    textAlign: 'center',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>{work.title}</p>
                                            </div>
                                        ))}
                                        {commonWorks.count > 8 && (
                                            <div style={{
                                                width: 80,
                                                height: 110,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#f0f0f0',
                                                borderRadius: '4px',
                                                border: '2px dashed #ccc',
                                                fontWeight: 700,
                                                fontSize: '0.9rem'
                                            }}>
                                                +{commonWorks.count - 8}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <h3 className="manga-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', background: 'var(--color-secondary)', color: '#000' }}>Badges Récents</h3>
                            <div className="manga-panel" style={{ padding: '2rem', background: '#fff', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '2rem' }}>
                                {displayBadges.map((badge: Badge) => (
                                    <motion.div
                                        key={badge.id}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        onHoverStart={() => setHoveredBadgeId(badge.id)}
                                        onHoverEnd={() => setHoveredBadgeId(null)}
                                        style={{ textAlign: 'center', position: 'relative' }}
                                    >
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            margin: '0 auto 0.5rem',
                                            background: getBadgeColors(badge.rarity).bg,
                                            color: getBadgeColors(badge.rarity).text,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `3px solid ${getBadgeColors(badge.rarity).border}`,
                                            boxShadow: badge.rarity === 'legendary' ? '0 0 20px rgba(255, 215, 0, 0.5)' : '4px 4px 0 rgba(0,0,0,0.2)'
                                        }}>
                                            {getBadgeIcon(badge.icon)}
                                        </div>
                                        <p style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: '#000' }}>{badge.name}</p>

                                        {/* Hover Tooltip */}
                                        <AnimatePresence>
                                            {hoveredBadgeId === badge.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '100%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        background: '#000',
                                                        color: '#fff',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.7rem',
                                                        width: '150px',
                                                        zIndex: 20,
                                                        marginBottom: '10px',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {badge.description}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '50%',
                                                        marginLeft: '-6px',
                                                        borderWidth: '6px',
                                                        borderStyle: 'solid',
                                                        borderColor: 'black transparent transparent transparent'
                                                    }} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}

                                {/* Placeholder empty badges */}
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        background: '#eee',
                                        borderRadius: '50%',
                                        border: '3px dashed #ccc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ccc',
                                        fontWeight: 900,
                                        fontSize: '1.5rem'
                                    }}>
                                        ?
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Edit Profile Modal */}
                    <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="EDITER LA LICENSE">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>

                            {/* BANNER UPLOAD */}
                            <div>
                                <label style={{ fontWeight: 900, display: 'block', marginBottom: '0.5rem' }}>BANNIÈRE / GIF</label>
                                {!editForm.banner ? (
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        style={{
                                            border: `2px dashed ${isDragging ? 'var(--color-primary)' : '#000'}`,
                                            background: isDragging ? 'rgba(0,0,0,0.05)' : '#fff',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onClick={() => document.getElementById('banner-upload')?.click()}
                                    >
                                        <input
                                            type="file"
                                            id="banner-upload"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <Upload size={24} style={{ opacity: 0.5 }} />
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Glisser ou cliquer (JPG, GIF...)</div>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', height: '100px', border: '2px solid #000', overflow: 'hidden' }}>
                                        <img src={editForm.banner} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => setEditForm(prev => ({ ...prev, banner: '' }))}
                                            style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <Input
                                    placeholder="Ou URL directe..."
                                    value={editForm.banner}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, banner: e.target.value }))}
                                    style={{ marginTop: '0.5rem' }}
                                />
                            </div>

                            {/* COLORS */}
                            <div>
                                <label style={{ fontWeight: 900, display: 'block', marginBottom: '0.5rem' }}>COULEURS</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>ACCENT</span>
                                        <input type="color" value={editForm.themeColor} onChange={(e) => setEditForm(prev => ({ ...prev, themeColor: e.target.value }))} style={{ width: '100%', height: '40px', border: '2px solid #000' }} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>FOND</span>
                                        <input type="color" value={editForm.cardBgColor} onChange={(e) => setEditForm(prev => ({ ...prev, cardBgColor: e.target.value }))} style={{ width: '100%', height: '40px', border: '2px solid #000' }} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>BORDURE</span>
                                        <input type="color" value={editForm.borderColor} onChange={(e) => setEditForm(prev => ({ ...prev, borderColor: e.target.value }))} style={{ width: '100%', height: '40px', border: '2px solid #000' }} />
                                    </div>
                                </div>
                            </div>

                            {/* SELECTORS */}
                            <div>
                                <label style={{ fontWeight: 900, display: 'block', marginBottom: '0.5rem' }}>TOP 3 FAVORIS</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {[0, 1, 2].map(index => (
                                        <select
                                            key={index}
                                            value={editForm.top3Favorites[index] || ''}
                                            onChange={(e) => {
                                                const newTop3 = [...editForm.top3Favorites];
                                                if (e.target.value === "") {
                                                    newTop3.splice(index, 1);
                                                } else {
                                                    newTop3[index] = e.target.value;
                                                }
                                                setEditForm(prev => ({ ...prev, top3Favorites: newTop3 }));
                                            }}
                                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #000', fontWeight: 'bold' }}
                                        >
                                            <option value="">Sélectionner un favori #{index + 1}</option>
                                            {works.sort((a, b) => a.title.localeCompare(b.title)).map(w => (
                                                <option key={w.id} value={w.id} disabled={editForm.top3Favorites.includes(String(w.id)) && editForm.top3Favorites[index] !== String(w.id)}>
                                                    {w.title}
                                                </option>
                                            ))}
                                        </select>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontWeight: 900, display: 'block', marginBottom: '0.5rem' }}>BADGE EN VEDETTE</label>
                                <select
                                    value={editForm.featuredBadge}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, featuredBadge: e.target.value }))}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #000', fontWeight: 'bold' }}
                                >
                                    <option value="">Aucun</option>
                                    {badges.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} ({b.rarity})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontWeight: 900, display: 'block', marginBottom: '0.5rem' }}>BIO / CITATION</label>
                                <textarea
                                    className="manga-input" // Assuming existence or using raw style
                                    placeholder="Une phrase qui vous définit..."
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #000',
                                        fontFamily: 'inherit',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <Button variant="primary" onClick={handleSaveProfile} style={{ marginTop: '1rem' }}>
                                ENREGISTRER
                            </Button>
                        </div>
                    </Modal>

                    {/* Guide Modal (unchanged) */}
                    <Modal isOpen={showGuide} onClose={() => setShowGuide(false)} title="Guide du Chasseur">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: '#000', color: '#fff', padding: '1rem', borderRadius: '4px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Trophy size={20} className="text-primary" />
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 900 }}>EXPERIENCE (XP)</h4>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                        Gagnez de l'XP à chaque action sur Bingeki :
                                    </p>
                                    <ul style={{ fontSize: '0.85rem', marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                                        <li>Lire un chapitre : <strong>+10 XP</strong></li>
                                        <li>Ajouter une œuvre : <strong>+15 XP</strong></li>
                                        <li>Terminer une œuvre : <strong>+50 XP</strong></li>
                                        <li>Connexion quotidienne : <strong>+5 XP</strong></li>
                                    </ul>
                                </div>
                                <div style={{ background: '#fff', color: '#000', border: '2px solid #000', padding: '1rem', borderRadius: '4px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Flame size={20} color="var(--color-primary)" />
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 900 }}>STREAK</h4>
                                    </div>
                                    <p style={{ fontSize: '0.9rem' }}>
                                        La flamme de votre passion ! 🔥
                                        Connectez-vous chaque jour pour augmenter votre Streak.
                                    </p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                        Attention : si vous ratez un jour, la flamme s'éteint et retombe à 0.
                                    </p>
                                </div>
                            </div>
                            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid var(--color-primary)' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem' }}>Gagner des Rangs</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    En accumulant de l'XP, vous montez de niveau et de rang (F -&gt; S).
                                    Débloquez des badges uniques pour montrer vos exploits sur votre profil !
                                </p>
                            </div>
                        </div>
                    </Modal>

                </div>
            </div>
        </Layout>
    );
}

