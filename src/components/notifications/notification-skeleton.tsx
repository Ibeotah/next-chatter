// components/notifications/notification-skeleton.tsx
"use client";

/**
 * Animated placeholder shown while the notification list is fetching.
 * aria-busy tells screen readers the list is loading.
 * Individual items are aria-hidden — they carry no meaningful content.
 */
export function NotificationSkeleton() {
  return (
    <ul
      aria-label='Loading notifications'
      aria-busy='true'
      className='divide-y divide-slate-100'>
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          aria-hidden='true'
          className='flex items-start gap-3 px-4 py-3 animate-pulse'>
          {/* Unread dot placeholder */}
          <span className='mt-2 h-2 w-2 rounded-full bg-slate-200 shrink-0' />
          {/* Avatar placeholder */}
          <span className='h-8 w-8 rounded-full bg-slate-200 shrink-0' />
          {/* Text placeholders */}
          <div className='flex-1 space-y-2 pt-1'>
            <div className='h-3 bg-slate-200 rounded w-3/4' />
            <div className='h-2.5 bg-slate-200 rounded w-1/3' />
          </div>
        </li>
      ))}
    </ul>
  );
}
