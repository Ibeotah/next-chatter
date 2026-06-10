"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";


interface ProfilePageErrorProps {
  message?: string;
  onRetry: () => void;
}

export function ProfilePageError({
  message,
  onRetry,
}: ProfilePageErrorProps) {
  return (
    <div
      className='max-w-4xl mx-auto'
      role='alert'
      aria-live='assertive'
      aria-atomic='true'
    >
      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardContent className='p-12 flex flex-col items-center justify-center gap-4 text-center'>
          <div
            className='h-12 w-12 rounded-full bg-red-50 flex items-center justify-center'
            aria-hidden='true'
          >
            <AlertCircle className='h-6 w-6 text-red-600' />
          </div>

          <div className='space-y-1'>
            <h2 className='text-base font-bold text-slate-800'>
              Could not load your profile
            </h2>
            <p className='text-sm text-text-muted-accessible'>
              {message ||
                "Something went wrong while fetching your profile data."}
            </p>
          </div>

          <Button
            onClick={onRetry}
            variant='outline'
            className='
              border-slate-400 text-slate-700
              hover:bg-slate-50 hover:border-slate-500
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-brand-primary
              focus-visible:ring-offset-2
              transition-colors
            '
            aria-label='Retry loading your profile'
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}