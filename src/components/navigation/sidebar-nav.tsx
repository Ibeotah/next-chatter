"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoute } from "@/lib/routes";
import { NAV_LINKS } from "./nav-links";

interface SidebarNavProps {
  pathname: string;
  userDisplayName: string;
  userAvatarUrl: string | undefined;
  userInitials: string;
  onSignOut: () => void;
}

export function SidebarNav({
  pathname,
  userDisplayName,
  userAvatarUrl,
  userInitials,
  onSignOut,
}: SidebarNavProps) {
  return (
    <aside
      className='hidden md:flex flex-col shrink-0 sticky top-0 h-screen bg-brand-primary text-white transition-all duration-300 md:w-20 lg:w-64 z-40 shadow-xl shadow-blue-900/10'
      aria-label='Main navigation'>
      {/* Wordmark */}
      <div className='p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-white/20 h-20'>
        <span className='text-2xl font-black tracking-tight block md:hidden lg:block'>
          Chatter
        </span>
        <span
          className='text-xl font-black tracking-tight hidden md:block lg:hidden'
          aria-hidden='true'>
          C
        </span>
      </div>

      {/* Nav links */}
      <nav
        className='flex-1 px-3 py-6 flex flex-col gap-2'
        aria-label='Primary navigation'>
        {NAV_LINKS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex items-center justify-center lg:justify-start
                gap-4 px-4 py-3.5 rounded-xl
                font-medium text-sm transition-all duration-200 group
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-white focus-visible:ring-offset-2
                focus-visible:ring-offset-brand-primary
                ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }
              `}>
              <Icon
                className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "opacity-80 group-hover:opacity-100"}`}
                aria-hidden='true'
              />
              <span className='md:hidden lg:block tracking-wide'>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile dropdown */}
      <div className='p-4 border-t border-white/20 bg-white/5'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className='
                w-full flex items-center justify-center lg:justify-start
                gap-3 p-2 rounded-xl
                hover:bg-white/5 transition-colors
                text-left cursor-pointer
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-white focus-visible:ring-offset-2
                focus-visible:ring-offset-brand-primary
              '
              aria-label={`Account menu for ${userDisplayName}`}>
              <Avatar className='h-10 w-10 border-2 border-white/30 shrink-0'>
                <AvatarImage src={userAvatarUrl} alt={userDisplayName} />
                <AvatarFallback className='bg-white/20 text-white font-bold'>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className='md:hidden lg:block text-left overflow-hidden flex-1'>
                <p className='text-sm font-semibold truncate leading-tight text-white'>
                  {userDisplayName}
                </p>
                <p className='text-xs truncate mt-0.5 text-white/75'>
                  Author Account
                </p>
                {/* text-white/75 on bg-brand-primary → 3.5:1 ✅ */}
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align='end'
            side='right'
            className='w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 z-50 mb-2 ml-2'>
            <DropdownMenuLabel className='px-2.5 py-2 text-xs font-semibold text-slate-500 tracking-wider uppercase'>
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-slate-100 my-1' />
            <DropdownMenuItem
              asChild
              className='focus:bg-slate-50 rounded-lg cursor-pointer'>
              <Link
                href={getRoute("profile")}
                className='flex items-center gap-2 px-2.5 py-2 text-sm text-slate-700 font-medium'>
                <User className='h-4 w-4 text-slate-500' aria-hidden='true' />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className='bg-slate-100 my-1' />
            <DropdownMenuItem
              onClick={onSignOut}
              className='focus:bg-red-50 text-red-700 focus:text-red-700 font-semibold rounded-lg cursor-pointer flex items-center gap-2 px-2.5 py-2 text-sm'
            >
              <LogOut className='h-4 w-4' aria-hidden='true' />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
