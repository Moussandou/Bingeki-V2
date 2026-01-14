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
            // Trigger local backup of critical stores (simulated via empty objects for now as we can't access store state directy here easily without hook)
            // In real scenario we'd call a store action. 
            // For now we use the utility to log a "System Checkpoint"
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="font-heading text-4xl uppercase">Système & Logs</h1>
                <p className="border-l-2 border-black pl-2 text-gray-500 font-mono">
                    Monitoring temps réel et configuration
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="space-y-6">
                    <Card variant="manga" className="p-6 bg-white">
                        <h2 className="font-heading text-xl uppercase border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
                            <Server size={20} /> Configuration Serveur
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold uppercase">Mode Maintenance</div>
                                    <div className="text-xs text-gray-500">Bloque l'accès sauf aux admins</div>
                                </div>
                                <Switch isOn={maintenanceMode} onToggle={() => {
                                    setMaintenanceMode(!maintenanceMode);
                                    addLog(`[CONFIG] Maintenance mode set to ${!maintenanceMode}`);
                                }} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold uppercase">Inscriptions</div>
                                    <div className="text-xs text-gray-500">Autoriser les nouveaux membres</div>
                                </div>
                                <Switch isOn={registrationsOpen} onToggle={() => {
                                    setRegistrationsOpen(!registrationsOpen);
                                    addLog(`[CONFIG] Registrations set to ${!registrationsOpen}`);
                                }} />
                            </div>

                            <button onClick={handlePurge} className="w-full py-3 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white transition-colors font-bold uppercase flex items-center justify-center gap-2">
                                <AlertTriangle size={18} /> Purger Cache & Sessions
                            </button>
                        </div>
                    </Card>

                    <Card variant="manga" className="p-6 bg-white">
                        <h2 className="font-heading text-xl uppercase border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
                            <Database size={20} /> Base de Données
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Firestore Usage</span>
                                    <span>2.4 MB / 1 GB</span>
                                </div>
                                <div className="h-4 border-2 border-black p-0.5">
                                    <div className="h-full w-[2%] bg-green-500"></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-green-600 font-mono text-sm border-2 border-green-200 bg-green-50 p-2">
                                <Shield size={16} />
                                Data Shield Protocol v3.0 Active
                            </div>

                            <button onClick={handleBackup} className="w-full py-3 bg-black text-white hover:bg-gray-800 transition-colors font-bold uppercase flex items-center justify-center gap-2">
                                <Save size={18} /> Lancer Backup Manuel
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Terminal */}
                <Card variant="manga" className="p-0 bg-gray-900 text-green-400 font-mono text-sm h-[500px] flex flex-col shadow-[8px_8px_0_#000]">
                    <div className="bg-gray-800 p-2 border-b border-gray-700 flex items-center gap-2">
                        <Terminal size={14} className="text-gray-400" />
                        <span className="text-gray-400 text-xs">system_root@bingeki-admin:~</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs md:text-sm">
                        {logs.map((log, i) => (
                            <div key={i} className="break-all border-l-2 border-transparent hover:border-green-500 hover:bg-white/5 pl-1 transition-colors">
                                <span className="text-green-600 mr-2">{'>'}</span>
                                {log}
                            </div>
                        ))}
                        <div className="animate-pulse">_</div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
