import { NavLink } from '@/components/routing/LocalizedLink';
import { LayoutDashboard, Users, MessageSquare, ShieldAlert, LogOut, Home, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/firebase/config';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const { logout } = useAuthStore();
    const [isHovered, setIsHovered] = useState(false);
    const { t } = useTranslation();

    // Combined state for expansion (either hovered on desktop or open on mobile)
    const isExpanded = isHovered || isOpen;

    const handleLogout = async () => {
        try {
            await auth.signOut();
            logout();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navItems = [
        { to: "/admin", icon: LayoutDashboard, label: t('admin.sidebar.dashboard'), end: true },
        { to: "/admin/users", icon: Users, label: t('admin.sidebar.users') },
        { to: "/admin/feedback", icon: MessageSquare, label: t('admin.sidebar.feedback') },
        { to: "/admin/system", icon: ShieldAlert, label: t('admin.sidebar.system') },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className={styles.backdrop}
                    onClick={onClose}
                />
            )}

            <aside
                className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''} ${isOpen ? styles.mobileOpen : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Header */}
                <div className={`${styles.header} ${isExpanded ? styles.headerExpanded : ''}`}>
                    <div className={styles.logoText}>
                        <span style={{
                            background: '#ef4444',
                            padding: '0.25rem 0.5rem',
                            display: isExpanded ? 'block' : 'none'
                        }}>ADMIN</span>
                        <span style={{ display: isExpanded ? 'block' : 'none' }}>PANEL</span>
                        <span style={{ display: !isExpanded ? 'block' : 'none', color: '#ef4444' }}>A</span>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            display: isOpen ? 'block' : 'none',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            position: 'absolute',
                            right: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            title={!isExpanded ? item.label : ''}
                            className={({ isActive }) => `
                                ${styles.navLink} 
                                ${isExpanded ? styles.navLinkExpanded : ''} 
                                ${isActive ? styles.navLinkActive : ''} 
                                ${isActive && isExpanded ? styles.navLinkActiveExpanded : ''}
                            `}
                            onClick={() => {
                                if (window.innerWidth <= 768) onClose();
                            }}
                        >
                            <item.icon size={24} strokeWidth={2.5} />
                            <span className={`${styles.labelText} ${isExpanded ? styles.labelTextVisible : ''}`}>
                                {item.label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className={styles.footer}>
                    <NavLink to="/" className={`${styles.footerLink} ${isExpanded ? styles.footerLinkExpanded : ''}`}>
                        <Home size={20} />
                        <span style={{ display: isExpanded ? 'block' : 'none' }}>{t('admin.sidebar.back_to_site')}</span>
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        className={`${styles.logoutButton} ${isExpanded ? styles.logoutButtonExpanded : ''}`}
                    >
                        <LogOut size={20} />
                        <span style={{ display: isExpanded ? 'block' : 'none' }}>{t('admin.sidebar.exit')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
