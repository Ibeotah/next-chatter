

import { CheckCircle2, XCircle } from "lucide-react";

interface AuthFeedbackProps {
  activeError: string | null;
  showSignInSuccess: boolean;
  signUpSuccess: boolean | undefined;
  isVisible: boolean;
}

export const AuthFeedback = ({
  activeError,
  showSignInSuccess,
  signUpSuccess,
  isVisible,
}: AuthFeedbackProps) => {
  if (!isVisible) return null;

  return (
    <div className='space-y-2'>
      {/* ERROR BANNER */}
      {activeError && !showSignInSuccess && (
        <div
          role='alert'
          aria-live='assertive'
          aria-atomic='true'
          className='
            flex items-center justify-center gap-2
            p-3 rounded-lg font-medium
            text-xs
            bg-red-50 border border-red-200 text-red-700
          '
        >
          <XCircle
            className='h-4 w-4 text-red-700 shrink-0'
            aria-hidden='true'
          />
          <span>{activeError}</span>
        </div>
      )}

      {/* SIGN UP SUCCESS BANNER */}
      {signUpSuccess && (
        <div
          role='status'
          aria-live='polite'
          aria-atomic='true'
          className='
            flex items-center justify-center gap-2
            p-3 rounded-lg font-medium
            text-xs
            bg-emerald-50 border border-emerald-200 text-emerald-800
          '
        >
          <CheckCircle2
            className='h-4 w-4 text-emerald-700 shrink-0'
            aria-hidden='true'
          />
          <span>Account created successfully! You can now sign in.</span>
        </div>
      )}

      {/* SIGN IN SUCCESS BANNER */}
      {showSignInSuccess && (
        <div
          role='status'
          aria-live='polite'
          aria-atomic='true'
          className='
            flex items-center justify-center gap-2
            p-3 rounded-lg font-medium
            text-xs
            bg-emerald-50 border border-emerald-200 text-emerald-800
            animate-in fade-in zoom-in-95 duration-150
          '>
          <CheckCircle2
            className='h-4 w-4 text-emerald-700 shrink-0'
            aria-hidden='true'
          />
          <span>Login successful! Preparing your dashboard...</span>
        </div>
      )}
    </div>
  );
};
