import { useState, useEffect, useMemo } from 'react';
import { 
    Clipboard, 
    Users, 
    ChevronDown, 
    ChevronUp,
    Clock,
    User,
    ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getSurveyResponses, type SurveyResponse } from '@/firebase/firestore';
import { 
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';
import styles from './SurveyDashboard.module.css';
import { Link } from '@/components/routing/LocalizedLink';

const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];

export default function SurveyDashboard() {
    const { t } = useTranslation();
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getSurveyResponses();
                setResponses(data);
            } catch (err) {
                console.error("Failed to load survey responses:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => {
        if (!responses.length) return null;

        const processCounts = (field: string) => {
            const counts: Record<string, number> = {};
            responses.forEach(r => {
                const val = r.answers?.[field] || 'Unknown';
                if (Array.isArray(val)) {
                    val.forEach(v => {
                        counts[v] = (counts[v] || 0) + 1;
                    });
                } else {
                    counts[val] = (counts[val] || 0) + 1;
                }
            });
            return Object.entries(counts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
        };

        return {
            age: processCounts('ageRange'),
            status: processCounts('status'),
            consumption: processCounts('consumptionFrequency'),
            interest: processCounts('interestLevel'),
            features: processCounts('mostAttractiveFeatures'),
            monetization: processCounts('premiumInterest'),
        };
    }, [responses]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>{t('admin.survey.loading', 'Chargement des réponses...')}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link to="/admin" className={styles.backLink}>
                        <ArrowLeft size={16} /> {t('common.back', 'Retour')}
                    </Link>
                    <h1 className={styles.title}>
                        <Clipboard size={32} /> {t('admin.survey.title', 'Analyses du Questionnaire')}
                    </h1>
                </div>
                <div className={styles.statsBadge}>
                    <strong>{responses.length}</strong> {t('admin.survey.total_responses', 'réponses')}
                </div>
            </div>

            {/* Visual Insights */}
            <div className={styles.chartsGrid}>
                <Card variant="manga" className={styles.chartCard}>
                    <h3>{t('survey.questions.ageRange', 'Tranches d\'âge')}</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.age}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats?.age.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ background: '#000', border: '2px solid var(--color-border)', color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card variant="manga" className={styles.chartCard}>
                    <h3>{t('survey.questions.interestLevel', 'Niveau d\'intérêt')}</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.interest}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip 
                                    cursor={{fill: 'rgba(239, 68, 68, 0.1)'}}
                                    contentStyle={{ background: '#000', border: '2px solid var(--color-border)', color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card variant="manga" className={styles.chartCard}>
                    <h3>{t('survey.questions.mostAttractiveFeatures', 'Fonctionnalités')}</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={stats?.features.slice(0, 5)} margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                                <RechartsTooltip 
                                    contentStyle={{ background: '#000', border: '2px solid var(--color-border)', color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card variant="manga" className={styles.chartCard}>
                    <h3>{t('survey.questions.status', 'Situation actuelle')}</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.status}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label
                                >
                                    {stats?.status.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ background: '#000', border: '2px solid var(--color-border)', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Individual Responses List */}
            <div className={styles.responsesSection}>
                <h2 className={styles.sectionTitle}>
                    <Users size={24} /> {t('admin.survey.raw_data', 'Données brutes')}
                </h2>
                
                <div className={styles.tableContainer}>
                    <table className={styles.responsesTable}>
                        <thead>
                            <tr>
                                <th>{t('admin.survey.date', 'Date')}</th>
                                <th>{t('admin.survey.email', 'Email')}</th>
                                <th>{t('admin.survey.profile', 'Profil')}</th>
                                <th>{t('admin.survey.interest', 'Intérêt')}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {responses.map((response) => (
                                <optgroup key={response.id} label="">
                                    <tr 
                                        className={expandedRow === response.id ? styles.expandedRow : ''}
                                        onClick={() => setExpandedRow(expandedRow === response.id ? null : response.id)}
                                    >
                                        <td>
                                            <div className={styles.dateTime}>
                                                <Clock size={14} />
                                                {new Date(response.submittedAt || 0).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.emailCell}>
                                                <User size={14} />
                                                {response.answers?.email || 'Anonymous'}
                                            </div>
                                        </td>
                                        <td>{response.answers?.ageRange}, {response.answers?.status}</td>
                                        <td>
                                            <span className={`${styles.tag} ${styles[`interest_${response.answers?.interestLevel?.replace(/[^a-zA-Z0-9]/g, '_')}`]}`}>
                                                {response.answers?.interestLevel}
                                            </span>
                                        </td>
                                        <td>
                                            {expandedRow === response.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </td>
                                    </tr>
                                    {expandedRow === response.id && (
                                        <tr className={styles.detailsRow}>
                                            <td colSpan={5}>
                                                <div className={styles.detailsContent}>
                                                    <div className={styles.detailsGrid}>
                                                        {Object.entries(response.answers || {}).map(([key, value]) => (
                                                            <div key={key} className={styles.detailItem}>
                                                                <label>{key}</label>
                                                                <p>{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {response.userAgent && (
                                                        <div className={styles.technicalInfo}>
                                                            <small>User Agent: {response.userAgent}</small>
                                                            <small>Language: {response.language}</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </optgroup>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
