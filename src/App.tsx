import { logger } from '@/utils/logger';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { MaintenanceScreen } from '@/components/ui/MaintenanceScreen';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePWAStore } from '@/store/pwaStore';
import { useShallow } from 'zustand/react/shallow';
import {
  saveLibraryToFirestore,
  saveGamificationToFirestore,
  subscribeToGlobalConfig
} from '@/firebase/firestore';
import { ToastProvider } from '@/context/ToastContext';
import { isBot } from '@/utils/isBot';

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
const FeedbackList = lazy(() => import('@/pages/admin/FeedbackList'));
const Changelog = lazy(() => import('@/pages/Changelog'));
const Schedule = lazy(() => import('@/pages/Schedule'));
const CharacterDetails = lazy(() => import('@/pages/CharacterDetails'));
const PersonDetails = lazy(() => import('@/pages/PersonDetails'));
const Credits = lazy(() => import('@/pages/Credits'));
const Assets = lazy(() => import('@/pages/AssetsPage'));
const Donors = lazy(() => import('@/pages/Donors'));
const Notifications = lazy(() => import('@/pages/Notifications')); // Added
const TierListFeed = lazy(() => import('@/pages/tierlist/TierListFeed'));
const CreateTierList = lazy(() => import('@/pages/tierlist/CreateTierList'));
const ViewTierList = lazy(() => import('@/pages/tierlist/ViewTierList'));

const FormSurvey = lazy(() => import('@/pages/FormSurvey'));
const FormSurveyThankYou = lazy(() => import('@/pages/FormSurveyThankYou'));

const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Contact = lazy(() => import('@/pages/Contact'));
const About = lazy(() => import('@/pages/About'));
// MyTickets and TicketDetail are now merged into Feedback.tsx

const Lens = lazy(() => import('@/pages/Lens'));
const NewsIndex = lazy(() => import('@/pages/NewsIndex'));
const NewsArticle = lazy(() => import('@/pages/NewsArticle'));
const NotFound = lazy(() => import('@/pages/NotFound'));

import { AdminLayout } from '@/components/admin/AdminLayout';
import { RequireAdmin } from '@/components/admin/RequireAdmin';
import { InstallInstructionsModal } from '@/components/pwa/InstallInstructionsModal';
import { MobileMenuFAB } from '@/components/layout/MobileMenuFAB';
import { UsernameSelectionModal } from '@/components/auth/UsernameSelectionModal';
import { XPGainToast } from '@/components/gamification/XPGainToast';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';
import { AvatarSelectionModal } from '@/components/auth/AvatarSelectionModal';
import { ReloadPrompt } from '@/components/pwa/ReloadPrompt';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

// Hooks
import { useAuthSync } from '@/hooks/useAuthSync';
import { usePWAHandler } from '@/hooks/usePWAHandler';
import { useThemeManager } from '@/hooks/useThemeManager';
import { useMounted } from '@/hooks/useMounted';

