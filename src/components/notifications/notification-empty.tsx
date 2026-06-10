// components/notifications/notification-empty.tsx
"use client";

import { Bell } from "lucide-react";

/**
 * Shown when the user has no notifications at all.
 * role="status" announces the state to screen readers.
 *
 */
export function NotificationEmpty() {
  return (
    <div
      role='status'
      className='flex flex-col items-center justify-center py-12 px-6 text-center gap-3'>
      <Bell className='h-10 w-10 text-slate-300' aria-hidden='true' />
      <div>
        <p className='text-sm font-semibold text-slate-700'>
          You&apos;re all caught up
        </p>
        <p className='text-xs text-text-muted-accessible mt-0.5 leading-relaxed'>
          New likes, comments, and replies will appear here.
        </p>
      </div>
    </div>
  );
}
