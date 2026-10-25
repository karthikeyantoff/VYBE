import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from "../../context/useAuth.js";
import { useOnlineStatus } from "../../hooks/useOnlineStatus.js";
import Banner from "../ui/Banner.jsx";
import Spinner from "../ui/Spinner.jsx";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import LeftSidebar from "./LeftSidebar.jsx";
import RightSidebar from "./RightSidebar.jsx";

/**
 * MainLayout — 3-column responsive layout for Pulse:
 *   Left: persistent navigation rail on desktop (lg:block).
 *   Center: reading width timeline (max-w-2xl mx-auto).
 *   Right: discovery rail with who-to-follow & trending (xl:block).
 *   Mobile/Tablet: top navbar & mobile bottom tab bar.
 */
export default function MainLayout() {
  const { user } = useAuth();
  const online = useOnlineStatus();

  return (
    <div className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <ScrollToTop />

      <a
        href="#main"
        className="sr-only-focusable absolute left-2 top-2 z-50 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-md focus:outline-none"
      >
        Skip to content
      </a>

      <Navbar />

      {!online && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-3 sm:px-6">
          <Banner variant="warning">
            You&apos;re offline — some features may not work.
          </Banner>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl justify-center gap-6 px-4 py-6 sm:px-6">
        {/* Left column — Primary navigation for desktop */}
        {user && (
          <div className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 lg:block">
            <LeftSidebar />
          </div>
        )}

        {/* Center column — Main timeline content */}
        <main
          id="main"
          tabIndex={-1}
          className="w-full max-w-2xl flex-1 min-w-0 pb-20 md:pb-6 focus:outline-none"
        >
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center">
                <Spinner label="Loading page" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>

        {/* Right column — Discovery & Suggestions for extra-large screens */}
        {user && (
          <div className="sticky top-20 hidden h-[calc(100vh-6rem)] w-80 shrink-0 xl:block">
            <RightSidebar />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
