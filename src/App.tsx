import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useShallow } from 'zustand/react/shallow';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import {
  loadLibraryFromFirestore,
  loadGamificationFromFirestore,
  saveLibraryToFirestore,
  saveGamificationToFirestore,
  saveUserProfileToFirestore
} from '@/firebase/firestore';
import { ToastProvider } from '@/context/ToastContext';

// Lazy load pages
const Opening = lazy(() => import('@/pages/Opening'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Library = lazy(() => import('@/pages/Library'));
const WorkDetails = lazy(() => import('@/pages/WorkDetails'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const Discover = lazy(() => import('@/pages/Discover'));
const Social = lazy(() => import('@/pages/Social'));
const Legal = lazy(() => import('@/pages/Legal'));

function App() {
  const { setUser, setLoading, user } = useAuthStore();
  const libraryWorks = useLibraryStore((s) => s.works);
  const gamificationState = useGamificationStore(useShallow((s) => ({
    level: s.level,
    xp: s.xp,
    xpToNextLevel: s.xpToNextLevel,
    streak: s.streak,
    lastActivityDate: s.lastActivityDate,
    badges: s.badges,
    totalChaptersRead: s.totalChaptersRead,
    totalWorksAdded: s.totalWorksAdded,
    totalWorksCompleted: s.totalWorksCompleted,
  })));

  // Auth state listener + Firestore sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Sync user profile (email, name, photo)
        await saveUserProfileToFirestore(firebaseUser);

        // User logged in - sync with Firestore
        const cloudLibrary = await loadLibraryFromFirestore(firebaseUser.uid);
        const cloudGamification = await loadGamificationFromFirestore(firebaseUser.uid);

        if (cloudLibrary) {
          // Cloud data exists - load it into Zustand
          useLibraryStore.setState({ works: cloudLibrary });
        } else if (libraryWorks.length > 0) {
          // No cloud data but local data exists - upload to Firestore
          await saveLibraryToFirestore(firebaseUser.uid, libraryWorks);
        }

        if (cloudGamification) {
          // Cloud data exists - load it
          useGamificationStore.setState(cloudGamification);
          // Force sync to main user doc (ensures new fields like badges, stats are on root doc)
          await saveGamificationToFirestore(firebaseUser.uid, cloudGamification);
        } else if (gamificationState.level > 1 || gamificationState.totalWorksAdded > 0) {
          // No cloud data but local progress exists - upload
          await saveGamificationToFirestore(firebaseUser.uid, gamificationState);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  // Auto-save to Firestore when data changes (debounced via separate effect)
  useEffect(() => {
    if (!user) return;

    // Save library changes to Firestore
    const timeout = setTimeout(() => {
      saveLibraryToFirestore(user.uid, libraryWorks);
    }, 2000); // Debounce 2 seconds

    return () => clearTimeout(timeout);
  }, [libraryWorks, user]);

  useEffect(() => {
    if (!user) return;

    // Save gamification changes to Firestore
    const timeout = setTimeout(() => {
      saveGamificationToFirestore(user.uid, gamificationState);
    }, 2000); // Debounce 2 seconds

    return () => clearTimeout(timeout);
  }, [gamificationState, user]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Opening />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/social" element={<Social />} />
            <Route path="/work/:id" element={<WorkDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/legal" element={<Legal />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
