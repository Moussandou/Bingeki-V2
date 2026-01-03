import { Mail, Phone, MapPin, Github, Linkedin, Globe, Briefcase } from 'lucide-react';

export function Footer() {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '4rem 0 2rem',
            background: '#fff',
            borderTop: '3px solid #000',
            position: 'relative'
        }}>
            {/* Center "End" marker */}
            <div style={{
                position: 'absolute',
                top: '-1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#000',
                color: '#fff',
                padding: '0.5rem 2rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                textTransform: 'uppercase',
                clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)'
            }}>
                TO BE CONTINUED
            </div>

            <div className="container" style={{ textAlign: 'center', color: '#000' }}>

                {/* Contact Info Row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    marginBottom: '2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={18} />
                        <span>Marseille, France</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={18} />
                        <a href="mailto:moussandou.m@gmail.com" style={{ color: '#000', textDecoration: 'none' }}>moussandou.m@gmail.com</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={18} />
                        <a href="tel:+33781633278" style={{ color: '#000', textDecoration: 'none' }}>07 81 63 32 78</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <a href="/feedback" style={{ color: '#000', textDecoration: 'none', fontWeight: 900, borderBottom: '2px solid #000' }}>
                            DONNER MON AVIS
                        </a>
                    </div>
                </div>

                {/* Social Icons Row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    <a href="https://github.com/Moussandou" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#000', padding: '0.5rem', border: '2px solid #000', borderRadius: '50%', transition: 'transform 0.2s', display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Github size={20} />
                    </a>
                    <a href="https://www.linkedin.com/in/moussandou" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#000', padding: '0.5rem', border: '2px solid #000', borderRadius: '50%', transition: 'transform 0.2s', display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Linkedin size={20} />
                    </a>
                    <a href="https://www.malt.fr/profile/moussandoumroivili" target="_blank" rel="noopener noreferrer"
                        title="Malt"
                        style={{ color: '#000', padding: '0.5rem', border: '2px solid #000', borderRadius: '50%', transition: 'transform 0.2s', display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Briefcase size={20} />
                    </a>
                    <a href="https://moussandou.github.io/Portfolio/" target="_blank" rel="noopener noreferrer"
                        title="Portfolio"
                        style={{ color: '#000', padding: '0.5rem', border: '2px solid #000', borderRadius: '50%', transition: 'transform 0.2s', display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Globe size={20} />
                    </a>
                </div>

                {/* Copyright & Legal */}
                <div style={{ borderTop: '1px solid #eee', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                    <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, fontSize: '0.8rem', margin: 0 }}>
                        &copy; {new Date().getFullYear()} Bingeki Experience.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a href="/changelog" style={{ color: '#000', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>
                            CHANGELOG
                        </a>
                        <a href="/legal" style={{ color: '#000', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>
                            MENTIONS LÉGALES & RGPD
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
