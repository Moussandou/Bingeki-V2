import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, User, Github } from 'lucide-react';
import { loginWithGoogle } from '@/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    const toggleMode = () => setIsLogin(!isLogin);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate email auth for now (implement later if needed)
        setTimeout(() => setLoading(false), 2000);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
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
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)',
            padding: '1rem'
        }}>
            <div className="container" style={{ maxWidth: '1000px', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 400px)', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>

                {/* Visual Side - Hidden on small screens */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden-mobile"
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    <h1 className="text-gradient" style={{ fontSize: '4rem', lineHeight: 1 }}>
                        VOTRE<br />AVENTURE<br />COMMENCE
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-dim)', maxWidth: '400px' }}>
                        Rejoignez Bingeki pour transformer votre passion manga en une véritable quête RPG.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <div className="animate-float" style={{ padding: '1rem', background: 'rgba(255,46,99,0.1)', borderRadius: '8px', border: '1px solid var(--color-primary)' }}>
                            <h3 style={{ color: 'var(--color-primary)' }}>Suivi RPG</h3>
                        </div>
                        <div className="animate-float" style={{ animationDelay: '1s', padding: '1rem', background: 'rgba(8,217,214,0.1)', borderRadius: '8px', border: '1px solid var(--color-secondary)' }}>
                            <h3 style={{ color: 'var(--color-secondary)' }}>Progression</h3>
                        </div>
                    </div>
                </motion.div>

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <Card variant="glass" style={{ padding: '3rem 2rem' }}>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                {isLogin ? 'Bon retour' : 'Créer un compte'}
                            </h2>
                            <p style={{ color: 'var(--color-text-dim)' }}>
                                {isLogin ? 'Reprenez votre progression' : 'Commencez votre légende'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!isLogin && (
                                <div className="input-group">
                                    <Input placeholder="Pseudo" icon={<User size={18} />} />
                                </div>
                            )}

                            <div className="input-group">
                                <Input type="email" placeholder="Email" icon={<Mail size={18} />} />
                            </div>

                            <div className="input-group">
                                <Input type="password" placeholder="Mot de passe" icon={<Lock size={18} />} />
                            </div>

                            <Button type="submit" isLoading={loading} size="lg" style={{ marginTop: '1rem' }}>
                                {isLogin ? 'SE CONNECTER' : "S'INSCRIRE"}
                            </Button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                                <span style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>OU</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                            </div>

                            <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={loading}>
                                <Github size={18} /> Continuer avec Google
                            </Button>
                        </form>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button
                                onClick={toggleMode}
                                style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', textDecoration: 'underline' }}
                            >
                                {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
                            </button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
