'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock } from "lucide-react";

interface SignUpFormProps {
  dispatch: (formData: FormData) => void;
  pending: boolean;
  isPending: boolean;
}

export const SignUpForm = ({
  dispatch,
  pending,
  isPending,
}: SignUpFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-3 pt-1'
      aria-label='Create a new account'
      noValidate>
      <div className='space-y-1.5'>
        <Label htmlFor='reg-email' className='text-xs font-bold text-slate-700'>
          Email Address
        </Label>
        <div className='relative'>
          <Mail
            className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500'
            aria-hidden='true'
          />
          <Input
            id='reg-email'
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
        <Label
          htmlFor='reg-password'
          className='text-xs font-bold text-slate-700'>
          Password
        </Label>
        <div className='relative'>
          <Lock
            className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500'
            aria-hidden='true'
          />
          <Input
            id='reg-password'
            name='password'
            type='password'
            placeholder='Minimum 6 characters'
            autoComplete='new-password'
            className='pl-10 h-10 border-slate-300 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-brand-primary'
            minLength={6}
            disabled={pending}
            required
            aria-required='true'
            aria-describedby='password-hint'
          />
        </div>
        <p id='password-hint' className='text-xs text-slate-500 pl-1'>
          Must be at least 6 characters.
        </p>
      </div>

      <Button
        type='submit'
        className='
          w-full h-10 mt-3
          bg-brand-primary hover:bg-brand-primary-hover
          text-white font-semibold cursor-pointer
          focus-visible:ring-2 focus-visible:ring-brand-primary
          focus-visible:ring-offset-2
        '
        disabled={pending}
        aria-disabled={pending}>
        {isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />
            <span>Provisioning...</span>
          </>
        ) : (
          <span>Complete Registration</span>
        )}
      </Button>
    </form>
  );
};