// Bot aware suspense to avoid blank screen during hydration for screenshot tools
const BotAwareSuspense = ({ children }: { children: React.ReactNode }) => {
  const isMounted = useMounted();
  const fallback = !isMounted || isBot() ? null : <LoadingScreen />;
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Admin Components
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminFeedback = lazy(() => import('@/pages/admin/FeedbackAdmin'));
const AdminSystem = lazy(() => import('@/pages/admin/SystemLogs'));
const AdminSurvey = lazy(() => import('@/pages/admin/SurveyDashboard'));
const AdminGrowthAnalytics = lazy(() => import('@/pages/admin/analytics/Growth'));
const AdminEngagementAnalytics = lazy(() => import('@/pages/admin/analytics/Engagement'));
const AdminRetentionAnalytics = lazy(() => import('@/pages/admin/analytics/Retention'));
const AdminHealth = lazy(() => import('@/pages/admin/Health'));

// Language Manager Component
const LanguageManager = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();
  const isMounted = useMounted();

  useEffect(() => {
    if (lang && (lang === 'fr' || lang === 'en')) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    }
  }, [lang, i18n]);

  // Prevent hydration mismatch: render nothing until mounted
  if (!isMounted) return null;

  // If language is invalid or missing, redirect to detection
  if (!lang || !['fr', 'en'].includes(lang)) {
    const detectedLang = i18n.language || 'fr';
    let cleanPath = location.pathname;

    // If path already starts with a valid language but LanguageManager matched something else
    // (e.g. /fr/form but lang parameter was captured as something else, which shouldn't happen
    // with :lang route but let's be safe), or if it's already prefixed in general.
    if (cleanPath.startsWith('/fr/') || cleanPath.startsWith('/en/') || cleanPath === '/fr' || cleanPath === '/en') {
      return (
        <BotAwareSuspense>
          <NotFound />
        </BotAwareSuspense>
      );
    }

    if (cleanPath === '/') cleanPath = '';
    return <Navigate to={`/${detectedLang}${cleanPath}${location.search}`} replace />;
  }

  return <Outlet />;
};

const RootRedirect = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isMounted = useMounted();

  // Prevent hydration mismatch
  if (!isMounted) return null;

  // Prevent redirect loops for static files that fell through
  if (/\.(xml|txt|json|png|jpg|jpeg|svg|ico)$/i.test(location.pathname)) {
    return <div className="flex h-screen items-center justify-center">404 - File Not Found</div>;
  }

  const lang = i18n.language === 'en' ? 'en' : 'fr';
  const currentPath = location.pathname;

  // If already prefixed, don't re-prefix (this happens if a route falls through)
  if (currentPath.startsWith('/fr/') || currentPath.startsWith('/en/') || currentPath === '/fr' || currentPath === '/en') {
    return (
      <BotAwareSuspense>
        <NotFound />
      </BotAwareSuspense>
    );
  }

  return <Navigate to={`/${lang}${currentPath}${location.search}`} replace />;
};

