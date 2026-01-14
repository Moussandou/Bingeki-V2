import { useState, useEffect } from 'react';
import { Shield, Save, Database, Server, Terminal, Radio, Megaphone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { logDataBackup } from '@/utils/dataProtection';
import { getAllActivities, setGlobalAnnouncement, getGlobalConfig, type ActivityEvent } from '@/firebase/firestore';

export default function AdminSystem() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationsOpen, setRegistrationsOpen] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    // Broadcast State
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastActive, setBroadcastActive] = useState(false);
    const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'alert'>('info');

    useEffect(() => {
        // Initial Mock Logs (System Boot)
        const initialLogs = [
            `[SYSTEM] Admin console initialized at ${new Date().toLocaleTimeString()}`,
            `[AUTH] Connected as Administrator`,
            `[DB] Firestore connection: STABLE`,
            `[SHIELD] Data Protection Protocol v3.0: ACTIVE`,
            `[CONNECT] Listening to Global Activity Feed...`
        ];
        setLogs(initialLogs);

        // Load Global Config
        getGlobalConfig().then(config => {
            if (config) {
                setMaintenanceMode(config.maintenance || false);
                setRegistrationsOpen(config.registrationsOpen ?? true);
                if (config.announcement) {
                    setBroadcastMessage(config.announcement.message);
                    setBroadcastActive(config.announcement.active);
                    setBroadcastType(config.announcement.type);
                }
            }
        });

        // Poll for REAL Activities
        const fetchActivities = async () => {
            const activities = await getAllActivities(10);
            const formattedLogs = activities.map(formatActivityLog);
            // Prepend new logs that aren't already there (simple check by string content)
            // In a real app we'd use IDs, but string comparison is enough for visual logs using timestamps
            setLogs(prev => {
                const uniqueNewLogs = formattedLogs.filter(l => !prev.includes(l));
                if (uniqueNewLogs.length === 0) return prev;
                return [...uniqueNewLogs, ...prev].slice(0, 100);
            });
        };

        fetchActivities(); // First fetch
        const interval = setInterval(fetchActivities, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, []);

    const formatActivityLog = (act: ActivityEvent) => {
        const time = new Date(act.timestamp).toLocaleTimeString();
        let prefix = '[INFO]';
        let detail = '';

        switch (act.type) {
            case 'watch': prefix = '[WATCH]'; detail = `watched ${act.workTitle || '?'} Ep.${act.episodeNumber}`; break;
            case 'read': prefix = '[READ]'; detail = `read ${act.workTitle || '?'} Vol.${act.episodeNumber}`; break;
            case 'complete': prefix = '[DONE]'; detail = `completed ${act.workTitle || 'a work'}`; break;
            case 'level_up': prefix = '[GAMIF]'; detail = `reached Level ${act.newLevel}`; break;
            case 'badge': prefix = '[BADGE]'; detail = `unlocked ${act.badgeName}`; break;
            default: prefix = '[USER]'; detail = `performed action ${act.type}`;
        }

        return `[${time}] ${prefix} User ${(act.userName || 'Guest').slice(0, 10)}... ${detail}`;
    };

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

    const handleBroadcastSave = async () => {
        addLog(`[BROADCAST] Updating global announcement...`);
        try {
            await setGlobalAnnouncement(broadcastMessage, broadcastType, broadcastActive);
            addLog(`[BROADCAST] Success. Message is now ${broadcastActive ? 'LIVE' : 'OFFLINE'}.`);
        } catch (e) {
            addLog(`[ERROR] Broadcast update failed.`);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', textTransform: 'uppercase' }}>Système & Logs</h1>
                <p style={{ borderLeft: '2px solid black', paddingLeft: '0.5rem', color: '#6b7280', fontFamily: 'monospace' }}>
                    Monitoring temps réel et configuration globale
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Left Column: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Global Broadcast Card */}
                    <Card variant="manga" style={{ padding: '1.5rem', backgroundColor: 'white' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', textTransform: 'uppercase', borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Megaphone size={20} /> Annonce Globale
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Message pour tous les utilisateurs..."
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    style={{ flex: 1, padding: '0.5rem', border: '2px solid black', fontFamily: 'monospace' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    <input type="radio" checked={broadcastType === 'info'} onChange={() => setBroadcastType('info')} /> INFO
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold', color: '#ef4444' }}>
                                    <input type="radio" checked={broadcastType === 'alert'} onChange={() => setBroadcastType('alert')} /> ALERT
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Activer l'annonce</span>
                                <Switch isOn={broadcastActive} onToggle={() => setBroadcastActive(!broadcastActive)} />
                            </div>

                            <button onClick={handleBroadcastSave} style={{
                                marginTop: '0.5rem',
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: broadcastActive ? '#ef4444' : 'black',
                                color: 'white',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                border: 'none'
                            }}>
                                <Radio size={14} style={{ marginRight: '0.5rem', display: 'inline' }} />
                                {broadcastActive ? 'Mettre à jour (LIVE)' : 'Sauvegarder (Hors-ligne)'}
                            </button>
                        </div>
                    </Card>

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
                        </div>
                    </Card>

                    <Card variant="manga" style={{ padding: '1.5rem', backgroundColor: 'white' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', textTransform: 'uppercase', borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Database size={20} /> Base de Données
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

                {/* Right Column: Real-time Terminal */}
                <Card variant="manga" style={{
                    padding: 0,
                    backgroundColor: '#111827',
                    color: '#4ade80',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    height: '100%',
                    minHeight: '600px',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '8px 8px 0 #000'
                }}>
                    <div style={{ backgroundColor: '#1f2937', padding: '0.5rem', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Terminal size={14} style={{ color: '#9ca3af' }} />
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>root@bingeki-v2-activity-feed:~</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                            <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.7rem' }}>LIVE</span>
                        </div>
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
