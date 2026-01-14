import { Users, MessageSquare, Activity } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => (
    <div style={{
        background: '#fff',
        border: '4px solid #000',
        padding: '2rem',
        boxShadow: '8px 8px 0 #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '200px',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                textTransform: 'uppercase',
                margin: 0,
                color: '#666'
            }}>{label}</h3>
            <div style={{
                background: color,
                padding: '0.75rem',
                border: '3px solid #000',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={24} color="#fff" strokeWidth={3} />
            </div>
        </div>

        <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '4rem',
            fontWeight: 900,
            lineHeight: 1
        }}>
            {value}
        </span>
    </div>
);

export default function AdminDashboard() {
    return (
        <div>
            <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '3rem',
                textTransform: 'uppercase',
                marginBottom: '1rem'
            }}>
                Dashboard
            </h1>
            <p style={{
                fontSize: '1.2rem',
                marginBottom: '3rem',
                borderLeft: '4px solid #ef4444',
                paddingLeft: '1rem'
            }}>
                Bienvenue dans le centre de commande, Admin.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '4rem'
            }}>
                <StatCard label="Opérateurs" value="126" icon={Users} color="#000" />
                <StatCard label="Retours" value="48" icon={MessageSquare} color="#3b82f6" />
                <StatCard label="Système" value="100%" icon={Activity} color="#10b981" />
            </div>

            <div style={{
                background: '#000',
                color: '#fff',
                padding: '2rem',
                border: '4px solid #000',
                boxShadow: '8px 8px 0 rgba(0,0,0,0.2)'
            }}>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    fontSize: '1.5rem',
                    borderBottom: '2px solid #fff',
                    paddingBottom: '1rem',
                    marginBottom: '1rem'
                }}>
                    Terminal Système
                </h2>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8 }}>
                    <p>{'>'} Initializing admin interface...</p>
                    <p>{'>'} Connection established with Firestore.</p>
                    <p>{'>'} User validation: OK.</p>
                    <p>{'>'} Waiting for command...</p>
                </div>
            </div>
        </div>
    );
}
