import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from '@/pages/Auth';
// import { Layout } from '@/components/layout/Layout'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        {/* We will add protected routes inside Layout later */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
