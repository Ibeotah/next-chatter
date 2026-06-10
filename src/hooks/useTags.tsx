"use client";
import { UseTagsReturn } from "@/types";
import { useState } from "react";

export const useTags = (): UseTagsReturn => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Enforce the 5-tag rule here
  const toggleTag = (tagName: string): void => {
    setSelectedTags((prev): string[] => {
      if (prev.includes(tagName))
        return prev.filter((t): boolean => t !== tagName);
      if (prev.length >= 5) return prev; // Limit reached
      return [...prev, tagName];
    });
  };

  return { selectedTags, toggleTag, setSelectedTags };
};
