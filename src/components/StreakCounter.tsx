import { Flame } from 'lucide-react';

interface StreakCounterProps {
    count: number;
}

export function StreakCounter({ count }: StreakCounterProps) {
    return (
        <div
            className="glass-panel"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                border: '1px solid rgba(255, 159, 67, 0.3)'
            }}
        >
            <div style={{ position: 'relative' }}>
                <Flame size={20} color="#ff9f43" fill="#ff9f43" className="animate-pulse" />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#ff9f43',
                    filter: 'blur(10px)',
                    opacity: 0.5,
                    zIndex: -1
                }} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ff9f43' }}>
                {count}
            </span>
        </div>
    );
}
