export function Footer() {
    return (
        <footer style={{ marginTop: 'auto', padding: '2rem 0', opacity: 0.5, fontSize: '0.875rem' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <p>&copy; {new Date().getFullYear()} Bingeki Experience.</p>
            </div>
        </footer>
    );
}
