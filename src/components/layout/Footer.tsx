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

                {/* Tips for Devs Section */}
                <div style={{
                    background: 'var(--color-primary)',
                    border: '4px solid #000',
                    padding: '2rem',
                    marginBottom: '3rem',
                    position: 'relative',
                    boxShadow: '8px 8px 0 rgba(0,0,0,0.15)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#000',
                        color: '#fff',
                        padding: '0.5rem 2rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        letterSpacing: '2px'
                    }}>
                        TIPS FOR DEVS
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', color: '#000' }}>
                            Ce projet est développé avec ❤️ en open-source
                        </p>
                        <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: '#000', opacity: 0.85 }}>
                            Si Bingeki vous aide dans votre aventure manga/anime, soutenez le développement !
                        </p>
                        <a
                            href="https://ko-fi.com/moussandou"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                background: '#fff',
                                color: '#fff',
                                padding: '0.5rem 1rem',
                                fontWeight: 900,
                                fontSize: '1rem',
                                textDecoration: 'none',
                                clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)',
                                transition: 'transform 0.2s',
                                border: '3px solid #000',
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                        >
                            <img
                                src="/Ko-fi logo.gif"
                                alt="Support me on Ko-fi"
                                style={{
                                    height: '36px',
                                    display: 'block',
                                    margin: '0 auto'
                                }}
                            />
                        </a>
                        <p style={{ fontSize: '0.75rem', marginTop: '1rem', color: '#000', opacity: 0.7, fontWeight: 600 }}>
                            Chaque contribution aide à ajouter de nouvelles fonctionnalités !
                        </p>
                    </div>
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
                        <a href="/credits" style={{ color: '#000', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>
                            CRÉDITS
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
