import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Menu, User, Book, Home, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import styles from './Header.module.css';

export function Header() {
    const { user } = useAuthStore();
    const location = useLocation();

    // Helper to check active state
    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Top Header (Global) */}
            <header className={styles.header}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Logo Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <Link to="/" className={`${styles.logo} text-gradient`}>
                            BINGEKI
                        </Link>

                        {/* Desktop Navigation Links (Inline) */}
                        {user && (
                            <nav className={styles.desktopNav}>
                                <Link to="/dashboard" className="hover-scale" style={{ color: isActive('/dashboard') ? 'var(--color-primary)' : 'var(--color-text-dim)', fontWeight: 500 }}>
                                    Q.G.
                                </Link>
                                <Link to="/library" className="hover-scale" style={{ color: isActive('/library') ? 'var(--color-primary)' : 'var(--color-text-dim)', fontWeight: 500 }}>
                                    Bibliothèque
                                </Link>
                            </nav>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {user ? (
                            <>
                                <Link to="/profile" className="hidden-mobile">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 12px', background: 'var(--color-surface)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Bingeki'}`} alt="Avatar" />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.displayName || 'Héros'}</span>
                                    </div>
                                </Link>
                                <Button variant="ghost" size="icon">
                                    <Menu size={20} />
                                </Button>
                            </>
                        ) : (
                            <Link to="/auth">
                                <Button size="sm">Connexion</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Dock (Floating) */}
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
