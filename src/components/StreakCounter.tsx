import { Flame } from 'lucide-react';

interface StreakCounterProps {
    count: number;
}

export function StreakCounter({ count }: StreakCounterProps) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '2px solid #000',
                background: '#fff',
                boxShadow: '3px 3px 0 #000'
            }}
        >
            <div style={{ position: 'relative' }}>
                <Flame size={22} color="#ff6b35" fill="#ff6b35" />
            </div>
            <span style={{
                fontSize: '1.1rem',
                fontWeight: 900,
                color: '#000',
                fontFamily: 'var(--font-heading)'
            }}>
                {count}
            </span>
        </div>
    );
}
