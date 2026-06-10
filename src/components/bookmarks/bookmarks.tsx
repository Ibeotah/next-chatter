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

  if (isAuthLoading) {
    return (
      <div
        className='p-2 w-9 h-9 rounded-full bg-slate-100 animate-pulse'
        aria-hidden='true'
      />
    );
  }

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
