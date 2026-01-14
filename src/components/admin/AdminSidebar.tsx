import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, ShieldAlert, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/firebase/config';
import { useState } from 'react';

export function AdminSidebar() {
    const { logout } = useAuthStore();
    const [isExpanded, setIsExpanded] = useState(false);

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
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            style={{
                width: isExpanded ? '260px' : '80px',
                background: '#fff',
                color: '#000',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '3px solid #000',
                transition: 'width 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                zIndex: 100,
                boxShadow: isExpanded ? '10px 0 30px rgba(0,0,0,0.1)' : 'none',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div style={{
                padding: '1.5rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                paddingLeft: isExpanded ? '2rem' : '0',
                borderBottom: '3px solid #000',
                height: '80px',
                background: '#000',
                color: '#fff',
                whiteSpace: 'nowrap'
            }}>
                <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span style={{
                        background: '#ef4444',
                        padding: '0.25rem 0.5rem',
                        display: isExpanded ? 'block' : 'none'
                    }}>ADMIN</span>
                    <span style={{ display: isExpanded ? 'block' : 'none' }}>PANEL</span>
                    <span style={{ display: !isExpanded ? 'block' : 'none', color: '#ef4444' }}>A</span>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        title={!isExpanded ? item.label : ''}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            padding: '1rem 0',
                            paddingLeft: isExpanded ? '2rem' : '0',
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                            color: isActive ? '#fff' : '#000',
                            background: isActive ? '#000' : 'transparent',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-heading)',
                            textTransform: 'uppercase',
                            fontSize: '1rem',
                            fontWeight: 900,
                            letterSpacing: '1px',
                            transition: 'all 0.2s ease',
                            borderTop: isActive ? '2px solid #000' : '2px solid transparent',
                            borderBottom: isActive ? '2px solid #000' : '2px solid transparent',
                            margin: isActive && isExpanded ? '0 -2px' : '0',
                            position: 'relative'
                        })}
                    >
                        <item.icon size={24} strokeWidth={2.5} />
                        <span style={{
                            display: isExpanded ? 'block' : 'none',
                            whiteSpace: 'nowrap',
                            opacity: isExpanded ? 1 : 0,
                            transform: isExpanded ? 'translateX(0)' : 'translateX(10px)',
                            transition: 'all 0.3s ease'
                        }}>
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer Actions */}
            <div style={{
                padding: '1rem',
                borderTop: '3px solid #000',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                background: '#f5f5f5'
            }}>
                <NavLink to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    color: '#000',
                    textDecoration: 'none',
                    fontWeight: 700,
                    transition: 'color 0.2s',
                    fontFamily: 'monospace'
                }}>
                    <Home size={20} />
                    <span style={{ display: isExpanded ? 'block' : 'none' }}>Retour au site</span>
                </NavLink>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem',
                        justifyContent: isExpanded ? 'flex-start' : 'center',
                        background: '#ef4444',
                        color: '#fff',
                        border: '2px solid #000',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '4px 4px 0 #000',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'translate(2px, 2px)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'translate(0, 0)'}
                >
                    <LogOut size={20} />
                    <span style={{ display: isExpanded ? 'block' : 'none' }}>Exit</span>
                </button>
            </div>
        </aside>
    );
}
