import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './styles/global.css'
import './i18n'
import App from './App.tsx'

// Handle asset loading errors (common after new deployments)
window.addEventListener('vite:preloadError', (event) => {
  console.log('Vite preload error detected, reloading page...', event);
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
