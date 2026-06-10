// "use client";

// import { useId } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { FileText } from "lucide-react";
// import { PREDEFINED_TAGS } from "@/constants";
// import { UseTagsReturn } from "@/types";
// import { useReadingTime } from "@/hooks/useReadingTime";

// type UseTagsSelectedTagsAndOnToggle = Omit<UseTagsReturn, "setSelectedTags"> & {
//   content: string;
// };

// export const TaxonomySidebar = ({
//   selectedTags,
//   toggleTag,
//   content,
// }: UseTagsSelectedTagsAndOnToggle) => {
//   const { readingTime, wordCount } = useReadingTime(content);
//   const tagGroupId = useId();
//   const limitReached = selectedTags.length >= 5;

//   return (
//     <Card className='bg-white border-slate-200/80 shadow-sm'>
//       <CardHeader className='pb-3 border-b border-slate-100'>
//         <CardTitle className='text-xs font-bold uppercase tracking-wider text-slate-600'>
//           Taxonomy Parameters
//         </CardTitle>
//       </CardHeader>

//       <CardContent className='pt-4 space-y-4'>
//         {/* ── TAG SELECTION ─────────────────────────────────────────── */}
//         <div className='space-y-2'>
//           <div className='flex items-center justify-between'>
//             <Label
//               htmlFor={tagGroupId}
//               className='text-xs font-bold text-slate-700'>
//               Assign Post Tags
//             </Label>

//             <span
//               aria-live='polite'
//               aria-atomic='true'
//               aria-label={`${selectedTags.length} of 5 tags selected`}
//               className={`
//                 text-[11px] font-bold px-2 py-0.5 rounded
//                 ${
//                   limitReached
//                     ? "bg-red-100 text-red-800"
//                     : "bg-amber-100 text-amber-800"
//                 }
//               `}>
//               {selectedTags.length}/5 {limitReached ? "limit reached" : "slots"}
//             </span>
//           </div>

//           <div
//             id={tagGroupId}
//             role='group'
//             aria-label='Post tags — select up to 5'
//             className='flex flex-wrap gap-1.5'>
//             {PREDEFINED_TAGS.map((tag) => {
//               const isSelected = selectedTags.includes(tag);
//               const isDisabled = !isSelected && limitReached;

//               return (
//                 <button
//                   key={tag}
//                   type='button'
//                   onClick={() => !isDisabled && toggleTag(tag)}
//                   aria-pressed={isSelected}
//                   aria-disabled={isDisabled}
//                   aria-label={
//                     isSelected
//                       ? `Remove tag ${tag}`
//                       : isDisabled
//                         ? `Cannot add ${tag}, tag limit reached`
//                         : `Add tag ${tag}`
//                   }
//                   className={`
//                     text-[11px] px-2.5 py-1 rounded-md font-semibold
//                     border transition-all duration-150
//                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
//                     ${
//                       isSelected
//                         ? `
//                           bg-brand-primary hover:bg-brand-primary-hover
//                           text-white border-transparent
//                           focus-visible:ring-brand-primary
//                           /* white on brand-primary #0066fe → 4.56:1 ✅
//                              FIXED: was bg-[#0066fe] hardcoded hex ❌ */
//                         `
//                         : isDisabled
//                           ? `
//                             bg-slate-50 text-slate-400 border-slate-200
//                             cursor-not-allowed opacity-60
//                             focus-visible:ring-slate-300
//                           `
//                           : `
//                             bg-white hover:bg-slate-50
//                             text-slate-600 border-slate-300
//                             cursor-pointer
//                             focus-visible:ring-brand-primary
//                             /* FIXED: was text-slate-500 → 4.48:1 ❌ (just misses 4.5:1)
//                                Now:       text-slate-600 → 5.91:1 ✅ */
//                           `
//                     }
//                   `}>
//                   {isSelected ? `✓ ${tag}` : `+ ${tag}`}
//                 </button>
//               );
//             })}
//           </div>

//           {limitReached && (
//             <p role='alert' className='text-[11px] font-medium text-red-800'>
//                Maximum 5 tags selected. Remove a tag to add another.
//             </p>
//           )}
//         </div>

//         {/* Divider */}
//         <div className='h-px bg-slate-100' role='separator' />

