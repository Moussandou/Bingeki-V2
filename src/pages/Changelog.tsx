import { Layout } from '@/components/layout/Layout';
import { changelogData } from '@/data/changelog';
import { Calendar, Tag, GitCommit, Check } from 'lucide-react';
import styles from './Changelog.module.css';

export default function Changelog() {
    const totalUpdates = changelogData.length;
    const latestVersion = changelogData[0]?.version || 'v0.0';

    return (
        <Layout>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        JOURNAL DE BORD
                    </h1>
                    <p className={styles.subtitle}>
                        L'historique des évolutions de la plateforme Bingeki.
                    </p>
                </div>

                {/* Stats Section */}
                <div className={styles.statsContainer}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{totalUpdates}</span>
                        <span className={styles.statLabel}>Mises à jour</span>
                    </div>
                    <div className={styles.statCard} style={{ transform: 'rotate(2deg)', background: '#fff', color: '#000', border: '3px solid #000' }}>
                        <span className={styles.statValue}>{latestVersion}</span>
                        <span className={styles.statLabel}>Version Actuelle</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className={styles.timelineContainer}>
                    {/* Vertical Line */}
                    <div className={styles.timelineLine} />

                    {changelogData.map((entry, index) => {
                        const isLatest = index === 0;
                        return (
                            <div key={index} className={styles.timelineEntry}>
                                {/* Timeline Node */}
                                <div className={styles.timelineNode} style={{ background: isLatest ? '#000' : '#fff' }}>
                                    <GitCommit size={24} color={isLatest ? '#fff' : '#000'} />
                                </div>

                                {/* Content Card */}
                                <div className={`${styles.contentCard} ${isLatest ? styles.isNew : ''}`}>
                                    {/* Header: Version & Date */}
                                    <div className={styles.cardHeader}>
                                        <div className={styles.versionTag}>
                                            <div className={styles.versionBadge}>
                                                <Tag size={16} /> {entry.version}
                                            </div>
                                            {isLatest && (
                                                <span style={{
                                                    background: '#FFD700',
                                                    color: '#000',
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 800,
                                                    border: '2px solid #000',
                                                    marginLeft: '0.5rem',
                                                    transform: 'rotate(-5deg)'
                                                }}>
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.dateTag}>
                                            <Calendar size={16} /> {entry.date}
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <h2 className={styles.entryTitle}>
                                        {entry.title}
                                    </h2>
                                    <p className={styles.entryDescription}>
                                        {entry.description}
                                    </p>

                                    {/* Changes List */}
                                    <ul className={styles.changesList}>
                                        {entry.changes.map((change, i) => (
                                            <li key={i} className={styles.changeItem}>
                                                <div className={styles.bulletPoint}>
                                                    <Check size={14} strokeWidth={4} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{change}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* End Marker */}
                <div className={styles.endMarkerContainer}>
                    <div className={styles.endMarker}>
                        TO BE CONTINUED...
                    </div>
                </div>

            </div>
        </Layout>
    );
}
