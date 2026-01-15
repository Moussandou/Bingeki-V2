import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface XPBarProps {
    current: number;
    max: number;
    level: number;
}

export function XPBar({ current, max, level }: XPBarProps) {
    const { t } = useTranslation();
    const percent = Math.min((current / max) * 100, 100);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: '#000',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase'
                }}>
                    {t('components.xp_bar.level')} {level}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#000', fontWeight: 700 }}>{current} / {max} XP</span>
            </div>

            <div style={{
                height: '10px',
                background: '#eee',
                border: '2px solid #000',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    style={{
                        height: '100%',
                        background: 'var(--color-primary)',
                        position: 'relative',
                        zIndex: 2
                    }}
                />
            </div>
        </div>
    );
}
