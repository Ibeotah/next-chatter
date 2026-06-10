'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

interface SignInFormProps {
  dispatch: (formData: FormData) => void;
  pending: boolean;
  showSuccess: boolean;
  isPending: boolean;
  onForgot: () => void;
}

export const SignInForm = ({
  dispatch,
  pending,
  showSuccess,
  isPending,
  onForgot,
}: SignInFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 pt-2'
      aria-label='Sign in to your account'
      noValidate>
      <div className='space-y-1.5'>
        <Label
          htmlFor='login-email'
          className='text-xs font-bold text-slate-700'>
          Email Address
        </Label>
        <div className='relative'>
          <Mail
            className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500'
            aria-hidden='true'
          />
          <Input
            id='login-email'
            name='email'
            type='email'
            placeholder='name@domain.com'
            autoComplete='email'
            className='pl-10 h-10 border-slate-300 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-brand-primary'
            disabled={pending}
            required
            aria-required='true'
          />
        </div>
      </div>

      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <Label
            htmlFor='login-password'
            className='text-xs font-bold text-slate-700'>
            Password
          </Label>
          <button
            type='button'
            onClick={onForgot}
            className='
              text-xs font-bold text-brand-primary
              hover:underline cursor-pointer rounded
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-brand-primary
              focus-visible:ring-offset-1
            '>
            Forgot password?
          </button>
        </div>
        <div className='relative'>
          <Lock
            className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500'
            aria-hidden='true'
          />
          <Input
            id='login-password'
            name='password'
            type='password'
            placeholder='••••••••'
            autoComplete='current-password'
            className='pl-10 h-10 border-slate-300 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-brand-primary'
            disabled={pending}
            required
            aria-required='true'
          />
        </div>
      </div>

      <Button
        type='submit'
        className='
          w-full h-10 mt-2
          bg-brand-primary hover:bg-brand-primary-hover
          text-white font-semibold cursor-pointer
          focus-visible:ring-2 focus-visible:ring-brand-primary
          focus-visible:ring-offset-2
        '
        disabled={pending}
        aria-disabled={pending}>
        {showSuccess ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />
            <span>Redirecting...</span>
          </>
        ) : isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Sign In to Dashboard</span>
            <ArrowRight className='ml-2 h-4 w-4' aria-hidden='true' />
          </>
        )}
      </Button>
    </form>
  );
};
