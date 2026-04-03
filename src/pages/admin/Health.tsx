import { useState, useEffect, useCallback } from 'react';
import {
    Activity, RefreshCw, Server, Database, Shield, HardDrive,
    UserCheck, Trophy, Ban, Lock, Unlock, AlertTriangle, CheckCircle, Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAdminStats } from '@/firebase/firestore';
import {
    getFullHealthReport,
    type FullHealthReport,
    type ServiceHealthResult,
    type ServiceStatus
} from '@/firebase/healthChecks';
import styles from './Health.module.css';

const STATUS_LABELS: Record<ServiceStatus, string> = {
    operational: 'OK',
    degraded: 'WARN',
    down: 'DOWN',
    checking: '...'
};

const SERVICE_ICONS: Record<string, typeof Server> = {
    'Firebase Auth': Lock,
    'Firestore': Database,
    'Storage': HardDrive,
    'Jikan API': Zap
};

function getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
}

function getBarColor(value: number): string {
    if (value >= 80) return '#22c55e';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
}

export default function AdminHealth() {
    const { t } = useTranslation();
    const [report, setReport] = useState<FullHealthReport | null>(null);
    const [adminStats, setAdminStats] = useState<{
        dau: number; wau: number; mau: number; engagementRate: number;
        totalUsers: number; newUsersToday: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [healthReport, stats] = await Promise.all([
                getFullHealthReport(),
                getAdminStats()
            ]);
            setReport(healthReport);
            setAdminStats(stats);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('[Health] Failed to fetch health data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Auto-refresh every 60s
        const interval = setInterval(() => fetchData(true), 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingBar}>
                    <div className={styles.loadingBarFill} />
                </div>
                <span className={styles.loadingText}>
                    {t('admin.health.loading', 'Diagnostic en cours...')}
                </span>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className={styles.healthPage}>
            {/* ─── Header ─── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <Activity size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className={styles.title}>
                            {t('admin.health.title', 'Health Dashboard')}
                        </h1>
                        <p className={styles.subtitle}>
                            {t('admin.health.subtitle', 'Diagnostic temps réel de la plateforme')}
                        </p>
                    </div>
                </div>
                <button
                    className={styles.refreshBtn}
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
                    {t('admin.health.refresh', 'Actualiser')}
                </button>
            </div>

            {/* ─── Overall Score ─── */}
            <div className={styles.overallScoreCard}>
                <div
                    className={styles.scoreCircle}
                    style={{ borderColor: getScoreColor(report.overallScore) }}
                >
                    <span
                        className={styles.scoreValue}
                        style={{ color: getScoreColor(report.overallScore) }}
                    >
                        {report.overallScore}
                    </span>
                    <span className={styles.scoreLabel}>/100</span>
                </div>
                <div className={styles.scoreInfo}>
                    <h2 className={styles.scoreTitle}>
                        {report.overallScore >= 80
                            ? t('admin.health.score_good', '🟢 Système opérationnel')
                            : report.overallScore >= 50
                                ? t('admin.health.score_warn', '🟡 Dégradation détectée')
                                : t('admin.health.score_bad', '🔴 Problèmes critiques')
                        }
                    </h2>
                    <p className={styles.scoreDesc}>
                        {t('admin.health.score_desc', 'Score calculé à partir de l\'infrastructure et de l\'intégrité des données.')}
                    </p>
                    {lastRefresh && (
                        <p className={styles.lastChecked}>
                            {t('admin.health.last_check', 'Dernier check')}: {lastRefresh.toLocaleTimeString()}
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Sections Grid ─── */}
            <div className={styles.sectionsGrid}>

                {/* ─── 1. Infrastructure ─── */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <Server size={18} className={styles.sectionIcon} />
                        <h3 className={styles.sectionTitle}>
                            {t('admin.health.infrastructure', 'Infrastructure')}
                        </h3>
                    </div>
                    <div className={styles.sectionBody}>
                        {report.infrastructure.map((svc: ServiceHealthResult) => {
                            const Icon = SERVICE_ICONS[svc.service] || Server;
                            return (
                                <div key={svc.service} className={styles.serviceRow}>
                                    <div className={styles.serviceLeft}>
                                        <div
                                            className={styles.statusDot}
                                            data-status={svc.status}
                                        />
                                        <Icon size={14} style={{ color: 'var(--color-text-dim)' }} />
                                        <span className={styles.serviceName}>{svc.service}</span>
                                    </div>
                                    <div className={styles.serviceRight}>
                                        <span className={styles.responseTime}>{svc.responseTime}ms</span>
                                        <span
                                            className={styles.statusBadge}
                                            data-status={svc.status}
                                        >
                                            {STATUS_LABELS[svc.status]}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── 2. Activité Utilisateurs ─── */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <UserCheck size={18} className={styles.sectionIcon} />
                        <h3 className={styles.sectionTitle}>
                            {t('admin.health.user_activity', 'Activité Utilisateurs')}
                        </h3>
                    </div>
                    <div className={styles.sectionBody}>
                        <div className={styles.statsGrid}>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>{adminStats?.dau || 0}</div>
                                <div className={styles.statLabel}>
                                    {t('admin.dashboard.dau', 'Actifs (24h)')}
                                </div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>{adminStats?.wau || 0}</div>
                                <div className={styles.statLabel}>
                                    {t('admin.dashboard.wau', 'Actifs (7j)')}
                                </div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>{adminStats?.mau || 0}</div>
                                <div className={styles.statLabel}>
                                    {t('admin.dashboard.mau', 'Actifs (30j)')}
                                </div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>
                                    +{adminStats?.newUsersToday || 0}
                                </div>
                                <div className={styles.statLabel}>
                                    {t('admin.health.new_today', "Nouveaux aujourd'hui")}
                                </div>
                            </div>
                        </div>

                        {/* Engagement bar */}
                        <div className={styles.healthBarContainer}>
                            <div className={styles.healthBarLabel}>
                                <span>{t('admin.health.engagement', 'Engagement')}</span>
                                <span>{Math.round(adminStats?.engagementRate || 0)}%</span>
                            </div>
                            <div className={styles.healthBarTrack}>
                                <div
                                    className={styles.healthBarFill}
                                    style={{
                                        width: `${adminStats?.engagementRate || 0}%`,
                                        background: getBarColor(adminStats?.engagementRate || 0)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── 3. Intégrité des Données ─── */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <Database size={18} className={styles.sectionIcon} />
                        <h3 className={styles.sectionTitle}>
                            {t('admin.health.data_integrity', 'Intégrité des Données')}
                        </h3>
                    </div>
                    <div className={styles.sectionBody}>
                        <div className={styles.statsGrid}>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>
                                    {report.dataIntegrity.dataHealthScore}%
                                </div>
                                <div className={styles.statLabel}>
                                    {t('admin.health.data_score', 'Score Santé')}
                                </div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>
                                    {report.dataIntegrity.totalUsers}
                                </div>
                                <div className={styles.statLabel}>
                                    {t('admin.health.total_users', 'Total Utilisateurs')}
                                </div>
                            </div>
                        </div>

                        {/* Issues breakdown */}
                        <div style={{ marginTop: 'var(--space-md)' }}>
                            <div className={styles.serviceRow}>
                                <div className={styles.serviceLeft}>
                                    {report.dataIntegrity.missingDisplayName > 0
                                        ? <AlertTriangle size={14} color="#f59e0b" />
                                        : <CheckCircle size={14} color="#22c55e" />
                                    }
                                    <span className={styles.serviceName}>
                                        {t('admin.health.display_names', 'Display Names')}
                                    </span>
                                </div>
                                <span className={styles.responseTime}>
                                    {report.dataIntegrity.missingDisplayName} {t('admin.health.missing', 'manquants')}
                                </span>
                            </div>
                            <div className={styles.serviceRow}>
                                <div className={styles.serviceLeft}>
                                    {report.dataIntegrity.missingPhotoURL > 0
                                        ? <AlertTriangle size={14} color="#f59e0b" />
                                        : <CheckCircle size={14} color="#22c55e" />
                                    }
                                    <span className={styles.serviceName}>
                                        {t('admin.health.avatars', 'Avatars')}
                                    </span>
                                </div>
                                <span className={styles.responseTime}>
                                    {report.dataIntegrity.missingPhotoURL} {t('admin.health.missing', 'manquants')}
                                </span>
                            </div>
                        </div>

                        {/* Health bar */}
                        <div className={styles.healthBarContainer}>
                            <div className={styles.healthBarLabel}>
                                <span>{t('admin.health.completeness', 'Complétude')}</span>
                                <span>{report.dataIntegrity.dataHealthScore}%</span>
                            </div>
                            <div className={styles.healthBarTrack}>
                                <div
                                    className={styles.healthBarFill}
                                    style={{
                                        width: `${report.dataIntegrity.dataHealthScore}%`,
                                        background: getBarColor(report.dataIntegrity.dataHealthScore)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── 4. Gamification ─── */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <Trophy size={18} className={styles.sectionIcon} />
                        <h3 className={styles.sectionTitle}>
                            {t('admin.health.gamification', 'Gamification')}
                        </h3>
                    </div>
                    <div className={styles.sectionBody}>
                        <div className={styles.statsGrid}>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>
                                    {report.gamification.avgLevel}
                                </div>
                                <div className={styles.statLabel}>
                                    {t('admin.health.avg_level', 'Niveau Moyen')}
                                </div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>
                                    {report.gamification.maxLevelUsers}
                                </div>
                                <div className={styles.statLabel}>
                                    {t('admin.health.max_level', 'Niveau Max (100)')}
                                </div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>
                                    {report.gamification.badgeUnlockRate}%
                                </div>
                                <div className={styles.statLabel}>
                                    {t('admin.health.badge_rate', 'Badge Unlock Rate')}
                                </div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>
                                    {report.gamification.avgXP.toLocaleString()}
                                </div>
                                <div className={styles.statLabel}>
                                    {t('admin.health.avg_xp', 'XP Moyen')}
                                </div>
                            </div>
                        </div>

                        {/* Badge unlock bar */}
                        <div className={styles.healthBarContainer}>
                            <div className={styles.healthBarLabel}>
                                <span>{t('admin.health.badge_adoption', 'Adoption Badges')}</span>
                                <span>{report.gamification.badgeUnlockRate}%</span>
                            </div>
                            <div className={styles.healthBarTrack}>
                                <div
                                    className={styles.healthBarFill}
                                    style={{
                                        width: `${report.gamification.badgeUnlockRate}%`,
                                        background: getBarColor(report.gamification.badgeUnlockRate)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── 5. Sécurité ─── */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <Shield size={18} className={styles.sectionIcon} />
                        <h3 className={styles.sectionTitle}>
                            {t('admin.health.security', 'Sécurité')}
                        </h3>
                    </div>
                    <div className={styles.sectionBody}>
                        {/* Maintenance Mode */}
                        <div className={styles.securityRow}>
                            <div className={styles.securityLabel}>
                                <AlertTriangle size={14} />
                                {t('admin.system.maintenance_mode', 'Mode Maintenance')}
                            </div>
                            <span className={`${styles.securityValue} ${
                                report.security.maintenanceMode ? styles.securityDanger : styles.securityOk
                            }`}>
                                {report.security.maintenanceMode ? 'ON' : 'OFF'}
                            </span>
                        </div>

                        {/* Registrations */}
                        <div className={styles.securityRow}>
                            <div className={styles.securityLabel}>
                                {report.security.registrationsOpen
                                    ? <Unlock size={14} />
                                    : <Lock size={14} />
                                }
                                {t('admin.system.registrations', 'Inscriptions')}
                            </div>
                            <span className={`${styles.securityValue} ${
                                report.security.registrationsOpen ? styles.securityOk : styles.securityWarn
                            }`}>
                                {report.security.registrationsOpen
                                    ? t('admin.health.open', 'OUVERT')
                                    : t('admin.health.closed', 'FERMÉ')
                                }
                            </span>
                        </div>

                        {/* Banned Users */}
                        <div className={styles.securityRow}>
                            <div className={styles.securityLabel}>
                                <Ban size={14} />
                                {t('admin.health.banned_users', 'Utilisateurs Bannis')}
                            </div>
                            <span className={`${styles.securityValue} ${
                                report.security.bannedUsersCount > 0 ? styles.securityWarn : styles.securityOk
                            }`}>
                                {report.security.bannedUsersCount}
                            </span>
                        </div>

                        {/* Shield status */}
                        <div className={styles.securityRow}>
                            <div className={styles.securityLabel}>
                                <CheckCircle size={14} />
                                {t('admin.health.data_shield', 'Data Shield')}
                            </div>
                            <span className={`${styles.securityValue} ${styles.securityOk}`}>
                                v3.0
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Auto-refresh indicator ─── */}
            <div className={styles.autoRefreshBar}>
                <div className={styles.liveDot} />
                <span>
                    {t('admin.health.auto_refresh', 'Auto-refresh toutes les 60s')} —{' '}
                    {lastRefresh
                        ? `${t('admin.health.last_check', 'Dernier check')}: ${lastRefresh.toLocaleTimeString()}`
                        : '...'
                    }
                </span>
            </div>
        </div>
    );
}
