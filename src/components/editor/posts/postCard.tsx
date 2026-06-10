"use client";

import { Button } from "@/components/ui/button";
import { useDeletePost, usePostActions } from "./usePostActions";
import {
  Archive,
  CheckCircle2,
  FileText,
  Trash2Icon,
  Pencil,
} from "lucide-react";
import { EditingPost, PostStatus } from "@/types";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    status: PostStatus;
    tags?: string[];
  };
  isBeingEdited: boolean;
  onEditPost: (post: NonNullable<EditingPost>) => void;
}

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-amber-100 text-amber-800",
};

export const PostCard = ({
  post,
  isBeingEdited,
  onEditPost,
}: PostCardProps) => {
  const { updatePostFields, loading } = usePostActions();
  const { deletePost, deleting } = useDeletePost();

  return (
    <article
      aria-label={`Post: ${post.title}, status ${post.status}`}
      aria-current={isBeingEdited ? "true" : undefined}
      className={`
        flex flex-col h-full w-full
        bg-white rounded-xl border shadow-sm
        transition-all duration-200
        focus-within:ring-2 focus-within:ring-brand-primary/30
        ${
          isBeingEdited
            ? "border-brand-primary ring-2 ring-brand-primary/20"
            : "border-slate-200 hover:shadow-md hover:border-slate-300"
        }
      `}>
      {/* HEADER + CONTENT (unchanged) */}
      <header className='px-5 pt-5 pb-3 space-y-2'>
        <span
          className={`
            self-start inline-flex px-2.5 py-0.5 rounded-full
            text-[11px] font-bold uppercase tracking-wide
            ${STATUS_STYLES[post.status]}
          `}
          aria-label={`Status: ${post.status}`}>
          {post.status}
        </span>

        <h3 className='text-base font-bold text-slate-900 line-clamp-2 leading-snug'>
          {post.title}
        </h3>
      </header>

      <div className='flex-1 px-5 pb-4'>
        <p className='text-sm text-slate-600 leading-relaxed line-clamp-3'>
          {post.content.replace(/<[^>]*>/g, "").substring(0, 120)}
          {post.content.length > 120 && "…"}
        </p>
      </div>

      {/* ── FOOTER WITH RESPONSIVE 2x2 GRID ───────────────────────────── */}
      <footer className='px-5 py-4 border-t border-slate-100'>
        {/*
         
        */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          {/* Edit Post - Primary action */}
          <Button
            size='sm'
            onClick={() =>
              onEditPost({
                id: post.id,
                title: post.title,
                content: post.content,
                status: post.status,
                tags: post.tags ?? [],
              })
            }
            disabled={isBeingEdited}
            aria-pressed={isBeingEdited}
            aria-label={
              isBeingEdited
                ? `Currently editing ${post.title}`
                : `Edit ${post.title}`
            }
            className='bg-brand-primary hover:bg-brand-primary-hover text-white cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-60'>
            <Pencil className='h-4 w-4 mr-2' aria-hidden='true' />
            {isBeingEdited ? "Editing…" : "Edit Post"}
          </Button>

          {/* Status actions (only show relevant ones) */}
          {post.status !== "draft" && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => updatePostFields(post.id, { status: "draft" })}
              disabled={loading}
              aria-label={`Move ${post.title} to draft`}
              className='cursor-pointer text-slate-700 border-slate-300 bg-white hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400'>
              <FileText className='h-4 w-4 mr-2' aria-hidden='true' />
              Draft
            </Button>
          )}

          {post.status !== "published" && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => updatePostFields(post.id, { status: "published" })}
              disabled={loading}
              aria-label={`Publish ${post.title}`}
              className='cursor-pointer text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-600'>
              <CheckCircle2 className='h-4 w-4 mr-2' aria-hidden='true' />
              Publish
            </Button>
          )}

          {post.status !== "archived" && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => updatePostFields(post.id, { status: "archived" })}
              disabled={loading}
              aria-label={`Archive ${post.title}`}
              className='cursor-pointer text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-600'>
              <Archive className='h-4 w-4 mr-2' aria-hidden='true' />
              Archive
            </Button>
          )}

          {/* Delete - always last */}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => deletePost(post.id)}
            disabled={deleting}
            aria-label={`Delete ${post.title} permanently`}
            aria-busy={deleting}
            className='text-red-700 hover:text-red-800 hover:bg-red-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-600'>
            {deleting ? (
              <span className='animate-pulse' aria-live='polite'>
                Deleting…
              </span>
            ) : (
              <span className='flex items-center gap-1'>
                <Trash2Icon className='h-4 w-4 mr-1' aria-hidden='true' />
                Delete
              </span>
            )}
          </Button>
        </div>
      </footer>
    </article>
  );
};
