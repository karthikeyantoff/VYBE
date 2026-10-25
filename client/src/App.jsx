import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import GuestOnlyRoute from "./components/guards/GuestOnlyRoute.jsx";
import ProtectedRoute from "./components/guards/ProtectedRoute.jsx";

import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import Spinner from "./components/ui/Spinner.jsx";

import { useAuth } from "./context/useAuth.js";

/**
 * Top-level route tree (STEP 23, refined in STEP 38 & VYBE Auth Suite).
 *
 * Layout strategy:
 *  - Auth pages render without any chrome (no navbar/footer) so the user
 *    isn't distracted by app-level navigation while signing in.
 *  - Everything else is grouped under one of three layouts (Main /
 *    Settings / Admin) so chrome stays consistent across siblings.
 *
 * Guard strategy:
 *  - `GuestOnlyRoute` keeps signed-in users out of `/login`, `/register`, `/forgot-password`, `/reset-password`.
 *  - `ProtectedRoute` wraps any route that mutates user state or shows
 *    private data (feed, composer, notifications, settings, profile edit).
 *
 * Read-only public surfaces (post detail, public profile, explore) stay
 * outside `ProtectedRoute` so deep links keep working for unauthenticated
 * visitors.
 */

// Layouts — small but split out so changing the feed page doesn't
// invalidate the cached settings layout chunk.
const MainLayout = lazy(() => import("./components/layout/MainLayout.jsx"));
const SettingsLayout = lazy(
  () => import("./components/layout/SettingsLayout.jsx")
);

// Auth — visited at most once per session, perfect lazy candidates.
const Login = lazy(() => import("./pages/auth/Login.jsx"));
const Register = lazy(() => import("./pages/auth/Register.jsx"));
const VerifyEmailPending = lazy(() => import("./pages/auth/VerifyEmailPending.jsx"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail.jsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword.jsx"));

// Main app surfaces.
const LandingPage = lazy(() => import("./pages/landing/LandingPage.jsx"));
const FeedPage = lazy(() => import("./pages/feed/FeedPage.jsx"));
const ExplorePage = lazy(() => import("./pages/explore/ExplorePage.jsx"));
const CreatePostPage = lazy(() => import("./pages/post/CreatePostPage.jsx"));
const PostDetailPage = lazy(() => import("./pages/post/PostDetailPage.jsx"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage.jsx"));
const FollowersPage = lazy(() => import("./pages/profile/FollowersPage.jsx"));
const FollowingPage = lazy(() => import("./pages/profile/FollowingPage.jsx"));
const EditProfilePage = lazy(
  () => import("./pages/profile/EditProfilePage.jsx")
);
const NotificationsPage = lazy(
  () => import("./pages/notifications/NotificationsPage.jsx")
);
const SavedPostsPage = lazy(
  () => import("./pages/saved/SavedPostsPage.jsx")
);

// Settings — unlikely to be opened on the first visit, so isolating it
// keeps the feed bundle lean.
const AccountSettings = lazy(
  () => import("./pages/settings/AccountSettings.jsx")
);
const AppearanceSettings = lazy(
  () => import("./pages/settings/AppearanceSettings.jsx")
);
const NotificationSettings = lazy(
  () => import("./pages/settings/NotificationSettings.jsx")
);
const PrivacySettings = lazy(
  () => import("./pages/settings/PrivacySettings.jsx")
);

const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

/**
 * HomeRoute — branches the index route on auth state instead of forcing
 * unauthenticated visitors straight into `/login`. Signed-in users keep
 * landing on the feed (the historical home), while guests see the
 * marketing/preview landing page that doubles as a live tour of the
 * product (trending posts grid + sign-up CTAs).
 */
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  return user ? <FeedPage /> : <LandingPage />;
}

export default function App() {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary key={pathname}>
      <Suspense fallback={<Spinner fullScreen label="Loading page" />}>
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Guest only authentication routes */}
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Email verification flow surfaces (accessible without forced redirect) */}
      <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Main app layout with sidebars and navigation */}
      <Route element={<MainLayout />}>
        <Route index element={<HomeRoute />} />
        <Route path="explore" element={<ExplorePage />} />

        <Route
          path="posts/new"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route path="posts/:id" element={<PostDetailPage />} />

        <Route path="u/:username" element={<ProfilePage />} />
        <Route path="u/:username/followers" element={<FollowersPage />} />
        <Route path="u/:username/following" element={<FollowingPage />} />

        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="saved"
          element={
            <ProtectedRoute>
              <SavedPostsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <SettingsLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="account" replace />} />
        <Route path="account" element={<AccountSettings />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="privacy" element={<PrivacySettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
      </Route>
    </Routes>
  );
}
