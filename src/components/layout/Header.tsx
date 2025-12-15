import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Menu, User, Grid, Book, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Header() {
    const { user } = useAuthStore();
    const location = useLocation();

    // Helper to check active state
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="glass-panel" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50, padding: '0.75rem 0' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em' }} className="text-gradient">
                    BINGEKI
                </Link>

                {/* Main Navigation - Visible if logged in */}
                {user && (
                    <nav style={{ display: 'flex', gap: '0.5rem', position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(20,20,30,0.9)', padding: '0.5rem 1.5rem', borderRadius: '50px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
                        <Link to="/dashboard">
                            <Button variant={isActive('/dashboard') ? 'primary' : 'ghost'} size="icon">
                                <Home size={20} />
                            </Button>
                        </Link>
                        <Link to="/library">
                            <Button variant={isActive('/library') ? 'primary' : 'ghost'} size="icon">
                                <Book size={20} />
                            </Button>
                        </Link>
                        <Link to="/profile">
                            <Button variant={isActive('/profile') ? 'primary' : 'ghost'} size="icon">
                                <User size={20} />
                            </Button>
                        </Link>
                    </nav>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {user ? (
                        <Link to="/profile">
                            <Button variant="ghost" size="icon" className="hidden-mobile">
                                <User size={20} />
                            </Button>
                        </Link>
                    ) : (
                        <Link to="/auth">
                            <Button size="sm">Connexion</Button>
                        </Link>
                    )}
                    <Button variant="ghost" size="icon">
                        <Menu size={20} />
                    </Button>
                </div>
            </div>
        </header>
    );
}