function App() {
  const { user, userProfile, loading, setLoading } = useAuthStore();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const { showInstallModal, setShowInstallModal } = usePWAStore();
  
  // Custom Hooks
  const { isInitialSync } = useAuthSync();
  usePWAHandler();
  useThemeManager();

  const libraryWorks = useLibraryStore((s) => s.works);
  const libraryFolders = useLibraryStore((s) => s.folders);
  const libraryViewMode = useLibraryStore((s) => s.viewMode);
  const librarySortBy = useLibraryStore((s) => s.sortBy);
  
  const gamificationState = useGamificationStore(useShallow((s) => ({
    level: s.level,
    xp: s.xp,
    totalXp: s.totalXp,
    xpToNextLevel: s.xpToNextLevel,
    streak: s.streak,
    lastActivityDate: s.lastActivityDate,
    badges: s.badges,
    totalChaptersRead: s.totalChaptersRead,
    totalWorksAdded: s.totalWorksAdded,
    totalWorksCompleted: s.totalWorksCompleted,
    totalAnimeEpisodesWatched: s.totalAnimeEpisodesWatched,
    totalMoviesWatched: s.totalMoviesWatched,
    bonusXp: s.bonusXp,
  })));

  // Sync state from profile changes (e.g. from other devices/admin)
  const [shouldSaveGamification, setShouldSaveGamification] = useState(false);
  
  useEffect(() => {
    if (!user || userProfile === undefined) return;
    
    if (userProfile) {
      useGamificationStore.getState().syncFromProfile(userProfile);
      useSettingsStore.getState().syncFromProfile(userProfile);
      setShouldSaveGamification(false);
    }
  }, [userProfile, user]);

  // Set flag to allow saving when gamification state changes, but ONLY after initial sync
  useEffect(() => {
    if (!user) return;
    if (isInitialSync.current) {
      isInitialSync.current = false;
      setShouldSaveGamification(false);
      return;
    }
    setShouldSaveGamification(true);
  }, [gamificationState, user]);

  // Auto-save to Firestore when data changes (debounced)
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      saveLibraryToFirestore(user.uid, libraryWorks, libraryFolders, libraryViewMode, librarySortBy);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [libraryWorks, libraryFolders, libraryViewMode, librarySortBy, user]);

  useEffect(() => {
    if (!user || !shouldSaveGamification) return;
    const timeout = setTimeout(() => {
      saveGamificationToFirestore(user.uid, gamificationState);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [gamificationState, user, shouldSaveGamification]);

  // Subscribe to global config for maintenance mode
  useEffect(() => {
    const unsubscribe = subscribeToGlobalConfig((config) => {
      if (config) setIsMaintenance(config.maintenance);
      setConfigLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Safety timeout: force loading to finish if it hangs too long (5s)
  useEffect(() => {
    if (loading || !configLoaded) {
      const timer = setTimeout(() => {
        logger.warn('[App] Loading timeout reached - forcing render');
        if (loading) setLoading(false);
        if (!configLoaded) setConfigLoaded(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, configLoaded, setLoading]);

  const isPrerendered = typeof document !== 'undefined' && document.body.classList.contains('is-prerendered');
  
  if ((loading || !configLoaded) && !isBot() && !isPrerendered) {
    return <LoadingScreen />;
  }

  const isAuthPage = window.location.pathname.includes('/auth');
  if (isMaintenance && userProfile?.isSuperAdmin !== true && !isAuthPage) {
    return <MaintenanceScreen />;
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <ScrollToTop />
        <UsernameSelectionModal />
        <AvatarSelectionModal />
        <XPGainToast />
        <LevelUpModal />
        <BotAwareSuspense>
          <Routes>
            {/* Root redirect to language prefix */}
            <Route path="/" element={<RootRedirect />} />

            {/* Language-prefixed routes */}
            <Route path="/:lang" element={<LanguageManager />}>
              <Route index element={<Opening />} />
              <Route path="form" element={<FormSurvey />} />
              <Route path="form/thank-you" element={<FormSurveyThankYou />} />
              <Route path="challenges" element={<Challenges />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="feedback-admin" element={<FeedbackList />} />
              <Route path="changelog" element={<Changelog />} />
              <Route path="auth" element={<Auth />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="library" element={<Library />} />
              <Route path="users/:uid/library" element={<Library />} />
              <Route path="discover" element={<Discover />} />
              <Route path="social" element={<Social />} />
              <Route path="work/:id" element={<WorkDetails />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:uid" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="character/:id" element={<CharacterDetails />} />
              <Route path="person/:id" element={<PersonDetails />} />

              <Route path="legal" element={<Legal />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              <Route path="credits" element={<Credits />} />

              <Route path="donors" element={<Donors />} />
              <Route path="lens" element={<Lens />} />
              <Route path="news" element={<NewsIndex />} />
              <Route path="news/article/:slug" element={<NewsArticle />} />

              <Route path="tierlist" element={<TierListFeed />} />
              <Route path="tierlist/create" element={<CreateTierList />} />
              <Route path="tierlist/:id" element={<ViewTierList />} />

              <Route path="admin" element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="system" element={<AdminSystem />} />
                <Route path="survey" element={<AdminSurvey />} />
                <Route path="assets" element={<Assets />} />
                <Route path="analytics/growth" element={<AdminGrowthAnalytics />} />
                <Route path="analytics/engagement" element={<AdminEngagementAnalytics />} />
                <Route path="analytics/retention" element={<AdminRetentionAnalytics />} />
                <Route path="health" element={<AdminHealth />} />
              </Route>

              {/* Catch-all for invalid sub-paths under language */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Fallback for non-prefixed paths */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BotAwareSuspense>
        <MobileMenuFAB />
      </BrowserRouter>
      <InstallInstructionsModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
      <ReloadPrompt />
    </ToastProvider >
  )
}

export default App
