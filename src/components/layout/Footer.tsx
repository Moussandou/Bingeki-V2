

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
                <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    &copy; {new Date().getFullYear()} Bingeki Experience.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ cursor: 'pointer' }}>MENTIONS LÉGALES</span>
                    <span style={{ cursor: 'pointer' }}>CONFIDENTIALITÉ</span>
                    <span style={{ cursor: 'pointer' }}>CONTACT</span>
                </div>
            </div>
        </footer>
    );
}
