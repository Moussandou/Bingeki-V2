import { Shield, Save, Database, Server } from 'lucide-react';

export default function AdminSystem() {
    return (
        <div>
            <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                textTransform: 'uppercase',
                marginBottom: '2rem'
            }}>
                Système & Logs
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Controls */}
                <div style={{
                    background: '#fff',
                    border: '4px solid #000',
                    padding: '2rem'
                }}>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>CONFIGURATION</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                            Mode Maintenance
                            <input type="checkbox" style={{ transform: 'scale(1.5)' }} />
                        </label>
                        <div style={{ height: '1px', background: '#eee' }} />
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                            Inscriptions Ouvertes
                            <input type="checkbox" defaultChecked style={{ transform: 'scale(1.5)' }} />
                        </label>
                        <div style={{ height: '1px', background: '#eee' }} />
                        <button style={{
                            padding: '1rem',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            marginTop: '1rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}>
                            <Save size={18} />
                            Sauvegarder Config
                        </button>
                    </div>
                </div>

                {/* Database Metrics */}
                <div style={{
                    background: '#fff',
                    border: '4px solid #000',
                    padding: '2rem'
                }}>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>DATABASE HELATH</h3>
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Database size={24} />
                            <div>
                                <div style={{ fontWeight: 900 }}>Firestore Usage</div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>2.4 MB / 1 GB (Free Tier)</div>
                            </div>
                        </div>
                        <div style={{ height: '10px', background: '#eee', border: '1px solid #000' }}>
                            <div style={{ width: '2%', height: '100%', background: '#10b981' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <Server size={24} />
                            <div>
                                <div style={{ fontWeight: 900 }}>Backup Status</div>
                                <div style={{ fontSize: '0.9rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={12} /> Protected (v3.0 Data Shield)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Terminal */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>System Logs</h3>
                <div style={{
                    background: '#1a1a1a',
                    color: '#00ff00',
                    padding: '1.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    height: '300px',
                    overflowY: 'auto',
                    border: '4px solid #000',
                    boxShadow: '8px 8px 0 #000'
                }}>
                    <div>[14:05:22] SYSTEM: Data Shield initialized.</div>
                    <div>[14:05:23] AUTH: User moussandou.m@gmail.com authenticated as ADMIN.</div>
                    <div>[14:10:01] CRON: Backup routine started...</div>
                    <div style={{ opacity: 0.5 }}>[14:10:02] DB: Syncing gamification tables... OK</div>
                    <div>[14:10:05] CRON: Backup routine completed (230ms).</div>
                </div>
            </div>
        </div>
    );
}
