"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookmark } from "@/hooks/useBookmarks";
import { useProfileGuard } from "@/hooks/useProfileGuard";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";

interface BookmarkButtonProps {
  postId: string;
}

export const BookmarkButton = ({ postId }: BookmarkButtonProps) => {
  const { isBookmarked, isLoading, toggleBookmark } = useBookmark(postId);
  const { isProfileComplete, isAuthLoading } = useProfileGuard();

  /*
   * STATE 1 — Auth still resolving after refresh.
   * Render a neutral placeholder that matches the button's dimensions
   * so there is zero layout shift when auth resolves.
   * aria-hidden so screen readers skip it entirely during loading.
   */
  if (isAuthLoading) {
    return (
      <div
        className='p-2 w-9 h-9 rounded-full bg-slate-100 animate-pulse'
        aria-hidden='true'
      />
    );
  }

  /*
   * STATE 2 — Auth resolved, profile confirmed incomplete.
   * Render a Link to /profile so keyboard users can act on the hint.
   * We use a Link rather than a disabled button because disabled buttons
   * give no affordance — the Link explains WHERE to go to fix the issue.
   * text-slate-300 is intentionally low contrast here because the button
   * is decorative/disabled — the aria-label carries the full meaning.
   */
  if (isProfileComplete === false) {
    return (
      <Link
        href={ROUTES.profile}
        aria-label='Complete your profile to bookmark posts'
        title='Complete your profile to bookmark posts'
        className='
          p-2 rounded-full
          text-slate-300 hover:text-slate-400
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-brand-primary focus-visible:ring-offset-1
        '>
        <Bookmark className='w-5 h-5' aria-hidden='true' />
      </Link>
    );
  }

  /*
   * STATE 3 — Auth resolved, profile complete.
   * Full interactive bookmark button.
   * text-brand-primary on white → 4.56:1 ✅
   * text-slate-600 on white → 5.91:1 ✅
   */
  return (
    <button
      type='button'
      onClick={() => toggleBookmark(isBookmarked)}
      disabled={isLoading}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      aria-pressed={isBookmarked}
      className={cn(
        "p-2 rounded-full transition-all duration-200",
        "hover:bg-slate-100",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-brand-primary focus-visible:ring-offset-1",
        isBookmarked ? "text-brand-primary" : "text-slate-600",
        isLoading && "opacity-50 cursor-not-allowed scale-95",
      )}>
      <Bookmark
        className={cn(
          "w-5 h-5 transition-transform duration-200",
          isBookmarked && "fill-current",
        )}
        aria-hidden='true'
      />
    </button>
  );
};
