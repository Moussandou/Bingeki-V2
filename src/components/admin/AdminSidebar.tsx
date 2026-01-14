import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, ShieldAlert, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/firebase/config';

export function AdminSidebar() {
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            logout();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navItems = [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
        { to: "/admin/users", icon: Users, label: "Utilisateurs" },
        { to: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
        { to: "/admin/system", icon: ShieldAlert, label: "Système" },
    ];

    return (
        <aside style={{
            width: '280px',
            background: '#000',
            color: '#fff',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '4px solid #fff',
            zIndex: 100
        }}>
            {/* Header */}
            <div style={{
                padding: '2rem',
                borderBottom: '4px solid #fff'
            }}>
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    lineHeight: 1
                }}>
                    Bingeki<br />
                    <span style={{ color: '#ef4444' }}>Admin</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '2rem 0' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem 2rem',
                                    color: isActive ? '#000' : '#fff',
                                    background: isActive ? '#fff' : 'transparent',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--font-heading)',
                                    textTransform: 'uppercase',
                                    fontSize: '1rem',
                                    fontWeight: 900,
                                    letterSpacing: '1px',
                                    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                })}
                            >
                                <item.icon size={20} strokeWidth={3} />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer Actions */}
            <div style={{
                padding: '1rem',
                borderTop: '4px solid #fff',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                <NavLink to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    border: '2px solid transparent',
                    transition: 'border-color 0.2s'
                }}>
                    <Home size={18} />
                    Retour au site
                </NavLink>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={18} strokeWidth={3} />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
