
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ExternalLink, Clock, GitCommit, RefreshCw } from 'lucide-react';
import { getDeployments, type DeploymentEvent } from '@/firebase/firestore';

export default function DeploymentsList() {
    const [deployments, setDeployments] = useState<DeploymentEvent[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDeployments = async () => {
        setLoading(true);
        const data = await getDeployments(5);
        setDeployments(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDeployments();
    }, []);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Unknown';
        // Handle Firestore Timestamp or serialized date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const isExpired = (expiresAt: any) => {
        if (!expiresAt) return false;
        const date = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
        return date < new Date();
    };

    return (
        <Card variant="manga" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)' }}>
            <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                textTransform: 'uppercase',
                borderBottom: '2px solid var(--color-border)',
                paddingBottom: '0.5rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GitCommit size={20} /> PREVIEW VERSIONS
                </div>
                <button
                    onClick={fetchDeployments}
                    disabled={loading}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text)',
                        animation: loading ? 'spin 1s linear infinite' : 'none'
                    }}
                >
                    <RefreshCw size={18} />
                </button>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {deployments.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', border: '1px dashed var(--color-border)', borderRadius: '0.5rem' }}>
                        No preview deployments found.
                    </div>
                ) : (
                    deployments.map((deploy) => {
                        const expired = isExpired(deploy.expiresAt);
                        return (
                            <div key={deploy.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                padding: '1rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '0.5rem',
                                backgroundColor: expired ? 'rgba(0,0,0,0.02)' : 'var(--color-surface-hover)',
                                opacity: expired ? 0.6 : 1
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: expired ? '#6b7280' : 'var(--color-primary)' }}>
                                            {deploy.channelId}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={12} /> {formatDate(deploy.createdAt)}
                                        </div>
                                    </div>
                                    {!expired && (
                                        <a
                                            href={deploy.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'white',
                                                borderRadius: '0.25rem',
                                                textDecoration: 'none',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            OPEN <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                                {expired && (
                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontStyle: 'italic' }}>
                                        Expired on {formatDate(deploy.expiresAt)}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </Card>
    );
}
