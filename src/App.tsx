import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Lazy load pages
const Opening = lazy(() => import('@/pages/Opening'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Library = lazy(() => import('@/pages/Library'));
const WorkDetails = lazy(() => import('@/pages/WorkDetails'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));

function App() {
  const { setUser, setLoading } = useAuthStore();
  const { theme } = useSettingsStore();

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-amoled');
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else if (theme === 'amoled') {
      document.body.classList.add('theme-amoled');
    }
    // dark is default, no class needed
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Opening />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/work/:id" element={<WorkDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
