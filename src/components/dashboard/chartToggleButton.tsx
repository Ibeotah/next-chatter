"use client";

import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

interface ChartToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  hasData: boolean;
}

export function ChartToggleButton({ isActive, onClick, hasData }: ChartToggleButtonProps) {
  if (!hasData) {
    return null; // Don't show button if user has no posts
  }

  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors
          bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300
          focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        aria-expanded={isActive}
      >
        <BarChart3 className="w-4 h-4" />
        <span>{isActive ? 'Hide Comparison Charts' : 'View Comparison Charts'}</span>
        {isActive ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}