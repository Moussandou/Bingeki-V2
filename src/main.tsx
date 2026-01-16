import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
    <App />
  </StrictMode>,
)
