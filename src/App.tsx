import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Opening from '@/pages/Opening';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Library from '@/pages/Library';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Opening />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
