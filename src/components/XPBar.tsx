import { motion } from 'framer-motion';

interface XPBarProps {
    current: number;
    max: number;
    level: number;
}

export function XPBar({ current, max, level }: XPBarProps) {
    const percent = Math.min((current / max) * 100, 100);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>NIV {level}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{current} / {max} XP</span>
            </div>

            <div style={{
                height: '6px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    style={{
                        height: '100%',
                        background: 'var(--gradient-primary)',
                        borderRadius: '3px',
                        position: 'relative',
                        zIndex: 2
                    }}
                />
                {/* Glow effect */}
                <motion.div
                    animate={{ x: [-100, 200] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '50%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        zIndex: 3
                    }}
                />
            </div>
        </div>
    );
}