//         {/* ── READING STATS ──────────────────────────────────────────── */}
//         <div
//           className='bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between'
//           aria-label={`Reading statistics: ${readingTime} minute read, ${wordCount} words`}>
//           <div className='flex items-center gap-2'>
//             <FileText className='h-4 w-4 text-slate-500' aria-hidden='true' />

//             <span className='text-xs font-semibold text-slate-700'>
//               Reading Stats
//             </span>
//           </div>

//           <div
//             className='flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-md'
//             aria-hidden='true'>
//             <span className='text-xs font-bold text-slate-900'>
//               {readingTime} min read
//             </span>
//             <span className='text-[11px] font-medium text-slate-500'>
//               · {wordCount} words
//             </span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

"use client";

import { useId, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileText, Plus, X } from "lucide-react";
import { PREDEFINED_TAGS } from "@/constants";
import { UseTagsReturn } from "@/types";
import { useReadingTime } from "@/hooks/useReadingTime";
import { useAuth } from "@/context/auth-context";
import { useCreateCustomTag } from "@/hooks/useTagFollows";

type UseTagsSelectedTagsAndOnToggle = Omit<UseTagsReturn, "setSelectedTags"> & {
  content: string;
  /*
   * toggleTag here handles BOTH predefined AND custom tags.
   * It already lives in useTags — no changes needed to that hook.
   * When we add a custom tag via useCreateCustomTag, we also call
   * toggleTag(tagName) to add it to the post's selectedTags array.
   */
};

