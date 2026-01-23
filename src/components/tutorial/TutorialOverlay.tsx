import { useTutorialStore } from '@/store/tutorialStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Zap, User, Compass, Book } from 'lucide-react';

// Steps definition with visuals
const STEPS = [
    {
        title: "Welcome to Hunter Society",
        desc: "Bingeki is your ultimate manga tracker. Let's take a quick tour.",
        target: null, // Centered
        icon: <Zap size={64} className="text-secondary" />
    },
    {
        title: "Your Profile & Nen",
        desc: "Here you can see your XP, Level, and your unique Nen chart based on your reading habits.",
        target: "profile-section",
        icon: <User size={64} style={{ color: 'var(--color-primary)' }} />
    },
    {
        title: "Discover & Search",
        desc: "Find new manga and anime to add to your collection easily.",
        target: "discover-nav",
        icon: <Compass size={64} style={{ color: 'var(--color-secondary)' }} />
    },
    {
        title: "Your Library",
        desc: "All your tracked works are here. Update them as you read.",
        target: "library-nav",
        icon: <Book size={64} style={{ color: 'var(--color-accent)' }} />
    }
];

export function TutorialOverlay() {
    const { isActive, currentStep, nextStep, prevStep, endTutorial } = useTutorialStore();
    const { t } = useTranslation();

    // Prevent body scroll when active
    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isActive]);

    if (!isActive) return null;

    const step = STEPS[currentStep];
    const isLast = currentStep === STEPS.length - 1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'auto'
                }}
            >
                <div style={{
                    maxWidth: '480px',
                    width: '90%',
                    background: 'var(--color-surface)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: '16px',
                    padding: '2.5rem',
                    boxShadow: '0 0 30px rgba(var(--color-primary-rgb), 0.3)',
                    position: 'relative',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {/* Visual */}
                    <motion.div
                        key={currentStep}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1.5rem',
                            background: 'rgba(var(--color-primary-rgb), 0.05)',
                            borderRadius: '50%',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        {step.icon}
                    </motion.div>

                    <h2 style={{
                        fontSize: '1.8rem',
                        fontFamily: 'var(--font-heading)',
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        lineHeight: 1.1
                    }}>
                        {step.title}
                    </h2>
                    <p style={{ marginBottom: '2.5rem', lineHeight: 1.6, opacity: 0.8, fontSize: '1rem' }}>
                        {step.desc}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Button variant="ghost" onClick={endTutorial} style={{ opacity: 0.6 }}>
                            {t('common.skip') || 'Skip'}
                        </Button>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {currentStep > 0 && (
                                <Button variant="outline" onClick={prevStep}>
                                    {t('common.prev') || 'Previous'}
                                </Button>
                            )}
                            <Button variant="manga" onClick={isLast ? endTutorial : nextStep} style={{ minWidth: '100px' }}>
                                {isLast ? (t('common.finish') || 'Finish') : (t('common.next') || 'Next')}
                            </Button>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: i === currentStep ? 24 : 8,
                                    height: 8,
                                    borderRadius: '4px',
                                    background: i === currentStep ? 'var(--color-primary)' : 'var(--color-border)',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
