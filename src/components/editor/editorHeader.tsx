"use client";

import { AutosaveStatus } from "@/types";
import { CheckCircle2, RefreshCw, AlertTriangle } from "lucide-react";

type EditorHeaderProps = {
  status: AutosaveStatus;
};

const statusConfig = {
  idle: {
    pill: "text-slate-600 bg-slate-50 border-slate-200",
    dot: "bg-slate-400",
    text: "Workspace ready",
    icon: null,
  },
  saving: {
    pill: "text-brand-primary bg-brand-surface border-brand-primary/20 animate-pulse font-medium",
    dot: "bg-brand-primary animate-ping",
    text: "Saving changes…",
    icon: (
      <RefreshCw
        className='h-3 w-3 animate-spin text-brand-primary'
        aria-hidden='true'
      />
    ),
  },
  saved: {
    pill: "text-emerald-700 bg-emerald-50 border-emerald-200 font-medium",
    dot: "bg-emerald-500",
    text: "Saved to Supabase",
    icon: (
      <CheckCircle2
        className='h-3.5 w-3.5 text-emerald-700'
        aria-hidden='true'
      />
    ),
  },
  error: {
    pill: "text-rose-700 bg-rose-50 border-rose-200 font-semibold",
    dot: "bg-rose-500",
    text: "Autosave failed. Retrying shortly…",
    icon: (
      <AlertTriangle className='h-3 w-3 text-rose-700' aria-hidden='true' />
    ),
  },
};

export const EditorHeader = ({ status }: EditorHeaderProps) => {
  const currentStatus = statusConfig[status] ?? statusConfig.saved;

  return (
    <header className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <div
          aria-hidden='true'
          className={`
            h-2 w-2 rounded-full transition-colors duration-300
            ${currentStatus.dot}
          `}
        />

        <div className='flex items-center gap-2.5 text-sm font-medium'>
          <span className='font-bold text-slate-800'>Draft Workspace</span>

          <span className='text-slate-300' aria-hidden='true'>
            |
          </span>

          <div
            role='status'
            aria-live='polite'
            aria-atomic='true'
            className={`
              flex items-center gap-1.5 text-xs px-2.5 py-1
              rounded-full border transition-all duration-300
              ${currentStatus.pill}
            `}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
