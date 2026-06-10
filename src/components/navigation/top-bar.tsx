"use client";

import { Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notificationBell";



interface TopBarProps {
  userId: string | undefined;
  inputValue: string;
  onInputChange: (value: string) => void;
}

export function TopBar({ userId, inputValue, onInputChange }: TopBarProps) {
  return (
    <div
      className='hidden md:flex items-center justify-between h-20 px-8 bg-white border-b border-slate-200/80'
      role='banner'
    >
      <search aria-label='Search Chatter'>
        <div className='w-96 relative'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500'
            aria-hidden='true'
          />
          <input
            type='search'
            placeholder='Search global chatter records...'
            aria-label='Search global chatter records'
            className='
              w-full bg-slate-50 border border-slate-300 rounded-lg
              pl-10 pr-4 py-2 text-sm
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

      <div className='flex items-center gap-4' role='toolbar' aria-label='Header actions'>
        {userId ? <NotificationBell userId={userId} /> : null}
        <div className='h-6 w-px bg-slate-200' aria-hidden='true' />
        <Button
          variant='ghost'
          size='icon'
          className='
            text-slate-600 hover:bg-slate-100
            rounded-full h-10 w-10 cursor-pointer
            focus-visible:ring-2 focus-visible:ring-brand-primary
          '
          aria-label='Settings'
        >
          <Settings className='h-5 w-5' aria-hidden='true' />
        </Button>
      </div>
    </div>
  );
}