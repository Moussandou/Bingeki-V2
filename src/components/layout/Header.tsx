import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Menu, User, Book, Home, ChevronDown, Flame, Search, Trophy, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { auth } from '@/firebase/config';
import styles from './Header.module.css';

export function Header() {
    const { user } = useAuthStore();
    const { level, xp, streak } = useGamificationStore();
    const location = useLocation();
    const navigate = useNavigate(); // Initialize hook
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Top Header */}
            <header className={styles.header}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>

                    {/* Left: Logo */}
                    <Link to="/" className={`${styles.logo} text-gradient`}>
                        {/* Using the new logo image */}
                        <img src="/logo.png" alt="Bingeki Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                            <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', letterSpacing: '-1px' }}>BINGEKI</span>
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
                            <Link to="/discover" className={`${styles.navLink} ${isActive('/discover') ? styles.activeLink : ''}`}>
                                <Search size={18} />
                                <span>Découvrir</span>
                            </Link>
                            <Link to="/social" className={`${styles.navLink} ${isActive('/social') ? styles.activeLink : ''}`}>
                                <Trophy size={18} />
                                <span>Social</span>
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

                                {/* Profile Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className={styles.profileDropdown}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '4px', border: '2px solid #000', background: '#fff' }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', overflow: 'hidden', border: '2px solid #000' }}>
                                            <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <span className="hidden-mobile" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#000' }}>{user.displayName || 'Héros'}</span>
                                        <ChevronDown size={16} className="hidden-mobile" style={{ opacity: 0.7, color: '#000', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
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
                                                <User size={18} /> Mon Profil
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() => setIsDropdownOpen(false)}
                                                style={{ padding: '0.75rem', fontWeight: 700, color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid transparent' }}
                                                className={styles.dropdownItem}
                                            >
                                                <Settings size={18} /> Paramètres
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
                                                <LogOut size={18} /> Déconnexion
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                    <Link to="/discover">
                        <Button variant={isActive('/discover') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                            <Search size={22} />
                        </Button>
                    </Link>
                    <Link to="/social">
                        <Button variant={isActive('/social') ? 'primary' : 'ghost'} size="icon" style={{ borderRadius: '12px' }}>
                            <Trophy size={22} />
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
