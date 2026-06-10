// components/discovery/mobile-topics-drawer.tsx
"use client";

import { useState, useId, useEffect, useRef } from "react";
import { Tags, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExploreTopics } from "./exploreTopics";

interface MobileTopicsDrawerContext {
  followedTags: string[];
  activeTag: string;
  setActiveTag: (tag: string) => void;
  handleTagToggle: (tag: string) => void;
  isTagMutationPending: boolean;
  isProfileComplete: boolean | null;
}

interface MobileTopicsDrawerProps {
  context: MobileTopicsDrawerContext;
}

 function MobileTopicsDrawer({ context }: MobileTopicsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // How many tags are currently followed — shown in the trigger badge
  const followedCount = context.followedTags.length;

  return (
    <div className="w-full">
      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={drawerId}
        className={cn(
          "w-full flex items-center justify-between",
          "px-4 py-3 rounded-xl border",
          "bg-white border-slate-200 shadow-sm",
          "transition-colors duration-150",
          "hover:bg-slate-50 hover:border-slate-300",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          "cursor-pointer",
        )}
      >
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          {/* slate-800 on white = 10.7:1 ✅ AAA */}
          <span className="text-sm font-semibold text-slate-800">
            Explore Topics
          </span>

          {/* Followed count badge */}
          {followedCount > 0 && (
            <span
              aria-label={`${followedCount} topics followed`}
              className="
                inline-flex items-center justify-center
                h-5 min-w-[1.25rem] px-1
                bg-brand-primary text-white
                text-[10px] font-bold rounded-full
              "
            >
              {followedCount}
            </span>
          )}
        </div>

        {/* Chevron rotates when open */}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {/* ── Collapsible drawer panel ── */}
      
      <div
        id={drawerId}
        role="region"
        aria-label="Topics to explore and follow"
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[70vh] mt-3" : "max-h-0",
        )}
      >
        {/*
         * Inner scroll container so the drawer never exceeds 70vh.
         * ExploreTopics is reused directly — same component as desktop.
         */}
        <div className="overflow-y-auto max-h-[70vh] rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <ExploreTopics context={context} />
        </div>
      </div>
    </div>
  );
}