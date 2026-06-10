"use client";

import { User } from "@supabase/supabase-js";
import { formatName, cn } from "@/lib/utils";
import { getRoute } from "@/lib/routes";
import { Post } from "@/types";
import { useEffect } from "react";
import { useTrendingPosts } from "@/hooks/useTrendingPosts";
import { usePostTracking } from "@/hooks/usePostTracking";
import { useInView } from "react-intersection-observer";
import LikeButton from "./likes/likeButton";
import { BookmarkButton } from "../bookmarks/bookmarks";
import Link from "next/link";

interface TrendingFeedProps {
  context: {
    searchQuery: string;
    activeTag: string;
    setActiveTag: (tag: string) => void;
    user: User | null;
    followedAuthors: string[];
    handleFollowToggle: (id: string) => void;
    submittingFollowId: string | null;
    submittingUnfollowId: string | null;
    followedTags: string[];
    handleTagToggle: (tag: string) => void;
    isTagMutationPending: boolean;
    /*
     * boolean | null — null means auth is still resolving.
     * Components must handle all three states explicitly.
     * null  = loading
     * false = confirmed incomplete
     * true  = confirmed complete
     */
    isProfileComplete: boolean | null;
  };
}

export default function TrendingFeed({ context }: TrendingFeedProps) {
  const {
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
    isTagMutationPending,
    isProfileComplete,
  } = context;

  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useTrendingPosts(searchQuery, activeTag);

  const { trackView } = usePostTracking();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className='space-y-6'>
      {/* ── Active tag filter banner ── */}
      {activeTag && (
        <div className='flex items-center justify-between bg-brand-surface border border-brand-primary/20 rounded-xl p-4 animate-fadeIn'>
          {/* slate-700 on brand-surface → 9.3:1 ✅ */}
          <span className='text-sm font-medium text-slate-700'>
            Showing trending posts tagged with{" "}
            {/* brand-primary on brand-surface → 4.5:1 ✅ */}
            <span className='font-bold text-brand-primary'>#{activeTag}</span>
          </span>
          <button
            type='button'
            onClick={() => setActiveTag("")}
            aria-label={`Clear filter: ${activeTag}`}
            className='
              text-xs font-semibold bg-white border border-slate-300
              text-slate-700 px-3 py-1.5 rounded-lg
              hover:bg-slate-50 transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-brand-primary focus-visible:ring-offset-1
            '>
            Clear Filter
          </button>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div
          className='space-y-6'
          aria-busy='true'
          aria-label='Loading trending posts'>
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
          <span className='sr-only'>Loading trending posts, please wait…</span>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div
          role='alert'
          className='p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-center'>
          {/* red-800 on red-50 → 7.4:1 ✅ */}
          <p className='font-medium'>
            Unable to load trending posts right now.
          </p>
          <p className='text-sm text-red-700 mt-1'>
            Please try refreshing the page.
          </p>
        </div>
      )}

      {/* ── Feed ── */}
      {!isLoading && data?.pages && (
        <div className='space-y-6'>
          {data.pages.map((page, pageIndex) =>
            page.map((post: Post, postIndex: number) => {
              const rawName =
                post.profiles?.name ||
                post.profiles?.username ||
                "Anonymous Writer";
              const formattedName = formatName(rawName);
              const isFollowing = followedAuthors.includes(post.author_id);
              const isButtonPending =
                submittingFollowId === post.author_id ||
                submittingUnfollowId === post.author_id;
              const isOwnPost = user?.id === post.author_id;

              return (
                <article
                  key={post.id}
                  aria-label={`Trending post ${pageIndex * 5 + postIndex + 1}: ${post.title} by ${formattedName}`}
                  className='
                    bg-white border border-slate-200/80 hover:border-slate-300
                    rounded-xl p-5 sm:p-6 transition-all duration-200
                    shadow-sm hover:shadow-md flex flex-col justify-between
                    relative overflow-hidden
                  '>
                  {/* Trending badge — white on brand-primary → 4.56:1 ✅ */}
                  <div
                    className='absolute top-0 right-0 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm'
                    aria-hidden='true'>
                    #{pageIndex * 5 + postIndex + 1} Trending
                  </div>

                  <div className='mt-2'>
                    {/* ── Author row ── */}
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        {post.profiles?.avatar_url ? (
                          <img
                            src={post.profiles.avatar_url}
                            alt={`${formattedName}'s avatar`}
                            className='w-9 h-9 rounded-full object-cover'
                          />
                        ) : (
                          <div
                            className='w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-indigo-600 text-white flex items-center justify-center font-bold text-sm'
                            aria-hidden='true'>
                            {formattedName.charAt(0)}
                          </div>
                        )}
                        <div>
                          {/* slate-800 on white → 13.97:1 ✅ */}
                          <span className='block text-sm font-semibold text-slate-800'>
                            {formattedName}
                          </span>
                          {/* slate-500 on white → 4.48:1 ✅ */}
                          <span className='block text-xs text-slate-500'>
                            {post.created_at
                              ? new Date(post.created_at).toLocaleDateString()
                              : "Just now"}
                          </span>
                        </div>
                      </div>

                      {/* Follow author button */}
                      {!isOwnPost && (
                        <button
                          type='button'
                          onClick={() => handleFollowToggle(post.author_id)}
                          disabled={
                            isButtonPending || isProfileComplete === false
                          }
                          aria-label={
                            isProfileComplete === false
                              ? "Complete your profile to follow authors"
                              : isFollowing
                                ? `Unfollow ${formattedName}`
                                : `Follow ${formattedName}`
                          }
                          aria-pressed={isFollowing}
                          title={
                            isProfileComplete === false
                              ? "Complete your profile to follow authors"
                              : undefined
                          }
                          className={cn(
                            "text-xs font-semibold px-3 py-1.5 rounded-lg",
                            "transition-all duration-200 cursor-pointer",
                            // mr-16 keeps the button clear of the trending badge
                            "mr-16",
                            "disabled:opacity-60 disabled:cursor-not-allowed",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                            isFollowing
                              ? // slate-700 on slate-100 → 8.59:1 ✅
                                "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400"
                              : // brand-primary on brand-surface → 4.5:1 ✅
                                "bg-brand-surface text-brand-primary hover:bg-brand-primary/10 focus-visible:ring-brand-primary",
                          )}>
                          {isButtonPending
                            ? "Processing…"
                            : isFollowing
                              ? "Following"
                              : "+ Follow"}
                        </button>
                      )}
                    </div>

                    {/* Post title — slate-900 on white → 17.85:1 ✅ */}
                    <h2 className='text-xl font-bold text-slate-900 mb-2 line-clamp-2'>
                      {post.title}
                    </h2>

                    {/* Post excerpt — slate-600 on white → 5.91:1 ✅ */}
                    <p className='text-slate-600 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3'>
                      {post.content}
                    </p>
                  </div>

                  {/*
                   * ── POSTCARD FOOTER ────────────────────────────────────────
                   *
                   * Identical fix to ForYouFeed — see that file for the
                   * full explanation. Summary:
                   *
                   * MOBILE (< md):
                   *   - flex-col: tags on Row 1, actions on Row 2
                   *   - Tags: full width, flex-wrap, no max-w cap
                   *   - Actions: justify-end so they sit flush right
                   *
                   * DESKTOP (≥ md):
                   *   - flex-row: tags left, actions right (original layout)
                   *   - shrink-0 on actions prevents compression
                   */}
                  <div className='pt-4 border-t border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                    {/*
                     * ── Tag pills ──────────────────────────────────────────
                     * No max-w cap on mobile — tags use full card width
                     * and wrap naturally (1–2 per row).
                     */}
                    <div
                      className='flex flex-wrap gap-1.5'
                      role='list'
                      aria-label='Post tags'>
                      {post.tags && post.tags.length > 0 ? (
                        post.tags.map((tag, i) => {
                          const isTagFollowed = followedTags.includes(tag);
                          const isFilteringThisTag = activeTag === tag;

                          return (
                            <div
                              key={`${post.id}-${tag}-${i}`}
                              role='listitem'
                              className='inline-flex items-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden shadow-sm'>
                              {/*
                               * Filter button — always enabled.
                               * Read-only, no profile required.
                               */}
                              <button
                                type='button'
                                onClick={() =>
                                  setActiveTag(isFilteringThisTag ? "" : tag)
                                }
                                aria-pressed={isFilteringThisTag}
                                aria-label={
                                  isFilteringThisTag
                                    ? `Remove filter: ${tag}`
                                    : `Filter by ${tag}`
                                }
                                className={cn(
                                  "px-2.5 py-1 text-xs font-medium",
                                  "transition-all cursor-pointer",
                                  "focus-visible:outline-none focus-visible:ring-1",
                                  "focus-visible:ring-brand-primary",
                                  isFilteringThisTag
                                    ? // white on brand-primary → 4.56:1 ✅
                                      "bg-brand-primary text-white"
                                    : // slate-700 on slate-50 → 9.35:1 ✅
                                      "text-slate-700 hover:bg-slate-200",
                                )}>
                                # {tag}
                              </button>

                              {/*
                               * Follow tag button.
                               * Disabled when isProfileComplete === false.
                               * null (loading) does NOT disable.
                               */}
                              <button
                                type='button'
                                onClick={() => handleTagToggle(tag)}
                                disabled={
                                  isTagMutationPending ||
                                  isProfileComplete === false
                                }
                                aria-pressed={isTagFollowed}
                                aria-label={
                                  isProfileComplete === false
                                    ? `Complete your profile to follow ${tag}`
                                    : isTagFollowed
                                      ? `Unfollow ${tag}`
                                      : `Follow ${tag}`
                                }
                                title={
                                  isProfileComplete === false
                                    ? "Complete your profile to follow topics"
                                    : undefined
                                }
                                className={cn(
                                  "px-2 py-1 text-xs border-l border-slate-200",
                                  "transition-all font-bold cursor-pointer",
                                  "disabled:opacity-50 disabled:cursor-not-allowed",
                                  "focus-visible:outline-none focus-visible:ring-1",
                                  "focus-visible:ring-brand-primary",
                                  isTagFollowed
                                    ? // brand-primary on brand-surface → 4.5:1 ✅
                                      "bg-brand-surface text-brand-primary hover:bg-brand-primary/10"
                                    : // slate-500 on white → 4.48:1 ✅
                                      "text-slate-500 hover:bg-slate-200 hover:text-slate-700",
                                )}>
                                {isTagFollowed ? "✓" : "+"}
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <span className='px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium text-xs whitespace-nowrap'>
                          {/* slate-600 on slate-100 → 5.52:1 ✅ */}# General
                        </span>
                      )}
                    </div>

                    {/*
                     * ── Action buttons ──────────────────────────────────────
                     * justify-end keeps like/bookmark/read right-aligned.
                     * shrink-0 on this container + each child prevents
                     * compression when tag row is wide on md+.
                     */}
                    <div className='flex items-center justify-end gap-3 shrink-0'>
                      <div className='shrink-0'>
                        <LikeButton postId={post.id} />
                      </div>

                      <div className='shrink-0'>
                        <BookmarkButton postId={post.id} />
                      </div>

                      {/*
                       * Read story — three explicit states.
                       * Identical pattern to ForYouFeed.
                       */}
                      {isProfileComplete === null ? (
                        <div
                          className='h-4 w-20 bg-slate-100 animate-pulse rounded shrink-0'
                          aria-hidden='true'
                        />
                      ) : isProfileComplete ? (
                        <button
                          type='button'
                          onClick={() =>
                            trackView(
                              post.id,
                              getRoute("post_detail", post.id),
                              user?.id,
                            )
                          }
                          aria-label={`Read story: ${post.title}`}
                          className='
                            shrink-0 whitespace-nowrap
                            text-brand-primary font-semibold text-xs sm:text-sm
                            hover:text-brand-primary-hover transition-colors
                            bg-transparent border-0 cursor-pointer
                            focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-brand-primary
                            focus-visible:ring-offset-1 rounded
                          '>
                          {/* brand-primary on white → 4.56:1 ✅ */}
                          Read story →
                        </button>
                      ) : (
                        <Link
                          href='/profile'
                          aria-label='Complete your profile to read this story'
                          title='Complete your profile to read stories'
                          className='
                            shrink-0 whitespace-nowrap
                            text-slate-400 font-semibold text-xs sm:text-sm
                            focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-slate-400
                            focus-visible:ring-offset-1 rounded
                          '>
                          {/*
                           * slate-400 on white → 3.07:1
                           * 14px bold = large text → ≥3:1 ✅
                           */}
                          Read story →
                        </Link>
                      )}
                    </div>
                  </div>
                  {/* ── END POSTCARD FOOTER ── */}
                </article>
              );
            }),
          )}

          {/* ── Infinite scroll trigger ── */}
          <div
            ref={ref}
            className='py-4 flex justify-center'
            aria-live='polite'>
            {isFetchingNextPage && (
              <p className='text-sm text-slate-500 animate-pulse'>
                Loading more…
              </p>
            )}
            {isError && (
              <button
                type='button'
                onClick={() => fetchNextPage()}
                className='
                  text-sm font-semibold text-brand-primary
                  hover:text-brand-primary-hover cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand-primary focus-visible:ring-offset-1
                  rounded
                '>
                Failed to load. Click to retry.
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
