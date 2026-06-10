"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const SidebarNav = lazy(() =>
  import("./sidebar-nav").then((m) => ({ default: m.SidebarNav })),
);
const MobileHeader = lazy(() =>
  import("./mobile-header").then((m) => ({ default: m.MobileHeader })),
);
const MobileBottomNav = lazy(() =>
  import("./mobile-bottom-nav").then((m) => ({ default: m.MobileBottomNav })),
);
const TopBar = lazy(() =>
  import("./top-bar").then((m) => ({ default: m.TopBar })),
);

// Lightweight inline fallback — renders instantly from the initial bundle.
// Matches the dimensions of each nav region to prevent layout shift (CLS).
function SidebarSkeleton() {
  return (
    <div
      className='hidden md:flex flex-col shrink-0 sticky top-0 h-screen bg-brand-primary md:w-20 lg:w-64 z-40'
      aria-hidden='true'
    />
  );
}

function MobileHeaderSkeleton() {
  return (
    <div
      className='sticky top-0 z-40 w-full bg-white border-b border-slate-200 px-4 py-3 h-[57px] md:hidden'
      aria-hidden='true'
    />
  );
}

function TopBarSkeleton() {
  return (
    <div
      className='hidden md:flex h-20 bg-white border-b border-slate-200/80'
      aria-hidden='true'
    />
  );
}

export default function MainNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    setMounted(true);
    setInputValue(searchParams.get("search") || "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search routing
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentSearchInUrl = searchParams.get("search") || "";
    if (inputValue.trim() === currentSearchInUrl.trim()) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (inputValue.trim()) {
        params.set("search", inputValue);
      } else {
        params.delete("search");
      }
      if (pathname === "/discovery") {
        router.replace(`/discovery?${params.toString()}`);
      } else if (inputValue.trim()) {
        router.push(`/discovery?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, router, pathname, searchParams]);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      window.location.href = "/";
    } catch (_error) {
      // console.error("Sign out failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!mounted || loading || isLoggingOut) {
    return (
      <div
        className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2'
        role='status'
        aria-live='polite'
        aria-label={isLoggingOut ? "Signing out" : "Loading workspace"}>
        <Loader2
          className='h-8 w-8 animate-spin text-brand-primary'
          aria-hidden='true'
        />
        <p className='text-xs text-text-muted-accessible font-medium tracking-wide'>
          {isLoggingOut
            ? "Signing out of workspace..."
            : "Syncing workspace core..."}
        </p>
      </div>
    );
  }

  const userDisplayName = profile?.name || user?.email || "Chatter User";
  const userAvatarUrl = profile?.avatar_url || undefined;
  const userInitials = profile?.name
    ? profile.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "N/A";

  return (
    <>
      <a
        href='#main-content'
        className='
          sr-only focus:not-sr-only
          focus:fixed focus:top-4 focus:left-4 focus:z-50
          focus:px-4 focus:py-2 focus:rounded-lg
          focus:bg-brand-primary focus:text-white
          focus:text-sm focus:font-bold
          focus:shadow-lg focus:outline-none
          focus-visible:ring-2 focus-visible:ring-white
        '>
        Skip to main content
      </a>

      <div className='flex min-h-screen flex-col md:flex-row'>
        {/* Mobile header — lazy loaded, skeleton prevents layout shift */}
        <Suspense fallback={<MobileHeaderSkeleton />}>
          <MobileHeader
            pathname={pathname}
            userDisplayName={userDisplayName}
            userAvatarUrl={userAvatarUrl}
            userInitials={userInitials}
            userId={user?.id}
            onSignOut={handleSignOut}
            inputValue={inputValue}
            onInputChange={setInputValue}
          />
        </Suspense>

        {/* Desktop sidebar — lazy loaded, skeleton holds the space */}
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarNav
            pathname={pathname}
            userDisplayName={userDisplayName}
            userAvatarUrl={userAvatarUrl}
            userInitials={userInitials}
            onSignOut={handleSignOut}
          />
        </Suspense>

        <main
          id='main-content'
          className='flex-1 flex flex-col min-w-0 pb-20 md:pb-0'
          tabIndex={-1}>
          {/* Top search bar — lazy loaded */}
          <Suspense fallback={<TopBarSkeleton />}>
            <TopBar
              userId={user?.id}
              inputValue={inputValue}
              onInputChange={setInputValue}
            />
          </Suspense>

          <div className='flex-1 p-4 md:p-8 overflow-y-auto'>{children}</div>
        </main>

        {/* Mobile bottom nav — lazy loaded, fixed position so no layout shift */}
        <Suspense fallback={null}>
          <MobileBottomNav pathname={pathname} />
        </Suspense>
      </div>
    </>
  );
}
