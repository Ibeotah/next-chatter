"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function NewPostError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      role='alert'
      aria-live='assertive'
      className='max-w-4xl mx-auto px-4 sm:px-6'>
      <div className='mt-12 flex flex-col items-center text-center bg-white border border-red-300 rounded-2xl shadow-sm px-6 py-16'>
        <div
          className='h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-6'
          aria-hidden='true'>
          <AlertTriangle className='h-7 w-7 text-red-700' />
        </div>

        <h1 className='text-2xl font-bold text-slate-900 mb-2'>
          The post workspace failed to load
        </h1>
        <p className='text-sm text-slate-600 max-w-sm mb-8'>
          Something went wrong while opening the editor. Your previous drafts
          are safe in Supabase.
        </p>

        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            onClick={reset}
            className='flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-colors'>
            <RefreshCw className='h-4 w-4' aria-hidden='true' /> Try again
          </button>
          <Link
            href={ROUTES.dashboard}
            className='flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors'>
            <ArrowLeft className='h-4 w-4' aria-hidden='true' /> Back to
            Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
