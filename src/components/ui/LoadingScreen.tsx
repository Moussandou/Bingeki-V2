import { motion } from 'framer-motion';

export function LoadingScreen() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            background: '#050505'
        }}>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"]
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                    repeatDelay: 0.5
                }}
                style={{
                    width: '60px',
                    height: '60px',
                    background: 'var(--gradient-primary)',
                    boxShadow: '0 0 20px var(--color-primary-glow)'
                }}
            />
        </div>
    );
}
