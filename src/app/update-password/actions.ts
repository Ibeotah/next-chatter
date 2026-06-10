// app/update-password/action.ts
"use server";
import { createClient } from "@/lib/supabase/server";

export async function updatePasswordAction(_prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated successfully!" };
}