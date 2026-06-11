"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileDrawer } from "./mobile-drawer";
import { NotificationBell } from "@/components/notifications/notificationBell";

interface MobileHeaderProps {
  pathname: string;
  userDisplayName: string;
  userAvatarUrl: string | undefined;
  userInitials: string;
  userId: string | undefined;
  onSignOut: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
}

export function MobileHeader({
  pathname,
  userDisplayName,
  userAvatarUrl,
  userInitials,
  userId,
  onSignOut,
  inputValue,
  onInputChange,
}: MobileHeaderProps) {
  return (
    /**
     * Outer wrapper is sticky so both the brand bar
     * and the search bar scroll away together.
     */
    <div className='sticky top-0 z-40 md:hidden flex flex-col bg-white border-b border-slate-200'>
      {/* ── Brand / avatar bar ── */}
      <header
        className='w-full px-4 py-3 flex items-center justify-between'
        aria-label='Mobile navigation header'>
        <div className='flex items-center gap-3'>
          <MobileDrawer pathname={pathname} onSignOut={onSignOut} />
          {/* Brand name — large text, 3:1 ratio satisfied */}
          <span className='text-xl font-bold tracking-tight text-brand-primary'>
            Chatter
          </span>
        </div>

        <div className='flex items-center gap-3'>
          {userId ? <NotificationBell userId={userId} /> : null}

          <Link
            href='/profile'
            aria-label={`View profile for ${userDisplayName}`}
            className='
              cursor-pointer rounded-full
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-brand-primary focus-visible:ring-offset-2
            '>
            <Avatar className='h-8 w-8 ring-2 ring-slate-100'>
              <AvatarImage src={userAvatarUrl} alt={userDisplayName} />
              <AvatarFallback className='text-[11px] bg-slate-100 text-slate-700 font-bold'>
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* ── Search bar ── */}
      {userId && (
        <search aria-label='Search Chatter' className='px-4 pb-3'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500'
              aria-hidden='true'
            />
            <input
              type='search'
              placeholder='Search stories, writers, topics…'
              aria-label='Search stories, writers, and topics'
              className='
              w-full bg-slate-50 border border-slate-300 rounded-lg
              pl-10 pr-4 py-2 text-sm text-slate-900
              placeholder:text-slate-500
              focus:outline-none focus:border-brand-primary
              focus-visible:ring-2 focus-visible:ring-brand-primary
              transition-colors
            '
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
            />
          </div>
        </search>
      )}
    </div>
  );
}
