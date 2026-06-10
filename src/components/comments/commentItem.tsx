"use client";

import { useState } from "react";
import type { CommentNode } from "@/types";
import { useAuth } from "@/context/auth-context";

interface CommentItemProps {
  comment: CommentNode;
  onDelete: (commentId: string) => void;
  onReply: (content: string, parentId: string) => void;
  isAdding?: boolean;
  deletingId?: string | null;
  replyingToId?: string | null;
}

export default function CommentItem({
  comment,
  onDelete,
  onReply,
  replyingToId,
  deletingId,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  // Check if current user owns this comment
  const isOwner = user?.id === comment.user_id;

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReply(replyContent, comment.id);
    setReplyContent("");
    setIsReplying(false);
  };
const isDeletingThis = deletingId === comment.id;
const isReplyingThis = replyingToId === comment.id;
  return (
    <div className='border-l-2 border-gray-200 pl-4 mb-4'>
      {/* Comment Header */}
      <div className='flex items-center gap-2 mb-2'>
        {comment.profiles?.avatar_url && (
          <img
            src={comment.profiles.avatar_url}
            alt={comment.profiles.name}
            className='w-8 h-8 rounded-full'
          />
        )}
        <div>
          <p className='font-medium'>{comment.profiles?.name || "Anonymous"}</p>
          <p className='text-xs text-gray-500'>
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Comment Content */}
      <p className='mb-3'>{comment.content}</p>

      {/* Action Buttons */}
      <div className='flex gap-2 mb-3'>
        <button
          onClick={() => setIsReplying(!isReplying)}
          className='text-sm text-blue-500 hover:underline'>
          {isReplying ? "Cancel" : "Reply"}
        </button>
        {isOwner && (
          <button
            onClick={() => onDelete(comment.id)}
            disabled={isDeletingThis}
            className='text-sm text-red-500 hover:underline'>
            {isDeletingThis ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {/* Reply Form (Conditional) */}
      {isReplying && (
        <div className='mb-4 ml-4'>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder='Write a reply...'
            className='w-full p-2 border rounded'
            rows={2}
          />
          <button
            onClick={handleReplySubmit}
             disabled={isReplyingThis}
            className='mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'>
            {isReplyingThis ? "Posting..." : "Post Reply"}
          </button>
        </div>
      )}

      {/* Render Replies (Nested) */}
      {comment.replies.length > 0 && (
        <div className='ml-6 mt-4 space-y-4'>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
