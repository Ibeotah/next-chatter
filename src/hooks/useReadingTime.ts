
"use client";
import { useMemo } from "react";

export const useReadingTime = (
  content: string,
): {
  readingTime: number;
  wordCount: number;
} => {
  const { wordCount, readingTime } = useMemo(() => {
    if (!content?.trim()) return { wordCount: 0, readingTime: 0 };

    // Count words (split by whitespace, filter empty strings)
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = words.length;

    // Calculate reading time (200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    return { wordCount, readingTime: Math.max(1, readingTime) }; // Minimum 1 min
  }, [content]);

  return { readingTime, wordCount };
};
