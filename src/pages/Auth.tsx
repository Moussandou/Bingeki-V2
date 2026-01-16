import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '@/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEO } from '@/components/layout/SEO';

export default function Auth() {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');

    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { user, error: loginError } = await loginWithEmail(email, password);
                if (loginError) {
                    setError(loginError);
                } else if (user) {
                    setUser(user);
                    navigate('/dashboard');
                }
            } else {
                if (!displayName.trim()) {
                    setError(t('auth.error_pseudo'));
                    setLoading(false);
                    return;
                }
                const { user, error: registerError } = await registerWithEmail(email, password, displayName);
                if (registerError) {
                    setError(registerError);
                } else if (user) {
                    setUser(user);
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(t('auth.error_generic'));
        }

        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const user = await loginWithGoogle();
        if (user) {
            setUser(user);
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '1rem',
            overflow: 'hidden'
        }}>
            <SEO title={isLogin ? t('auth.login_title') : t('auth.register_title')} />
            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    zIndex: 20,
                    background: '#fff',
                    border: '3px solid #000',
                    padding: '0.5rem',
                    boxShadow: '4px 4px 0 #000',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 900
                }}
            >
                <ArrowLeft size={24} />
                <span className="hidden-mobile">{t('auth.back')}</span>
            </button>

            <div className="manga-bg-container">
                <div className="manga-halftone"></div>
                <div className="manga-speedlines"></div>
            </div>
            <div className="container mobile-stack" style={{ maxWidth: '1000px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>

                {/* Visual Side */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden-mobile"
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <img src="/logo.png" alt="Bingeki Logo" style={{ width: 100, height: 100, objectFit: 'contain' }} />
                        <span style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#000' }}>BINGEKI</span>
                    </Link>

                    <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#000', textTransform: 'uppercase' }} dangerouslySetInnerHTML={{ __html: t('auth.hero_title') }} />
                    <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '400px', lineHeight: 1.6 }}>
                        {t('auth.hero_subtitle')}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ padding: '0.75rem 1.5rem', background: '#fff', border: '3px solid #000', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', boxShadow: '4px 4px 0 var(--color-primary)' }}>
                            {t('auth.feature_rpg')}
                        </div>
                        <div style={{ padding: '0.75rem 1.5rem', background: '#fff', border: '3px solid #000', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', boxShadow: '4px 4px 0 var(--color-secondary)' }}>
                            {t('auth.feature_progression')}
                        </div>
                    </div>
                </motion.div>

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Mobile Only Header */}
                    <div className="mobileOnly" style={{ display: 'none', textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <img src="/logo.png" alt="Bingeki" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                            <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900 }}>BINGEKI</span>
                        </div>
                        <h1 style={{ fontSize: '2rem', lineHeight: 1.1, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            {t('auth.mobile_title')}
                        </h1>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, maxWidth: '280px', margin: '0 auto' }}>
                            {t('auth.mobile_subtitle')}
                        </p>
                    </div>

                    <div className="manga-panel" style={{ padding: '2.5rem', background: '#fff', boxShadow: '8px 8px 0 rgba(0,0,0,0.1)' }}>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#000', marginBottom: '0.5rem' }}>
                                {isLogin ? t('auth.welcome_back') : t('auth.create_account')}
                            </h2>
                            <p style={{ color: '#666' }}>
                                {isLogin ? t('auth.resume_progress') : t('auth.start_legend')}
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                background: '#fee2e2',
                                border: '2px solid #ef4444',
                                color: '#b91c1c',
                                padding: '0.75rem 1rem',
                                marginBottom: '1rem',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {!isLogin && (
                                <div>
                                    <Input
                                        placeholder={t('auth.placeholder_pseudo')}
                                        icon={<User size={18} />}
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <Input
                                    type="email"
                                    placeholder={t('auth.placeholder_email')}
                                    icon={<Mail size={18} />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    type="password"
                                    placeholder={t('auth.placeholder_password')}
                                    icon={<Lock size={18} />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" variant="manga" isLoading={loading} style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1rem' }}>
                                {isLogin ? t('auth.login_btn') : t('auth.register_btn')}
                            </Button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                                <div style={{ flex: 1, height: '2px', background: '#000' }} />
                                <span style={{ color: '#000', fontWeight: 700, fontSize: '0.875rem' }}>{t('auth.or')}</span>
                                <div style={{ flex: 1, height: '2px', background: '#000' }} />
                            </div>

                            <Button
                                type="button"
                                variant="manga"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    width: '100%'
                                }}
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 18, height: 18 }} />
                                {t('auth.google_login')}
                            </Button>
                        </form>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button
                                onClick={toggleMode}
                                style={{
                                    color: '#000',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    textDecoration: 'underline',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {isLogin ? t('auth.no_account') : t('auth.has_account')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

