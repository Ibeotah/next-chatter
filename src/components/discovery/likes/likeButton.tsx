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

  if (isAuthLoading) {
    return (
      <div className='flex items-center gap-2' aria-hidden='true'>
        <div className='w-5 h-5 rounded-full bg-slate-100 animate-pulse' />
        <span className='text-sm font-medium text-slate-300'>{likeCount}</span>
      </div>
    );
  }

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
        <span className='text-sm font-medium text-slate-400'>{likeCount}</span>
      </Link>
    );
  }

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
