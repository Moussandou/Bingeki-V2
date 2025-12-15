function App() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <h1 className="text-gradient" style={{ fontSize: '5rem', marginBottom: '1rem' }}>BINGEKI</h1>
      <p style={{ fontSize: '1.5rem', color: 'var(--color-text-dim)' }}>L'aventure commence ici.</p>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <div className="animate-pulse" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
        <div className="animate-pulse" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-secondary)', animationDelay: '0.2s' }}></div>
        <div className="animate-pulse" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)', animationDelay: '0.4s' }}></div>
      </div>
    </div>
  )
}

export default App
