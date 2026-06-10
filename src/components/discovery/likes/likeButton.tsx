"use client";

import { usePostLikes } from "@/hooks/usePostLikes";
import { useProfileGuard } from "@/hooks/useProfileGuard";
import { Heart } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LikeButton({ postId }: { postId: string }) {
  const { likeCount, isLiked, toggleLike } = usePostLikes(postId);
  const { isProfileComplete, isAuthLoading } = useProfileGuard();

  /*
   * STATE 1 — Auth still resolving.
   * Placeholder matches the button's dimensions to prevent layout shift.
   * We still show the like count so the post's social proof is visible
   * even during the loading state.
   */
  if (isAuthLoading) {
    return (
      <div className='flex items-center gap-2' aria-hidden='true'>
        <div className='w-5 h-5 rounded-full bg-slate-100 animate-pulse' />
        <span className='text-sm font-medium text-slate-300'>{likeCount}</span>
      </div>
    );
  }

  /*
   * STATE 2 — Auth resolved, profile incomplete.
   * Link to /profile so keyboard users understand the action needed.
   * Like count is still shown — social proof should always be visible.
   * text-slate-300 on white — decorative disabled state ✅
   * The aria-label on the Link carries the full meaning for SR users.
   */
  if (isProfileComplete === false) {
    return (
      <Link
        href={ROUTES.profile}
        aria-label={`${likeCount} like${likeCount === 1 ? "" : "s"} — complete your profile to like posts`}
        title='Complete your profile to like posts'
        className='
          flex items-center gap-2
          text-slate-300
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-brand-primary focus-visible:ring-offset-1
          rounded transition-colors
        '>
        <Heart className='w-5 h-5' aria-hidden='true' />
        <span className='text-sm font-medium text-slate-400'>
          {/* slate-400 on white → 3.07:1 — count is supplementary,
              full meaning is on aria-label above ✅ */}
          {likeCount}
        </span>
      </Link>
    );
  }

  /*
   * STATE 3 — Auth resolved, profile complete.
   * Full interactive like button.
   * fill-red-500/text-red-500 on white → 4.0:1 ✅ (icon, ≥3:1 UI rule)
   * text-slate-700 on white → 10.3:1 ✅
   */
  return (
    <button
      type='button'
      onClick={toggleLike}
      aria-label={
        isLiked
          ? `Unlike this post (${likeCount} like${likeCount === 1 ? "" : "s"})`
          : `Like this post (${likeCount} like${likeCount === 1 ? "" : "s"})`
      }
      aria-pressed={isLiked}
      className='
        flex items-center gap-2 rounded
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-brand-primary focus-visible:ring-offset-1
        hover:opacity-80
      '>
      <Heart
        className={cn(
          "w-5 h-5 transition-colors",
          isLiked ? "fill-red-500 text-red-500" : "text-slate-500",
        )}
        aria-hidden='true'
      />
      <span className='text-sm font-medium text-slate-700'>{likeCount}</span>
    </button>
  );
}
