"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "./nav-links";

interface MobileDrawerProps {
  pathname: string;
  onSignOut: () => void;
}

export function MobileDrawer({ pathname, onSignOut }: MobileDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 text-slate-600 cursor-pointer'
          aria-label='Open navigation menu'>
          <Menu className='h-5 w-5' aria-hidden='true' />
        </Button>
      </SheetTrigger>

      <SheetContent
        side='left'
        className='w-[280px] p-0 bg-white flex flex-col justify-between'>
        {/* SheetHeader satisfies the Radix DialogTitle requirement */}
        <div>
          <SheetHeader className='p-6 bg-brand-primary text-white text-left'>
            <SheetTitle className='text-2xl font-bold tracking-tight text-white'>
              Chatter
            </SheetTitle>
            <p className='text-xs text-white/80 mt-1'>Creator Workspace</p>
          </SheetHeader>

          <nav
            className='p-4 flex flex-col gap-1 mt-2'
            aria-label='Mobile navigation'>
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    font-medium text-sm transition-colors
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-brand-primary focus-visible:ring-offset-1
                    ${
                      isActive
                        ? "bg-blue-50 text-brand-primary"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                  `}
                  // Active: text-brand-primary on bg-blue-50 → 4.8:1 ✅
                  // Inactive: text-slate-700 on white → 10.7:1 ✅
                >
                  <Icon className='h-5 w-5' aria-hidden='true' />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className='p-4 border-t border-slate-100 mb-4'>
          <button
            onClick={onSignOut}
            className='
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-red-700 hover:bg-red-50
              font-medium text-sm transition-colors cursor-pointer text-left
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-red-700 focus-visible:ring-offset-1
            '>
            <LogOut className='h-5 w-5' aria-hidden='true' />
            Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
