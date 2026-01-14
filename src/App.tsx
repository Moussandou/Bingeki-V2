import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useSettingsStore } from '@/store/settingsStore';
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
import { mergeLibraryData, mergeGamificationData } from '@/utils/dataProtection';
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
const Challenges = lazy(() => import('@/pages/Challenges'));
const Feedback = lazy(() => import('@/pages/Feedback'));
const FeedbackList = lazy(() => import('@/pages/FeedbackList'));
const Changelog = lazy(() => import('@/pages/Changelog'));
const Schedule = lazy(() => import('@/pages/Schedule'));
const CharacterDetails = lazy(() => import('@/pages/CharacterDetails'));
const PersonDetails = lazy(() => import('@/pages/PersonDetails'));
const Credits = lazy(() => import('@/pages/Credits'));
const Assets = lazy(() => import('@/pages/AssetsPage'));

import { AdminLayout } from '@/components/admin/AdminLayout';
import { RequireAdmin } from '@/components/admin/RequireAdmin';

// Admin Components
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminFeedback = lazy(() => import('@/pages/admin/FeedbackAdmin'));
const AdminSystem = lazy(() => import('@/pages/admin/SystemLogs'));

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
        // DON'T clear stores - we'll merge instead to avoid data loss
        // Get current local state before loading cloud
        const localLibrary = useLibraryStore.getState().works;
        const localGamification = useGamificationStore.getState();

        // Sync user profile (email, name, photo)
        await saveUserProfileToFirestore(firebaseUser);

        // Load cloud data
        const cloudLibrary = await loadLibraryFromFirestore(firebaseUser.uid);
        const cloudGamification = await loadGamificationFromFirestore(firebaseUser.uid);

        // Smart merge: combine local and cloud data safely
        const mergedLibrary = mergeLibraryData(localLibrary, cloudLibrary);
        const mergedGamification = mergeGamificationData(
          {
            ...localGamification,
            badges: localGamification.badges || []
          },
          cloudGamification
        );

        // Update stores with merged data
        useLibraryStore.setState({ works: mergedLibrary });
        useGamificationStore.setState(mergedGamification);

        console.log('[App] Data merged successfully:', {
          libraryCount: mergedLibrary.length,
          level: mergedGamification.level
        });
      } else {
        // User logged out - clear local stores
        useLibraryStore.getState().resetStore();
        useGamificationStore.getState().resetStore();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  // Auto-save to Firestore when data changes (debounced)
  useEffect(() => {
    if (!user) return;

    // Save library changes to Firestore
    const timeout = setTimeout(() => {
      saveLibraryToFirestore(user.uid, libraryWorks);
    }, 3000); // Increased to 3s to reduce save conflicts

    return () => clearTimeout(timeout);
  }, [libraryWorks, user]);

  useEffect(() => {
    if (!user) return;

    // Save gamification changes to Firestore
    const timeout = setTimeout(() => {
      saveGamificationToFirestore(user.uid, gamificationState);
    }, 3000); // Increased to 3s to reduce save conflicts

    return () => clearTimeout(timeout);
  }, [gamificationState, user]);

  // Apply global accent color
  const accentColor = useSettingsStore(s => s.accentColor);
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', accentColor);
    // Also update glow for consistency
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    }
    const rgb = hexToRgb(accentColor);
    if (rgb) {
      document.documentElement.style.setProperty('--color-primary-glow', `rgba(${rgb}, 0.5)`);
      // Update gradient to use the accent color (simple gradient for now)
      document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${accentColor} 0%, ${accentColor} 100%)`);
    }
  }, [accentColor]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Opening />} />
            <Route path="/challenges" element={
              <Suspense fallback={<LoadingScreen />}>
                <Challenges />
              </Suspense>
            } />
            <Route path="/feedback" element={
              <Suspense fallback={<LoadingScreen />}>
                <Feedback />
              </Suspense>
            } />
            <Route path="/feedback-admin" element={
              <Suspense fallback={<LoadingScreen />}>
                <FeedbackList />
              </Suspense>
            } />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/social" element={<Social />} />
            <Route path="/work/:id" element={<WorkDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/schedule" element={
              <Suspense fallback={<LoadingScreen />}>
                <Schedule />
              </Suspense>
            } />
            <Route path="/character/:id" element={
              <Suspense fallback={<LoadingScreen />}>
                <CharacterDetails />
              </Suspense>
            } />
            <Route path="/person/:id" element={
              <Suspense fallback={<LoadingScreen />}>
                <PersonDetails />
              </Suspense>
            } />

            <Route path="/legal" element={<Legal />} />
            <Route path="/credits" element={
              <Suspense fallback={<LoadingScreen />}>
                <Credits />
              </Suspense>
            } />
            <Route path="/assets" element={<Assets />} />


            < Route path="/admin" element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="system" element={<AdminSystem />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider >
  )
}

export default App
