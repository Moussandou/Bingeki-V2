import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/context/ToastContext';
import { submitFeedback } from '@/firebase/firestore';
import { Star, Send, Bug, Lightbulb, MessageSquare, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Feedback() {
    const { user } = useAuthStore();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('general');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(''); // For guests
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            addToast('Veuillez sélectionner une note', 'error');
            return;
        }
        if (!message.trim()) {
            addToast('Veuillez écrire un message', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const success = await submitFeedback({
                rating,
                category,
                message,
                userId: user?.uid,
                userName: user?.displayName || 'Guest',
                contactEmail: user?.email || email,
                userAgent: navigator.userAgent
            });

            if (success) {
                setIsSuccess(true);
                addToast('Merci pour votre retour !', 'success');
                // Reset form
                setRating(0);
                setMessage('');
                if (!user) setEmail('');

                // Redirect after delay
                setTimeout(() => navigate('/'), 3000);
            } else {
                addToast('Erreur lors de l\'envoi. Réessayez.', 'error');
            }
        } catch (error) {
            console.error('Feedback error:', error);
            addToast('Erreur inattendue.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Layout>
                <div className="container" style={{
                    maxWidth: '600px',
                    textAlign: 'center',
                    paddingTop: '4rem',
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '1rem',
                        animation: 'bounce 1s infinite'
                    }}>
                        💌
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '1rem' }}>MERCI !</h1>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                        Votre avis a bien été reçu. C'est grâce à vous que Bingeki s'améliore !
                    </p>
                    <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '800px', paddingTop: '2rem', paddingBottom: '4rem' }}>
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2.5rem',
                    marginBottom: '0.5rem',
                    textAlign: 'center'
                }}>
                    AIDEZ-NOUS À PROGRESSER
                </h1>
                <p style={{ textAlign: 'center', marginBottom: '3rem', opacity: 0.7, maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                    Bug trouvé ? Idée de génie ? Ou juste envie de dire bonjour ?<br />
                    Votre avis compte énormément pour l'évolution de la plateforme.
                </p>

                <div style={{
                    background: '#fff',
                    border: '3px solid #000',
                    boxShadow: '10px 10px 0 #000',
                    padding: '2rem',
                    position: 'relative'
                }}>
                    {/* Corner accents */}
                    <div style={{ position: 'absolute', top: -6, left: -6, width: 12, height: 12, background: '#000' }} />
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, background: '#000' }} />
                    <div style={{ position: 'absolute', bottom: -6, left: -6, width: 12, height: 12, background: '#000' }} />
                    <div style={{ position: 'absolute', bottom: -6, right: -6, width: 12, height: 12, background: '#000' }} />

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Rating */}
                        <div style={{ textAlign: 'center' }}>
                            <label style={{ display: 'block', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase' }}>
                                Votre Note Global
                            </label>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            transition: 'transform 0.2s',
                                            opacity: rating >= star ? 1 : 0.3
                                        }}
                                    >
                                        <Star fill={rating >= star ? '#000' : 'none'} color="#000" size={32} />
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '1.2rem' }}>
                                {rating > 0 ? `${rating}/10` : '-'}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase' }}>
                                C'est à propos de quoi ?
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setCategory('bug')}
                                    style={{
                                        padding: '1rem',
                                        border: '2px solid #000',
                                        background: category === 'bug' ? '#ef4444' : '#fff',
                                        color: category === 'bug' ? '#fff' : '#000',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Bug size={24} />
                                    UN BUG
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategory('feature')}
                                    style={{
                                        padding: '1rem',
                                        border: '2px solid #000',
                                        background: category === 'feature' ? '#3b82f6' : '#fff',
                                        color: category === 'feature' ? '#fff' : '#000',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Lightbulb size={24} />
                                    UNE IDÉE
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategory('general')}
                                    style={{
                                        padding: '1rem',
                                        border: '2px solid #000',
                                        background: category === 'general' ? '#10b981' : '#fff',
                                        color: category === 'general' ? '#fff' : '#000',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <MessageSquare size={24} />
                                    GÉNÉRAL
                                </button>
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Votre Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Racontez-nous tout..."
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    padding: '1rem',
                                    border: '2px solid #000',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    background: '#f9f9f9'
                                }}
                            />
                        </div>

                        {/* Guest Contact Info */}
                        {!user && (
                            <div>
                                <label style={{ display: 'block', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    Email (Optionnel)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Pour vous recontacter si besoin..."
                                        style={{
                                            width: '100%',
                                            padding: '1rem 1rem 1rem 3rem',
                                            border: '2px solid #000',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            style={{ alignSelf: 'center', minWidth: '200px' }}
                            disabled={isSubmitting}
                            icon={<Send size={20} />}
                        >
                            {isSubmitting ? 'ENVOI...' : 'ENVOYER MON AVIS'}
                        </Button>

                    </form>
                </div>
            </div>
        </Layout>
    );
}
