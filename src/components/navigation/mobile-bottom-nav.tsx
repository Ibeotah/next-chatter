"use client";

import Link from "next/link";
import { NAV_LINKS } from "./nav-links";


interface MobileBottomNavProps {
  pathname: string;
}

export function MobileBottomNav({ pathname }: MobileBottomNavProps) {
  const bottomLinks = NAV_LINKS.slice(0, 4);

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between md:hidden shadow-lg shadow-slate-900/10'
      aria-label='Mobile bottom navigation'>
      {bottomLinks.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`
              flex flex-col items-center gap-1
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-brand-primary focus-visible:ring-offset-1
              rounded-md px-1
              ${
                isActive
                  ? "text-brand-primary"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}>
            <Icon
              className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`}
              aria-hidden='true'
            />
            <span className='text-[10px] font-bold'>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
