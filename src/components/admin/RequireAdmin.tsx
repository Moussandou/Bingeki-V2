import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

export function RequireAdmin({ children }: { children: ReactNode }) {
    const { user, userProfile, loading } = useAuthStore();
    const location = useLocation();

    // While loading auth state, show nothing or a spinner
    if (loading) {
        return null;
    }

    // Hardcoded admin email for safety first approach
    const ADMIN_EMAILS = ['moussandou.m@gmail.com', 'bingeki.official@gmail.com'];
    const isAdmin = user && (ADMIN_EMAILS.includes(user.email || '') || userProfile?.isAdmin);

    if (!user || !isAdmin) {
        // Redirect to home page if not admin
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}
