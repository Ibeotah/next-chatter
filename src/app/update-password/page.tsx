// app/update-password/page.tsx
"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePasswordAction } from "./actions";
import { getRoute } from "@/lib/routes";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(
    updatePasswordAction,
    null,
  );

  // Redirect on success
  useEffect(() => {
    if (state?.success) {
      router.push(getRoute("home"));
    }
  }, [state, router]);

  return (
    <div className='flex flex-col items-center justify-center min-h-[50vh] p-4'>
      <form action={dispatch} className='w-full max-w-sm space-y-4'>
        <h1 className='text-xl font-bold'>New Password</h1>
        <Input
          name='password'
          type='password'
          placeholder='Enter new password'
          required
        />

        <Button disabled={isPending} className='w-full'>
          {isPending ? "Updating..." : "Update Password"}
        </Button>

        {state?.error && <p className='text-red-500 text-sm'>{state.error}</p>}
        {state?.success && (
          <p className='text-green-600 text-sm'>{state.success}</p>
        )}
      </form>
    </div>
  );
}
