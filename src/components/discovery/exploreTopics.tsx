"use client";

import { PREDEFINED_TAGS } from "@/constants";

interface ExploreTopicsContext {
  followedTags: string[];
  activeTag: string;
  setActiveTag: (tag: string) => void;
  handleTagToggle: (tag: string) => void;
  isTagMutationPending: boolean;
  isProfileComplete: boolean | null;
}

interface ExploreTopicsProps {
  context: ExploreTopicsContext;
}

export function ExploreTopics({ context }: ExploreTopicsProps) {
  const {
    followedTags,
    activeTag,
    setActiveTag,
    handleTagToggle,
    isTagMutationPending,
    isProfileComplete,
  } = context;

  return (
    <aside aria-label='Explore topics' className='w-full min-w-0'>
      <div className='bg-slate-50 border border-slate-200 rounded-xl p-5 sticky top-6 shadow-sm overflow-hidden'>
        <h2 className='font-bold text-slate-900 text-base mb-4'>
          Explore Topics
        </h2>

        {/* Scrollable tag list — prevents card overflow on long tag lists */}
        <div
          className='max-h-[60vh] overflow-y-auto pr-1 space-y-2.5'
          role='list'
          aria-label='Available topics'>
          {PREDEFINED_TAGS.map((topic) => {
            const isTopicFollowed = followedTags.includes(topic);
            const isFilteringThisTopic = activeTag === topic;

            return (
              <div
                key={topic}
                role='listitem'
                className='flex items-center gap-1 w-full bg-white border border-slate-200 rounded-xl overflow-hidden p-1 shadow-sm'>
                {/*
                 * Filter button — read-only, always enabled.
                 * flex-1 with min-w-0 + truncate so long tag names
                 * never push the Follow button off screen.
                 */}
                <button
                  type='button'
                  onClick={() =>
                    setActiveTag(isFilteringThisTopic ? "" : topic)
                  }
                  aria-pressed={isFilteringThisTopic}
                  aria-label={
                    isFilteringThisTopic
                      ? `Remove filter: ${topic}`
                      : `Filter feed by ${topic}`
                  }
                  className={`
                    flex-1 min-w-0 px-3 py-1.5 text-xs font-semibold
                    text-left rounded-lg transition-all cursor-pointer truncate
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-brand-primary focus-visible:ring-offset-1
                    ${
                      isFilteringThisTopic
                        ? "bg-brand-primary text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                  `}>
                  {topic}
                </button>

                {/*
                 * Follow button — shrink-0 so it never wraps or disappears.
                 * Disabled when profile is incomplete or mutation is pending.
                 */}
                <button
                  type='button'
                  onClick={() => handleTagToggle(topic)}
                  disabled={isTagMutationPending || !isProfileComplete}
                  aria-pressed={isTopicFollowed}
                  aria-label={
                    !isProfileComplete
                      ? `Complete your profile to follow ${topic}`
                      : isTopicFollowed
                        ? `Unfollow ${topic}`
                        : `Follow ${topic}`
                  }
                  title={
                    !isProfileComplete
                      ? "Complete your profile to follow topics"
                      : undefined
                  }
                  className={`
                    shrink-0 px-2.5 py-1.5 text-xs rounded-lg font-bold border
                    transition-all cursor-pointer whitespace-nowrap
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-offset-1
                    ${
                      isTopicFollowed
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 focus-visible:ring-emerald-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-400"
                    }
                  `}>
                  {isTopicFollowed ? "Following" : "+ Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
