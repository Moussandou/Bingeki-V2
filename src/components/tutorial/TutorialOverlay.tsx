import { useTutorialStore } from '@/store/tutorialStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Zap, User, Compass, Book, Languages } from 'lucide-react'; // Added Languages icon

// Steps definition with keys instead of hardcoded text
const STEPS = [
    {
        titleKey: "tutorial.welcome_title",
        descKey: "tutorial.welcome_desc",
        target: null, // Centered
        icon: <Zap size={64} className="text-secondary" />
    },
    {
        titleKey: "tutorial.profile_title",
        descKey: "tutorial.profile_desc",
        target: "profile-section",
        icon: <User size={64} style={{ color: 'var(--color-primary)' }} />
    },
    {
        titleKey: "tutorial.discover_title",
        descKey: "tutorial.discover_desc",
        target: "discover-nav",
        icon: <Compass size={64} style={{ color: 'var(--color-secondary)' }} />
    },
    {
        titleKey: "tutorial.library_title",
        descKey: "tutorial.library_desc",
        target: "library-nav",
        icon: <Book size={64} style={{ color: 'var(--color-accent)' }} />
    }
];

export function TutorialOverlay() {
    const { isActive, currentStep, nextStep, prevStep, endTutorial } = useTutorialStore();
    const { t, i18n } = useTranslation();

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

    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

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
                    {/* Language Switcher */}
                    <button
                        onClick={toggleLanguage}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: '20px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            color: 'var(--color-text)',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 'bold',
                            opacity: 0.7,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                    >
                        <Languages size={14} />
                        {i18n.language === 'fr' ? 'EN' : 'FR'}
                    </button>

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
                        {t(step.titleKey)}
                    </h2>
                    <p style={{ marginBottom: '2.5rem', lineHeight: 1.6, opacity: 0.8, fontSize: '1rem' }}>
                        {t(step.descKey)}
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
