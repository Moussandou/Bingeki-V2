import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function Opening() {
    const navigate = useNavigate();
    const [stage, setStage] = useState(0); // 0: Init, 1: Flash/Title, 2: CTA

    useEffect(() => {
        const timer1 = setTimeout(() => setStage(1), 500);
        const timer2 = setTimeout(() => setStage(2), 2000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: '#050505',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Decorative slash line */}
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                transition={{ duration: 0.4, times: [0, 0.5, 1] }}
                style={{
                    position: 'absolute',
                    height: '2px',
                    width: '150%',
                    background: '#fff',
                    transform: 'rotate(-15deg)',
                    zIndex: 10
                }}
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: stage >= 1 ? 1 : 0 }}
                transition={{ duration: 1 }}
                style={{ textAlign: 'center', position: 'relative', zIndex: 20 }}
            >
                <motion.h1
                    initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }} // Hidden top-down
                    animate={{ clipPath: stage >= 1 ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-gradient"
                    style={{
                        fontSize: 'min(15vw, 8rem)',
                        lineHeight: 1,
                        letterSpacing: '-0.05em',
                        marginBottom: '1rem',
                        filter: 'drop-shadow(0 0 20px rgba(255, 46, 99, 0.3))'
                    }}
                >
                    BINGEKI
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 20 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{
                        fontSize: '1.2rem',
                        color: 'var(--color-text-dim)',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase'
                    }}
                >
                    Expérience Interactive
                </motion.p>
            </motion.div>

            {stage >= 2 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ marginTop: '4rem', zIndex: 20 }}
                >
                    <Button
                        onClick={() => navigate('/auth')}
                        size="lg"
                        className="animate-pulse"
                        variant="ghost"
                        style={{
                            border: '1px solid var(--color-primary)',
                            borderRadius: '50px',
                            padding: '1rem 3rem'
                        }}
                    >
                        COMMENCER
                    </Button>
                </motion.div>
            )}

            {/* Background ambient particles (simulated with CSS circles for now) */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, 50, 0],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 2
                        }}
                        style={{
                            position: 'absolute',
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                            filter: 'blur(80px)'
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
