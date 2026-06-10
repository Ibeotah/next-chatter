"use client";

import { lazy, Suspense, useState } from "react";
import { PREDEFINED_TAGS } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { useFollows } from "@/hooks/useFollows";
import { useFollowedTags, useToggleTagFollow } from "@/hooks/useTagFollows";
import { useProfileGuard } from "@/hooks/useProfileGuard";
import { useSearchParams } from "next/navigation";
import { ExploreTopics } from "@/components/discovery/exploreTopics";
import { MobileTopicsDrawer } from "@/components/discovery/mobile-topics-drawer";

const ForYouFeed = lazy(() => import("@/components/discovery/ForYouFeed"));
const TrendingFeed = lazy(() => import("@/components/discovery/TrendingFeed"));

function FeedSkeleton() {
  return (
    <div className='space-y-6' aria-busy='true' aria-label='Loading feed'>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className='w-full bg-white border border-slate-100 rounded-xl p-6 space-y-4 animate-pulse shadow-sm'
          aria-hidden='true'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-slate-200 rounded-full' />
            <div className='space-y-2 flex-1'>
              <div className='h-4 bg-slate-200 rounded w-1/4' />
              <div className='h-3 bg-slate-100 rounded w-1/6' />
            </div>
          </div>
          <div className='h-6 bg-slate-200 rounded w-3/4' />
          <div className='space-y-2'>
            <div className='h-4 bg-slate-100 rounded w-full' />
            <div className='h-4 bg-slate-100 rounded w-5/6' />
          </div>
        </div>
      ))}
      <span className='sr-only'>Loading feed, please wait…</span>
    </div>
  );
}

export default function DiscoveryPage() {
  const { user } = useAuth();
  const { isProfileComplete, isAuthLoading } = useProfileGuard();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"for-you" | "trending">("for-you");
  const [activeTag, setActiveTag] = useState("");
  const searchQuery = searchParams.get("search") || "";

  const {
    followedAuthors,
    followAuthor,
    unfollowAuthor,
    submittingFollowId,
    submittingUnfollowId,
  } = useFollows();

  const { data: followedTags = [] } = useFollowedTags(user?.id);

  /**
   * FIX: explicit type annotation on the mutation variable resolves
   * the implicit `any` circular reference TypeScript error.
   * The mutation is typed via useToggleTagFollow's return type,
   * but referencing handleTagToggle inside itself caused the circularity.
   * Solution: declare handleTagToggle as a typed const AFTER the mutation.
   */
  const toggleTagMutation = useToggleTagFollow(user?.id);

  const handleFollowToggle = (authorId: string): void => {
    if (followedAuthors.includes(authorId)) {
      unfollowAuthor(authorId);
    } else {
      followAuthor(authorId);
    }
  };

  // Explicit return type `: void` breaks the circular inference
  const handleTagToggle = (tagName: string): void => {
    const isFollowing = followedTags.includes(tagName);
    toggleTagMutation.mutate({ tagName, isFollowing });
  };

  const topicsContext = {
    followedTags,
    activeTag,
    setActiveTag,
    handleTagToggle,
    isTagMutationPending: toggleTagMutation.isPending,
    isProfileComplete,
  };

  const discoveryContext = {
    searchQuery,
    activeTag,
    setActiveTag,
    user,
    followedAuthors,
    handleFollowToggle,
    submittingFollowId,
    submittingUnfollowId,
    followedTags,
    handleTagToggle,
    isTagMutationPending: toggleTagMutation.isPending,
    isProfileComplete,
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      {/* Skip link */}
      <a
        href='#discovery-feed'
        className='
          sr-only focus:not-sr-only
          focus:fixed focus:top-4 focus:left-4 focus:z-50
          focus:px-4 focus:py-2 focus:rounded-md
          focus:bg-brand-primary focus:text-white
          focus:font-semibold focus:shadow-lg
          focus-visible:outline-none
        '>
        Skip to feed
      </a>

      {/* ── PAGE HEADER ── */}
      <header className='mb-6'>
        <h1 className='text-3xl font-bold text-slate-900 tracking-tight'>
          Discover
        </h1>
        <p className='text-slate-600 mt-2'>
          Explore the latest stories, perspectives, and ideas from creators
          everywhere.
        </p>
      </header>

      {/* ── PROFILE INCOMPLETE BANNER ── */}
      {!isAuthLoading && user && isProfileComplete === false && (
        <div
          role='alert'
          aria-live='polite'
          className='
            mb-6 flex flex-col sm:flex-row sm:items-center
            justify-between gap-3
            px-4 py-3 rounded-xl
            bg-amber-50 border border-amber-300
          '>
          <p className='text-sm font-medium text-amber-800'>
            Complete your profile to like, bookmark, follow authors, follow
            tags, and read stories.
          </p>
          <a
            href='/profile'
            className='
              shrink-0 self-start sm:self-auto
              text-xs font-bold px-4 py-2 rounded-lg
              bg-amber-800 text-white
              hover:bg-amber-900
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-amber-700 focus-visible:ring-offset-1
              transition-colors
            '>
            Set up profile →
          </a>
        </div>
      )}

      {/* ── TAB NAVIGATION ── */}
      <nav aria-label='Feed tabs' className='mb-8'>
        <div
          role='tablist'
          aria-label='Content feed tabs'
          className='flex border-b border-slate-200 items-center gap-2'>
          {(["for-you", "trending"] as const).map((tab) => {
            const label = tab === "for-you" ? "For you" : "Trending";
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type='button'
                role='tab'
                aria-selected={isActive}
                aria-controls='discovery-feed'
                onClick={() => setActiveTab(tab)}
                className={`
                  pb-3 text-sm font-semibold px-4 border-b-2
                  transition-colors cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand-primary focus-visible:ring-offset-1
                  rounded-t
                  ${
                    isActive
                      ? "border-brand-primary text-brand-primary"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }
                `}>
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/*
       * ── MOBILE TOPICS DRAWER TRIGGER ──────────────────────────────
       * Visible on mobile and tablet (< lg).
       * Replaced the hidden aside with an accessible drawer trigger
       * so users on small screens can still discover and follow topics.
       * Hidden on lg+ where the sidebar is always visible.
       */}
      <div className='lg:hidden mb-6'>
        <MobileTopicsDrawer context={topicsContext} />
      </div>

      {/* ── MAIN LAYOUT ── */}
      {/*
       * Grid breakdown:
       *   < lg  → single column (feed takes full width)
       *   ≥ lg  → 3 columns: feed = col-span-2, sidebar = col-span-1
       *
       * FIX for 1024px cutoff: changed from lg:grid-cols-3 with a
       * fixed aside to a proper 2-column layout at lg using col-span.
       * The aside now has min-w-0 to prevent grid blowout.
       */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
        {/* Feed */}
        <main
          id='discovery-feed'
          role='tabpanel'
          aria-label={
            activeTab === "for-you" ? "For you feed" : "Trending feed"
          }
          className='lg:col-span-2 space-y-6 min-w-0'>
          <Suspense fallback={<FeedSkeleton />}>
            {activeTab === "for-you" ? (
              <ForYouFeed context={discoveryContext} />
            ) : (
              <TrendingFeed context={discoveryContext} />
            )}
          </Suspense>
        </main>

        {/*
         * Desktop sidebar — hidden below lg.
         * min-w-0 prevents the grid column from overflowing its track
         * (the root cause of the 1024px cutoff visual).
         */}
        <div className='hidden lg:block min-w-0'>
          <ExploreTopics context={topicsContext} />
        </div>
      </div>
    </div>
  );
}
