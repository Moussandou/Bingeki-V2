import { Layout } from '@/components/layout/Layout';
import { changelogData } from '@/data/changelog';
import { Calendar, CheckCircle, Tag, GitCommit } from 'lucide-react';
import styles from './Changelog.module.css';

export default function Changelog() {
    return (
        <Layout>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Mises à Jour
                        <div className={styles.titleUnderline} />
                    </h1>
                    <p className={styles.subtitle}>
                        L'historique des évolutions de la plateforme Bingeki.
                    </p>
                </div>

                {/* Timeline */}
                <div className={styles.timelineContainer}>
                    {/* Vertical Line */}
                    <div className={styles.timelineLine} />

                    {changelogData.map((entry, index) => (
                        <div key={index} className={styles.timelineEntry}>
                            {/* Timeline Node */}
                            <div className={styles.timelineNode}>
                                <GitCommit size={20} />
                            </div>

                            {/* Content Card */}
                            <div className={styles.contentCard}>
                                {/* Header: Version & Date */}
                                <div className={styles.cardHeader}>
                                    <div className={styles.versionTag}>
                                        <Tag size={16} /> {entry.version}
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
                                            <div style={{ marginTop: '3px' }}>
                                                <CheckCircle size={18} fill="#000" color="#fff" strokeWidth={3} />
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* End Marker */}
                <div className={styles.endMarkerContainer}>
                    <div className={styles.endMarker}>
                        LA SUITE AU PROCHAIN ÉPISODE
                    </div>
                </div>

            </div>
        </Layout>
    );
}
