import { Layout } from '@/components/layout/Layout';
import { changelogData } from '@/data/changelog';
import { Calendar, CheckCircle, Tag, GitCommit } from 'lucide-react';

export default function Changelog() {
    return (
        <Layout>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>

                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    position: 'relative'
                }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontFamily: 'var(--font-heading)',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        position: 'relative',
                        display: 'inline-block'
                    }}>
                        Mises à Jour
                        <div style={{
                            position: 'absolute',
                            bottom: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '4px',
                            background: '#000'
                        }} />
                    </h1>
                    <p style={{ opacity: 0.7, fontWeight: 500 }}>
                        L'historique des évolutions de la plateforme Bingeki.
                    </p>
                </div>

                {/* Timeline */}
                <div style={{ position: 'relative', paddingLeft: '20px' }}>
                    {/* Vertical Line */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: '19px', // Center of the timeline circles
                        width: '4px',
                        background: '#000'
                    }} />

                    {changelogData.map((entry, index) => (
                        <div key={index} style={{
                            marginBottom: '4rem',
                            position: 'relative',
                            paddingLeft: '3rem'
                        }}>
                            {/* Timeline Node */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '0',
                                width: '42px',
                                height: '42px',
                                background: '#fff',
                                border: '4px solid #000',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}>
                                <GitCommit size={20} />
                            </div>

                            {/* Content Card */}
                            <div style={{
                                background: '#fff',
                                border: '3px solid #000',
                                boxShadow: '6px 6px 0 rgba(0,0,0,1)',
                                padding: '2rem',
                                position: 'relative'
                            }}>
                                {/* Header: Version & Date */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                    flexWrap: 'wrap',
                                    gap: '1rem',
                                    borderBottom: '2px solid #eee',
                                    paddingBottom: '1rem'
                                }}>
                                    <div style={{
                                        background: '#000',
                                        color: '#fff',
                                        padding: '0.25rem 0.75rem',
                                        fontWeight: 900,
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Tag size={16} /> {entry.version}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 700,
                                        opacity: 0.6
                                    }}>
                                        <Calendar size={16} /> {entry.date}
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <h2 style={{
                                    fontFamily: 'var(--font-heading)',
                                    textTransform: 'uppercase',
                                    fontSize: '1.8rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    {entry.title}
                                </h2>
                                <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', opacity: 0.8 }}>
                                    {entry.description}
                                </p>

                                {/* Changes List */}
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {entry.changes.map((change, i) => (
                                        <li key={i} style={{
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem'
                                        }}>
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
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <div style={{
                        display: 'inline-block',
                        background: '#000',
                        color: '#fff',
                        padding: '0.5rem 2rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading)',
                        transform: 'rotate(-2deg)'
                    }}>
                        LA SUITE AU PROCHAIN ÉPISODE
                    </div>
                </div>

            </div>
        </Layout>
    );
}
