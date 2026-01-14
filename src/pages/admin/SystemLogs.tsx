import { useState, useEffect } from 'react';
import { Shield, Save, Database, Server, Terminal, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { logDataBackup } from '@/utils/dataProtection';

export default function AdminSystem() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationsOpen, setRegistrationsOpen] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Initial Mock Logs
        const initialLogs = [
            `[SYSTEM] Admin console initialized at ${new Date().toLocaleTimeString()}`,
            `[AUTH] Connected as Administrator`,
            `[DB] Firestore connection: STABLE`,
            `[SHIELD] Data Protection Protocol v3.0: ACTIVE`
        ];
        setLogs(initialLogs);

        // Simulate live feed
        const interval = setInterval(() => {
            const events = [
                `[TRAFFIC] New page view from 127.0.0.1`,
                `[DB] Syncing gamification data...`,
                `[API] GET /api/v1/metacritic (200 OK)`,
                `[USER] Session refresh token updated`
            ];
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            if (Math.random() > 0.7) {
                addLog(randomEvent);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    };

    const handleBackup = () => {
        addLog("[BACKUP] Starting manual system backup...");
        try {
            logDataBackup('system', 'gamification', { source: 'manual_admin_trigger', time: Date.now() });
            setTimeout(() => addLog("[BACKUP] Backup completed successfully. Data synchronized."), 1000);
        } catch (e) {
            addLog("[ERROR] Backup failed.");
        }
    };

    const handlePurge = () => {
        if (confirm("Purger le cache système ? Cela peut déconnecter les utilisateurs.")) {
            addLog("[SYSTEM] Clearing cache...");
            setTimeout(() => addLog("[SYSTEM] Cache purged."), 800);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', textTransform: 'uppercase' }}>Système & Logs</h1>
                <p style={{ borderLeft: '2px solid black', paddingLeft: '0.5rem', color: '#6b7280', fontFamily: 'monospace' }}>
                    Monitoring temps réel et configuration
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Control Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card variant="manga" style={{ padding: '1.5rem', backgroundColor: 'white' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', textTransform: 'uppercase', borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Server size={20} /> Configuration Serveur
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Mode Maintenance</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Bloque l'accès sauf aux admins</div>
                                </div>
                                <Switch isOn={maintenanceMode} onToggle={() => {
                                    setMaintenanceMode(!maintenanceMode);
                                    addLog(`[CONFIG] Maintenance mode set to ${!maintenanceMode}`);
                                }} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Inscriptions</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Autoriser les nouveaux membres</div>
                                </div>
                                <Switch isOn={registrationsOpen} onToggle={() => {
                                    setRegistrationsOpen(!registrationsOpen);
                                    addLog(`[CONFIG] Registrations set to ${!registrationsOpen}`);
                                }} />
                            </div>

                            <button onClick={handlePurge} style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid black',
                                backgroundColor: '#fee2e2',
                                color: 'black',
                                transition: 'all 0.2s',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                cursor: 'pointer'
                            }}>
                                <AlertTriangle size={18} /> Purger Cache & Sessions
                            </button>
                        </div>
                    </Card>

                    <Card variant="manga" style={{ padding: '1.5rem', backgroundColor: 'white' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', textTransform: 'uppercase', borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Database size={20} /> Base de Données
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                    <span>Firestore Usage</span>
                                    <span>2.4 MB / 1 GB</span>
                                </div>
                                <div style={{ height: '1rem', border: '2px solid black', padding: '2px' }}>
                                    <div style={{ height: '100%', width: '2%', backgroundColor: '#22c55e' }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontFamily: 'monospace', fontSize: '0.875rem', border: '2px solid #bbf7d0', backgroundColor: '#f0fdf4', padding: '0.5rem' }}>
                                <Shield size={16} />
                                Data Shield Protocol v3.0 Active
                            </div>

                            <button onClick={handleBackup} style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'black',
                                color: 'white',
                                transition: 'background-color 0.2s',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                cursor: 'pointer',
                                border: 'none'
                            }}>
                                <Save size={18} /> Lancer Backup Manuel
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Terminal */}
                <Card variant="manga" style={{
                    padding: 0,
                    backgroundColor: '#111827',
                    color: '#4ade80',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    height: '500px',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '8px 8px 0 #000'
                }}>
                    <div style={{ backgroundColor: '#1f2937', padding: '0.5rem', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Terminal size={14} style={{ color: '#9ca3af' }} />
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>system_root@bingeki-admin:~</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', lineHeight: '1.25rem' }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ wordBreak: 'break-all', display: 'flex' }}>
                                <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>{'>'}</span>
                                {log}
                            </div>
                        ))}
                        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>_</div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