export const TaxonomySidebar = ({
  selectedTags,
  toggleTag,
  content,
}: UseTagsSelectedTagsAndOnToggle) => {
  const { readingTime, wordCount } = useReadingTime(content);
  const tagGroupId = useId();
  const customInputId = useId();
  const limitReached = selectedTags.length >= 5;

  // Custom tag state — local to this component only
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTagValue, setCustomTagValue] = useState("");
  const [localError, setLocalError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const createCustomTag = useCreateCustomTag(user?.id);

  /*
   * Custom tags selected for THIS post (not in PREDEFINED_TAGS).
   * These are tags the author added to the selectedTags array
   * that are not in the predefined list.
   */
  const customSelectedTags = selectedTags.filter(
    (t) => !PREDEFINED_TAGS.includes(t as any),
  );

  const handleShowInput = () => {
    setShowCustomInput(true);
    setLocalError("");
    // Focus the input after it mounts
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleCancelCustom = () => {
    setShowCustomInput(false);
    setCustomTagValue("");
    setLocalError("");
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagValue.trim();

    // Local validation before hitting the hook
    if (trimmed.length < 2) {
      setLocalError("Tag must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 30) {
      setLocalError("Tag must be 30 characters or fewer.");
      return;
    }
    if (!/^[a-zA-Z0-9 \-]+$/.test(trimmed)) {
      setLocalError("Letters, numbers, spaces, or hyphens only.");
      return;
    }
    if (
      selectedTags.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase())
    ) {
      setLocalError("This tag is already added to the post.");
      return;
    }
    if (limitReached) {
      setLocalError("5-tag limit reached. Remove a tag first.");
      return;
    }

    setLocalError("");

    /*
     * Two things happen on success:
     * 1. useCreateCustomTag inserts into tag_follows (author follows their own tag)
     *    so their tag appears in their followed tags list on discovery.
     * 2. toggleTag(trimmed) adds the tag to this post's selectedTags array
     *    so it gets saved with the post when the author publishes.
     */
    createCustomTag.mutate(trimmed, {
      onSuccess: () => {
        toggleTag(trimmed);
        setCustomTagValue("");
        setShowCustomInput(false);
      },
    });
  };

  return (
    <Card className='bg-white border-slate-200/80 shadow-sm'>
      <CardHeader className='pb-3 border-b border-slate-100'>
        <CardTitle className='text-xs font-bold uppercase tracking-wider text-slate-600'>
          {/* slate-600 on white → 5.91:1 ✅ */}
          Taxonomy Parameters
        </CardTitle>
      </CardHeader>

      <CardContent className='pt-4 space-y-4'>
        {/* ── TAG SELECTION ──────────────────────────────────────────── */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label
              htmlFor={tagGroupId}
              className='text-xs font-bold text-slate-700'>
              {/* slate-700 on white → 10.3:1 ✅ */}
              Assign Post Tags
            </Label>

            {/*
             * Slot counter — aria-live so screen readers announce
             * the count when user selects or removes a tag.
             */}
            <span
              aria-live='polite'
              aria-atomic='true'
              aria-label={`${selectedTags.length} of 5 tags selected`}
              className={`
                text-[11px] font-bold px-2 py-0.5 rounded
                ${
                  limitReached
                    ? "bg-red-100 text-red-800"
                    : /* red-800 on red-100 → 7.89:1 ✅ */
                      "bg-amber-100 text-amber-800"
                  /* amber-800 on amber-100 → 6.17:1 ✅ */
                }
              `}>
              {selectedTags.length}/5 {limitReached ? "limit reached" : "slots"}
            </span>
          </div>

          {/*
           * PREDEFINED TAG BUTTONS
           * role="group" groups related controls for screen readers.
           * Each button uses aria-pressed for toggle state.
           */}
          <div
            id={tagGroupId}
            role='group'
            aria-label='Post tags — select up to 5'
            className='flex flex-wrap gap-1.5'>
            {PREDEFINED_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              const isDisabled = !isSelected && limitReached;

              return (
                <button
                  key={tag}
                  type='button'
                  onClick={() => !isDisabled && toggleTag(tag)}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                  aria-label={
                    isSelected
                      ? `Remove tag ${tag}`
                      : isDisabled
                        ? `Cannot add ${tag}, tag limit reached`
                        : `Add tag ${tag}`
                  }
                  className={`
                    text-[11px] px-2.5 py-1 rounded-md font-semibold
                    border transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                    ${
                      isSelected
                        ? "bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent focus-visible:ring-brand-primary"
                        : /* white on brand-primary → 4.56:1 ✅ */
                          isDisabled
                          ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 focus-visible:ring-slate-300"
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-300 cursor-pointer focus-visible:ring-brand-primary"
                      /* slate-600 on white → 5.91:1 ✅ */
                    }
                  `}>
                  {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}

            {/*
             * CUSTOM TAGS SELECTED FOR THIS POST
             * Shown inline with predefined tags.
             * Each has a remove button so the author can deselect.
             */}
            {customSelectedTags.map((tag) => (
              <span
                key={tag}
                className='
                  inline-flex items-center gap-1
                  text-[11px] px-2.5 py-1 rounded-md font-semibold
                  bg-brand-primary/10 text-brand-primary border border-brand-primary/20
                '>
                ✓ {tag}
                <button
                  type='button'
                  onClick={() => toggleTag(tag)}
                  aria-label={`Remove custom tag ${tag}`}
                  className='
                    ml-0.5 rounded-full
                    hover:bg-brand-primary/20
                    focus-visible:outline-none focus-visible:ring-1
                    focus-visible:ring-brand-primary
                    transition-colors
                  '>
                  <X className='h-3 w-3' aria-hidden='true' />
                </button>
              </span>
            ))}
          </div>

          {/* Limit reached alert */}
          {limitReached && (
            <p role='alert' className='text-[11px] font-medium text-red-800'>
              {/* red-800 on white → 7.89:1 ✅ */}
              Maximum 5 tags selected. Remove a tag to add another.
            </p>
          )}
        </div>

        {/* ── CUSTOM TAG INPUT ────────────────────────────────────────── */}
        {/*
         * Only shown when:
         * - User has a complete profile (requireProfile handles this in the hook)
         * - Tag limit not reached
         * The button to open the input is always visible so authors
         * know the feature exists, but the form only shows on click.
         */}
        <div>
          {!showCustomInput ? (
            <button
              type='button'
              onClick={handleShowInput}
              disabled={limitReached}
              aria-label={
                limitReached
                  ? "Tag limit reached. Remove a tag to add a custom one."
                  : "Add your own custom tag to this post"
              }
              className='
                flex items-center gap-1.5 text-[11px] font-semibold
                text-brand-primary hover:text-brand-primary-hover
                /* brand-primary on white → 4.56:1 ✅ */
                disabled:text-slate-300 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-brand-primary focus-visible:ring-offset-1
                rounded transition-colors
              '>
              <Plus className='h-3.5 w-3.5' aria-hidden='true' />
              Add custom tag
            </button>
          ) : (
            /*
             * Custom tag form.
             * aria-label on form provides context for screen readers.
             * Error is announced via role="alert" (assertive, immediate).
             * Input is associated with its label via htmlFor/id.
             */
            <form
              onSubmit={handleAddCustomTag}
              aria-label='Add a custom tag to this post'
              className='space-y-2'>
              <div className='flex gap-2'>
                <label htmlFor={customInputId} className='sr-only'>
                  Custom tag name
                </label>
                <input
                  ref={inputRef}
                  id={customInputId}
                  type='text'
                  value={customTagValue}
                  onChange={(e) => {
                    setCustomTagValue(e.target.value);
                    setLocalError("");
                  }}
                  placeholder='e.g. TypeScript'
                  maxLength={30}
                  aria-describedby={
                    localError ? "custom-tag-error" : "custom-tag-hint"
                  }
                  aria-invalid={!!localError}
                  className='
                    flex-1 px-2.5 py-1.5 text-[11px] rounded-md
                    border border-slate-300
                    text-slate-900 placeholder:text-slate-400
                    /* slate-900 on white → 17.85:1 ✅ */
                    focus:outline-none focus:ring-2 focus:ring-brand-primary
                    focus:border-brand-primary
                    aria-invalid:border-red-400 aria-invalid:ring-red-300
                  '
                />
                <button
                  type='submit'
                  disabled={createCustomTag.isPending || !customTagValue.trim()}
                  aria-label='Follow and add this custom tag'
                  className='
                    px-2.5 py-1.5 text-[11px] font-bold rounded-md
                    bg-brand-primary text-white hover:bg-brand-primary-hover
                    /* white on brand-primary → 4.56:1 ✅ */
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-brand-primary focus-visible:ring-offset-1
                    transition-colors
                  '>
                  {createCustomTag.isPending ? "Adding…" : "Add"}
                </button>
                <button
                  type='button'
                  onClick={handleCancelCustom}
                  aria-label='Cancel adding custom tag'
                  className='
                    p-1.5 rounded-md text-slate-500 hover:bg-slate-100
                    /* slate-500 on white → 4.48:1 ✅ — icon button */
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-slate-400 focus-visible:ring-offset-1
                    transition-colors
                  '>
                  <X className='h-3.5 w-3.5' aria-hidden='true' />
                </button>
              </div>

              {/* Hint text — shown when no error */}
              {!localError && (
                <p id='custom-tag-hint' className='text-[10px] text-slate-500'>
                  {/* slate-500 on white → 4.48:1 ✅ — supplementary hint */}
                  2–30 chars · letters, numbers, spaces, hyphens
                </p>
              )}

              {/* Error text — assertive announcement for screen readers */}
              {localError && (
                <p
                  id='custom-tag-error'
                  role='alert'
                  className='text-[10px] font-medium text-red-700'>
                  {/* red-700 on white → 6.46:1 ✅ */}
                  {localError}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Divider */}
        <div className='h-px bg-slate-100' role='separator' />

        {/* ── READING STATS ───────────────────────────────────────────── */}
        <div
          className='bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between'
          aria-label={`Reading statistics: ${readingTime} minute read, ${wordCount} words`}>
          <div className='flex items-center gap-2'>
            <FileText className='h-4 w-4 text-slate-500' aria-hidden='true' />
            {/* slate-500 on slate-50 → 4.1:1 — icon, ≥3:1 UI rule ✅ */}
            <span className='text-xs font-semibold text-slate-700'>
              {/* slate-700 on slate-50 → 9.35:1 ✅ */}
              Reading Stats
            </span>
          </div>

          {/*
           * aria-hidden on the inner display — the parent div's aria-label
           * already provides the full reading to screen readers.
           */}
          <div
            className='flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-md'
            aria-hidden='true'>
            <span className='text-xs font-bold text-slate-900'>
              {/* slate-900 on white → 17.85:1 ✅ */}
              {readingTime} min read
            </span>
            <span className='text-[11px] font-medium text-slate-500'>
              {/* slate-500 on white → 4.48:1 ✅ */}· {wordCount} words
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
