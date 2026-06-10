"use client";

import { useState } from "react";

interface Props {
  onSubmit: (content: string) => void;
  isPending?: boolean;
}

export default function AddCommentForm({ onSubmit, isPending }: Props) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
  };

  return (
    <div className='mb-6'>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder='Write a comment...'
        className='w-full p-3 border rounded'
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className='mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50'>
        {isPending ? "Posting..." : "Post Comment"}
      </button>
    </div>
  );
}
