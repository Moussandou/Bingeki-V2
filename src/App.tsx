import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Zap, Play, Search } from 'lucide-react';

function App() {
  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Design System</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <Button>Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg" className="animate-pulse">Large & Pulse</Button>
          <Button variant="primary">
            <Play size={16} /> Start Adventure
          </Button>
          <Button variant="outline" isLoading>Loading</Button>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Inputs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', maxWidth: '400px' }}>
          <Input placeholder="Username" />
          <Input placeholder="Search..." />
          <div style={{ position: 'relative' }}>
            <Input placeholder="Search with Icon..." style={{ paddingLeft: '2.5rem' }} />
            <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
          </div>
          <Input error placeholder="Error state" />
        </div>
      </section>

      <section>
        <h2>Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <Card>
            <h3>Default Card</h3>
            <p style={{ color: 'var(--color-text-dim)', marginTop: '0.5rem' }}>This is a standard surface card.</p>
          </Card>

          <Card variant="glass" hoverable>
            <h3>Glass Card (Hoverable)</h3>
            <p style={{ color: 'var(--color-text-dim)', marginTop: '0.5rem' }}>This card uses the glassmorphism effect.</p>
          </Card>

          <Card hoverable style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--color-primary)" />
              <h3>Achievement</h3>
            </div>
            <p style={{ marginTop: '0.5rem' }}>Level Up!</p>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default App
