import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Menu, User, Book, Home, Zap, Command, Moon, ChevronDown, Flame, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './Header.module.css';

export function Header() {
    const { user } = useAuthStore();
    const { level, xp, streak } = useGamificationStore();
    const { theme, toggleTheme } = useSettingsStore();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const handleSearch = () => {
        // TODO: Open command palette
        navigate('/library');
    };

    return (
        <>
            {/* Top Header */}
            <header className={styles.header}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Left: Logo */}
                    <Link to="/" className={`${styles.logo} text-gradient`}>
                        {/* Using a box icon as in the reference image */}
                        <div style={{ width: 32, height: 32, background: 'var(--gradient-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                            <span>Bingeki</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.7, color: 'var(--color-text)' }}>Anime Tracker</span>
                        </div>
                    </Link>

                    {/* Center: Navigation (Desktop) */}
                    {user && (
                        <nav className={styles.desktopNav}>
                            <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}>
                                <Home size={18} />
                                <span>Q.G.</span>
                            </Link>
                            <Link to="/library" className={`${styles.navLink} ${isActive('/library') ? styles.activeLink : ''}`}>
                                <Book size={18} />
                                <span>Bibliothèque</span>
                            </Link>
                            <Link to="/profile" className={`${styles.navLink} ${isActive('/profile') ? styles.activeLink : ''}`}>
                                <User size={18} />
                                <span>Tableau de bord</span>
                            </Link>
                        </nav>
                    )}

                    {/* Right: Stats & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                        {user ? (
                            <>
                                {/* Stats (Desktop only mainly) */}
                                <div className="desktopOnly" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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

                                {/* Actions */}
                                <div className="desktopOnly" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button className={styles.actionButton} onClick={handleSearch} title="Rechercher (Cmd+K)">
                                        <Command size={18} />
                                        <span className={styles.kbd}>K</span>
                                    </button>
                                    <button className={styles.actionButton} onClick={toggleTheme} title="Changer le thème">
                                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                    </button>
                                </div>

                                {/* Profile Dropdown */}
                                <Link to="/profile" className={styles.profileDropdown}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', overflow: 'hidden', border: '2px solid #000' }}>
                                        <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <span className="hidden-mobile" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#000' }}>{user.displayName || 'Héros'}</span>
                                    <ChevronDown size={16} className="hidden-mobile" style={{ opacity: 0.7, color: '#000' }} />
                                </Link>
                            </>
                        ) : (
                            <Link to="/auth">
                                <Button size="sm">Connexion</Button>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle (if needed, but using dock) */}
                        <div className="mobileOnly" style={{ display: 'none' }}> {/* Keeping consistent with new design - using Dock */}
                            <Button variant="ghost" size="icon">
                                <Menu size={20} />
                            </Button>
                        </div>

                    </div>
                </div>
            </header>

            {/* Mobile Bottom Dock */}
            {user && (
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
                    <Link to="/profile">
                        <Button variant={isActive('/profile') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                            <User size={22} />
                        </Button>
                    </Link>
                </nav>
            )}
        </>
    );
}
