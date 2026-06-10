"use client";

import {
  useComments,
  useAddComment,
  useDeleteComment,
} from "@/hooks/useComments";
import CommentItem from "./commentItem";
import { CommentNode } from "@/types";
import { useState } from "react";
import AddCommentForm from "./addCommentForm";

// This is the main comment container for a post. It loads comments, lets users add new ones or replies, and lets them delete their own comments. It delegates the actual rendering of each comment (and its replies) to the CommentItem component.
export default function CommentSection({ postId }: { postId: string }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const { data: comments, isLoading } = useComments(postId);
  const { mutate: addComment } = useAddComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);
  //   const handleSubmit = (content: string, parentId?: string) => {
  //     addComment({ content, parentId });
  //   };
  const handleSubmit = (content: string, parentId?: string) => {
    setReplyingToId(parentId ?? null);

    addComment(
      { content, parentId },
      {
        onSettled: () => setReplyingToId(null),
      },
    );
  };

  //   const handleDelete = (commentId: string) => {
  //     deleteComment(commentId);
  //   };
  const handleDelete = (commentId: string) => {
    setDeletingId(commentId);
    deleteComment(commentId, {
      onSettled: () => setDeletingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className='animate-pulse border-l-2 border-gray-200 pl-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-8 h-8 bg-gray-300 rounded-full' />
              <div className='space-y-1'>
                <div className='w-24 h-3 bg-gray-300 rounded' />
                <div className='w-32 h-2 bg-gray-200 rounded' />
              </div>
            </div>
            <div className='w-3/4 h-3 bg-gray-300 rounded' />
          </div>
        ))}
      </div>
    );
  }
  // @ts-ignore
  if (!comments || comments.length === 0) {
    return (
      <div className='space-y-4'>
        <p className='text-sm text-gray-500'>
          No comments yet. Start the conversation.
        </p>

        <AddCommentForm onSubmit={(content) => handleSubmit(content)} />
      </div>
    );
  }

  return (
    <div>
      {/* Render comments */}
      {/* @ts-ignore - Temporary: will fix type inference later */}
      {comments?.map((comment: CommentNode) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onDelete={handleDelete}
          // onReply={(content) => handleSubmit(content, comment.id)}
          onReply={handleSubmit}
          replyingToId={replyingToId}
          deletingId={deletingId}
        />
      ))}
    </div>
  );
}
