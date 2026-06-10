"use client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { forgotPasswordAction } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRoute } from "@/lib/routes";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(
    forgotPasswordAction,
    null,
  );

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <form action={dispatch} className='w-full max-w-sm space-y-4'>
        <h1 className='text-xl font-bold'>Reset Password</h1>
        <Input
          name='email'
          type='email'
          placeholder='Enter your email'
          required
        />
        <div className='flex flex-col md:flex-row gap-2'>
          <Button
            disabled={isPending}
            className='hover:bg-primary/70  cursor-pointer'>
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>

          <Button
            variant='outline'
            type='button' // Important: prevents form submission
            onClick={() => router.push(getRoute("home"))}
            className='cursor-pointer'>
            Back to Home
          </Button>
        </div>
        {state?.error && <p className='text-red-500 text-xs'>{state.error}</p>}
        {state?.success && (
          <p className='text-green-600 text-xs'>{state.success}</p>
        )}
      </form>
    </div>
  );
}
