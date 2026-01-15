import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
    User, Book, Home, ChevronDown, Flame, Search,
    LogOut,
    Calendar,
    History as HistoryIcon,
    Settings,
    MessageSquare
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { auth } from '@/firebase/config';
import styles from './Header.module.css';
import { useTranslation } from 'react-i18next';

export function Header() {
    const { user } = useAuthStore();
    const { level, xp, streak } = useGamificationStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // I18n setup
    const { t, i18n } = useTranslation();
    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Top Header */}
            <header className={styles.header}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

                    {/* Left: Logo */}
                    <Link to="/" className={`${styles.logo} text - gradient`}>
                        <img src="/logo.png" alt="Bingeki Logo" style={{ width: 50, height: 50, objectFit: 'contain' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                            <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', letterSpacing: '-1px' }}>BINGEKI</span>
                        </div>
                    </Link>

                    {/* Center: Navigation (Desktop) */}
                    {user && (
                        <nav className={styles.desktopNav} style={{ gap: '1rem' }}>
                            <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeLink : ''} `}>
                                <Home size={18} />
                                <span className="hidden-tablet">{t('header.dashboard')}</span>
                            </Link>
                            <Link to="/library" className={`${styles.navLink} ${isActive('/library') ? styles.activeLink : ''} `}>
                                <Book size={18} />
                                <span className="hidden-tablet">{t('header.library')}</span>
                            </Link>
                            <Link to="/discover" className={`${styles.navLink} ${isActive('/discover') ? styles.activeLink : ''} `}>
                                <Search size={18} />
                                <span className="hidden-tablet">{t('header.discover')}</span>
                            </Link>
                            <Link to="/social" className={`${styles.navLink} ${isActive('/social') ? styles.activeLink : ''} `}>
                                <MessageSquare size={18} />
                                <span className="hidden-tablet">{t('header.community')}</span>
                            </Link>
                            <Link to="/schedule" className={`${styles.navLink} ${isActive('/schedule') ? styles.activeLink : ''} `}>
                                <Calendar size={18} />
                                <span className="hidden-tablet">{t('header.agenda')}</span>
                            </Link>
                            <Link to="/changelog" className={`${styles.navLink} ${isActive('/changelog') ? styles.activeLink : ''} `} title={t('header.news')}>
                                <HistoryIcon size={18} />
                            </Link>
                        </nav>
                    )}

                    {/* Discover link - accessible to all */}
                    {!user && (
                        <nav className={styles.desktopNav} style={{ gap: '1rem' }}>
                            <Link to="/discover" className={`${styles.navLink} ${isActive('/discover') ? styles.activeLink : ''} `}>
                                <Search size={18} />
                                <span>{t('header.discover')}</span>
                            </Link>
                            <Link to="/schedule" className={`${styles.navLink} ${isActive('/schedule') ? styles.activeLink : ''} `}>
                                <Calendar size={18} />
                                <span className="hidden-tablet">{t('header.agenda')}</span>
                            </Link>
                            <Link to="/changelog" className={`${styles.navLink} ${isActive('/changelog') ? styles.activeLink : ''} `} title={t('header.news')}>
                                <HistoryIcon size={18} />
                                <span className="hidden-tablet">{t('header.changelog')}</span>
                            </Link>
                        </nav>
                    )}

                    {/* Right: Stats & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                        {/* Language Switcher */}
                        <button
                            onClick={toggleLanguage}
                            className={styles.iconButton}
                            style={{
                                fontFamily: 'monospace',
                                fontWeight: 900,
                                fontSize: '0.9rem',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                border: '2px solid black',
                                background: 'transparent',
                                marginRight: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '32px',
                                width: '32px'
                            }}
                            title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'}
                        >
                            {i18n.language === 'en' ? 'EN' : 'FR'}
                        </button>

                        {user ? (
                            <>
                                {/* Stats (Desktop only mainly) */}
                                <div className="desktopOnly" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                                    {/* Streak */}
                                    <div className={styles.streakContainer}>
                                        <Flame size={20} fill="currentColor" />
                                        <span>{streak}</span>
                                    </div>

                                    {/* Level Pill */}
                                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                                        <div className={styles.statusPill} style={{ cursor: 'pointer' }}>
                                            <span className={styles.levelValue}>Lvl {level}</span>
                                            <span style={{ opacity: 0.3 }}>|</span>
                                            <span>{xp} XP</span>
                                        </div>
                                    </Link>
                                </div>

                                {/* Profile Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className={styles.profileDropdown}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '4px', border: '2px solid #000', background: '#fff' }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', overflow: 'hidden', border: '2px solid #000' }}>
                                            <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div >
                                        <ChevronDown size={16} style={{ opacity: 0.7, color: '#000', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                    </button >

                                    {/* Dropdown Menu */}
                                    {
                                        isDropdownOpen && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '120%',
                                                right: 0,
                                                width: '200px',
                                                background: '#fff',
                                                border: '3px solid #000',
                                                boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                                                padding: '0.5rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem',
                                                zIndex: 100
                                            }}>
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    style={{ padding: '0.75rem', fontWeight: 700, color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid transparent' }}
                                                    className={styles.dropdownItem}
                                                >
                                                    <User size={18} /> {t('header.profile')}
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    style={{ padding: '0.75rem', fontWeight: 700, color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid transparent' }}
                                                    className={styles.dropdownItem}
                                                >
                                                    <Settings size={18} /> {t('header.settings')}
                                                </Link>
                                                <div style={{ height: '1px', background: '#eee', margin: '0.25rem 0' }}></div>
                                                <button
                                                    onClick={async () => {
                                                        await auth.signOut();
                                                        setIsDropdownOpen(false);
                                                        navigate('/'); // Redirect to home
                                                    }}
                                                    style={{ padding: '0.75rem', fontWeight: 700, color: 'red', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                                                    className={styles.dropdownItem}
                                                >
                                                    <LogOut size={18} /> {t('header.logout')}
                                                </button>
                                            </div>
                                        )
                                    }
                                </div >
                            </>
                        ) : (
                            <Link to="/auth">
                                <Button size="sm">{t('header.login')}</Button>
                            </Link>
                        )}
                    </div >
                </div >
            </header >

            {/* Mobile Bottom Dock */}
            {
                user && (
                    <nav className={styles.mobileNav}>
                        <Link to="/dashboard">
                            <Button variant={isActive('/dashboard') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <Home size={22} />
                            </Button>
                        </Link>
                        <Link to="/library">
                            <Button variant={isActive('/library') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <Book size={22} />
                            </Button>
                        </Link>
                        <Link to="/discover">
                            <Button variant={isActive('/discover') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <Search size={22} />
                            </Button>
                        </Link>
                        <Link to="/schedule">
                            <Button variant={isActive('/schedule') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <Calendar size={22} />
                            </Button>
                        </Link>
                        <Link to="/profile">
                            <Button variant={isActive('/profile') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <User size={22} />
                            </Button>
                        </Link>
                    </nav>
                )
            }

            {/* Mobile Bottom Dock for Guests - Only Discover */}
            {
                !user && (
                    <nav className={styles.mobileNav}>
                        <Link to="/">
                            <Button variant={isActive('/') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <Home size={22} />
                            </Button>
                        </Link>
                        <Link to="/discover">
                            <Button variant={isActive('/discover') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <Search size={22} />
                            </Button>
                        </Link>
                        <Link to="/schedule">
                            <Button variant={isActive('/schedule') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <Calendar size={22} />
                            </Button>
                        </Link>
                        <Link to="/changelog">
                            <Button variant={isActive('/changelog') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <HistoryIcon size={22} />
                            </Button>
                        </Link>
                        <Link to="/auth">
                            <Button variant={isActive('/auth') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                                <User size={22} />
                            </Button>
                        </Link>
                    </nav>
                )
            }
        </>
    );
}

