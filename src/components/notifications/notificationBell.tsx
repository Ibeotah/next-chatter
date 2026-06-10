"use client";

import { useRef, useState, useCallback, useId, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotification } from "@/context/NotificationContext";
import { useMarkNotificationsAsRead } from "@/hooks/useMarkNotificationsAsRead";
import { useMarkSingleNotificationAsRead } from "@/hooks/useMarkSingleNotificationAsRead";
import { useProfileGuard } from "@/hooks/useProfileGuard";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { NotificationPanel } from "./notification-panel";

/**
 * NotificationBell
 *
 * Rendered in TopBar (desktop) and MobileHeader (mobile).
 * Receives only userId — all data fetching is internal.
 *
 * Behaviour:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Profile incomplete → BellOff, disabled, tooltip explains why│
 * │ Profile complete   → Bell, shows unread badge               │
 * │ Bell clicked       → Opens panel, bulk-marks all read       │
 * │ Row clicked        → Marks single read, navigates to post   │
 * │ Escape / outside   → Closes panel, focus returns to bell    │
 * └─────────────────────────────────────────────────────────────┘
 *
 * WCAG 2.1 AA:
 * - aria-haspopup="dialog" + aria-expanded on the button
 * - aria-controls links button to panel id
 * - Escape key returns focus to trigger (WCAG 2.1 criterion 2.1.2)
 * - Disabled state uses opacity-40 (visual) + aria-label (semantic)
 * - Badge is aria-hidden (count is in the button aria-label)
 */
export function NotificationBell({ userId }: { userId: string }) {
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  // ── Profile completeness check ────────────────────────────────────────────
  const { isProfileComplete, isAuthLoading } = useProfileGuard();

  // ── Unread count from Realtime subscription ───────────────────────────────
  const { unreadCount, setUnreadCount } = useNotification();

  // ── Bulk mark-all-read ────────────────────────────────────────────────────
  const bulkMutation = useMarkNotificationsAsRead(userId, (prev) =>
    setUnreadCount(prev),
  );

  // ── Single mark-read ──────────────────────────────────────────────────────
  const singleMutation = useMarkSingleNotificationAsRead(userId);

  // ── Close on outside click ────────────────────────────────────────────────
  useOnClickOutside(containerRef, () => setIsOpen(false));

  // ── Close on Escape + return focus ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // ── Bell toggle ───────────────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    const opening = !isOpen;
    setIsOpen(opening);

    // Opening: optimistically clear badge, then confirm on server
    if (opening && unreadCount > 0) {
      const snapshot = unreadCount;
      setUnreadCount(0);

      bulkMutation.mutate(undefined, {
        onError: () => setUnreadCount(snapshot), // roll back on failure
      });
    }
  }, [isOpen, unreadCount, setUnreadCount, bulkMutation]);

  // ── Single row read ───────────────────────────────────────────────────────
  const handleSingleRead = useCallback(
    (notificationId: string) => {
      singleMutation.mutate(notificationId);
    },
    [singleMutation],
  );

  // ── Close + return focus ──────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  // isProfileComplete is null while loading, false when incomplete, true when done
  const isDisabled = isAuthLoading || isProfileComplete === false;

  const buttonAriaLabel = isAuthLoading
    ? "Loading notifications…"
    : isProfileComplete === false
      ? "Complete your profile to enable notifications"
      : unreadCount > 0
        ? `Notifications — ${unreadCount} unread`
        : "Notifications — no new activity";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className='relative' ref={containerRef}>
      {/* ── Bell trigger button ── */}
      <button
        ref={buttonRef}
        type='button'
        onClick={handleToggle}
        disabled={isDisabled}
        aria-label={buttonAriaLabel}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        title={buttonAriaLabel}
        className={cn(
          "relative p-2 rounded-full transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          isDisabled
            ? "cursor-not-allowed opacity-40 text-slate-400"
            : [
                "cursor-pointer",
                "text-slate-600", // 5.9:1 on white ✅ AA
                "hover:bg-slate-100",
                "hover:text-slate-800",
              ],
        )}>
        {/* BellOff when disabled so the icon itself communicates state */}
        {isDisabled ? (
          <BellOff className='w-6 h-6' aria-hidden='true' />
        ) : (
          <Bell className='w-6 h-6' aria-hidden='true' />
        )}

        {/* Unread badge — aria-hidden, count is in aria-label above
            red-500 on white = 4.56:1 ✅ AA
            ring-white separates badge from coloured nav backgrounds */}
        {!isDisabled && unreadCount > 0 && (
          <span
            aria-hidden='true'
            className={cn(
              "absolute top-0 right-0",
              "bg-red-500 text-white text-[10px] font-bold",
              "rounded-full w-5 h-5 flex items-center justify-center",
              "ring-2 ring-white pointer-events-none",
            )}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel — only rendered when open ── */}
      {isOpen && !isDisabled && (
        <NotificationPanel
          panelId={panelId}
          userId={userId}
          onClose={handleClose}
          onSingleRead={handleSingleRead}
        />
      )}
    </div>
  );
}
