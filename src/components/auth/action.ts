// "use server";

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// interface ActionResponse {
//   success: boolean;
//   error?: string;
// }

// export async function handleSignInAction(
//   _prevState: any,
//   formData: FormData,
// ): Promise<ActionResponse> {
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;

//   if (!email || !password) {
//     return {
//       success: false,
//       error: "Please enter both email and password fields.",
//     };
//   }

//   const cookieStore = await cookies();
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore
//             .getAll()
//             .map(({ name, value }) => ({ name, value }));
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set({ name, value, ...options }),
//           );
//         },
//       },
//     },
//   );

//   const { error } = await supabase.auth.signInWithPassword({ email, password });

//   if (error) {
//     return {
//       success: false,
//       error: "Invalid login credentials. Please check your email and password.",
//     };
//   }

//   return { success: true };
// }

// export async function handleSignUpAction(
//   _prevState: any,
//   formData: FormData,
// ): Promise<ActionResponse> {
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;

//   // 2. Validate email and password
//   if (!email || !password ) {
//     return { success: false, error: "All registration fields are required." };
//   }

//   const cookieStore = await cookies();
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore
//             .getAll()
//             .map(({ name, value }) => ({ name, value }));
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set({ name, value, ...options }),
//           );
//         },
//       },
//     },
//   );

//   const { error, data } = await supabase.auth.signUp({
//     email,
//     password,
//   });

//   if (error) {
//     console.log("SIGNUP ERROR:", error);
//     // Explicit check for "User already exists"
//     if (error.message.includes("already registered") || error.status === 422) {
//       return {
//         success: false,
//         error: "An account with this email already exists.",
//       };
//     }
//     return { success: false,
//       // error: error.message
//       error: JSON.stringify(error, null, 2),
//     };
//   }
//   if (data.user) {
//     await supabase.auth.signOut();
//   }
//   return { success: true };
// }

// export async function handleSignOutAction() {
//   const cookieStore = await cookies();

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore
//             .getAll()
//             .map(({ name, value }) => ({ name, value }));
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set({ name, value, ...options }),
//           );
//         },
//       },
//     },
//   );

//   // Instructs Supabase to clear any auth cookies generated matching this project instance
//   await supabase.auth.signOut();

//   return { success: true };
// }

"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface ActionResponse {
  success: boolean;
  error?: string;
}

// Shared factory — avoids repeating the cookie wiring in every action
async function getSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        },
      },
    },
  );
}

export async function handleSignInAction(
  _prevState: any,
  formData: FormData,
): Promise<ActionResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      success: false,
      error: "Invalid login credentials. Please check your email and password.",
    };
  }

  return { success: true };
}

export async function handleSignUpAction(
  _prevState: any,
  formData: FormData,
): Promise<ActionResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "All registration fields are required." };
  }

  const supabase = await getSupabaseClient();
  const { error, data } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes("already registered") || error.status === 422) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }
    return { success: false, error: error.message };
  }

  // Sign out immediately — email confirmation flow, user must verify first
  if (data.user) {
    await supabase.auth.signOut();
  }

  return { success: true };
}

export async function handleSignOutAction(): Promise<ActionResponse> {
  const supabase = await getSupabaseClient();
  await supabase.auth.signOut();
  return { success: true };
}
