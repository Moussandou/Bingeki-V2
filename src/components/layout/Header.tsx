import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Menu, User } from 'lucide-react';

export function Header() {
    return (
        <header className="glass-panel" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50, padding: '1rem 0' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em' }} className="text-gradient">
                    BINGEKI
                </Link>

                <nav style={{ display: 'none', gap: '2rem', alignItems: 'center' }}>
                    {/* Desktop Nav - Hidden for now until we have media queries */}
                    <Link to="/dashboard" className="hover-scale">Tableau de bord</Link>
                    <Link to="/library" className="hover-scale">Bibliothèque</Link>
                </nav>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="ghost" size="icon">
                        <User size={20} />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Menu size={20} />
                    </Button>
                </div>
            </div>
        </header>
    );
}
