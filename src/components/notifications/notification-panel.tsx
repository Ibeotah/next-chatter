"use client";

import { Suspense } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationSkeleton } from "./notification-skeleton";
import { NotificationEmpty } from "./notification-empty";
import { NotificationRow } from "./notification-row";

interface NotificationPanelProps {
  panelId: string;
  userId: string;
  onClose: () => void;
  onSingleRead: (id: string) => void;
}

export function NotificationPanel({
  panelId,
  userId,
  onClose,
  onSingleRead,
}: NotificationPanelProps) {
  return (
    <div
      id={panelId}
      role='dialog'
      aria-label='Notifications'
      aria-modal='false'
      className={cn(
        // ── Positioning ──────────────────────────────────────────────
        // On screens ≥ 425px: anchor to the right of the bell button
        // On screens < 425px: fixed centred overlay so it never bleeds
        // off either edge of a narrow viewport (e.g. 320px)
        //
        // We use `fixed` + `left-1/2` + `-translate-x-1/2` below 425px
        // so the panel is always centred regardless of where the bell
        // sits in the header.
        //
        // Above 425px we switch back to `absolute right-0` so it hugs
        // the bell naturally.
        "fixed left-1/2 -translate-x-1/2 top-[4.5rem]", // < 425px: centred
        "min-[425px]:absolute min-[425px]:left-auto", // ≥ 425px: reset fixed
        "min-[425px]:translate-x-0 min-[425px]:right-0", // ≥ 425px: right-anchored
        "min-[425px]:top-auto min-[425px]:mt-2", // ≥ 425px: normal offset
        // ── Size ─────────────────────────────────────────────────────
        // w-[calc(100vw-2rem)] on tiny screens so it never overflows
        // the viewport. Fixed width on larger screens.
        "w-[calc(100vw-2rem)] min-[425px]:w-[22rem]",
        "max-h-[32rem]",
        // ── Appearance ───────────────────────────────────────────────
        "z-50",
        "bg-white border border-slate-200 rounded-xl shadow-xl",
        "flex flex-col overflow-hidden",
      )}>
      {/* ── Header ── */}
      <header className='flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0'>
        <h2 className='text-sm font-semibold text-slate-900'>Notifications</h2>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close notifications'
          className={cn(
            "rounded-full p-1 text-slate-500",
            "hover:bg-slate-100 hover:text-slate-700",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-brand-primary",
            "transition-colors cursor-pointer",
          )}>
          <X className='h-4 w-4' aria-hidden='true' />
        </button>
      </header>

      {/* ── Scrollable list ── */}
      <div className='flex-1 overflow-y-auto overscroll-contain' tabIndex={-1}>
        <Suspense fallback={<NotificationSkeleton />}>
          <NotificationList
            userId={userId}
            onSingleRead={onSingleRead}
            onClose={onClose}
          />
        </Suspense>
      </div>

      {/* ── Footer ── */}
      <footer className='border-t border-slate-100 px-4 py-2.5 bg-slate-50 shrink-0'>
        <p className='text-xs text-text-muted-accessible'>
          Showing your 20 most recent notifications
        </p>
      </footer>
    </div>
  );
}

// ─── Inner list ───────────────────────────────────────────────────────────────

interface NotificationListProps {
  userId: string;
  onSingleRead: (id: string) => void;
  onClose: () => void;
}

function NotificationList({
  userId,
  onSingleRead,
  onClose,
}: NotificationListProps) {
  const { data: notifications, isLoading } = useNotifications(userId);

  if (isLoading) return <NotificationSkeleton />;

  if (!notifications || notifications.length === 0) {
    return <NotificationEmpty />;
  }

  return (
    <ul
      role='list'
      aria-label='Notification items'
      className='divide-y divide-slate-100'>
      {notifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          onRead={onSingleRead}
          onClose={onClose}
        />
      ))}
    </ul>
  );
}
