// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { createServerClient } from "@supabase/ssr";
// import { getRoute } from "@/lib/routes";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   // next parameter allows you to override the destination if needed, defaults to /dashboard
//   const next = searchParams.get("next") ?? getRoute("dashboard");

//   if (code) {
//     const cookieStore = await cookies();
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll() {
//             return cookieStore
//               .getAll()
//               .map(({ name, value }) => ({ name, value }));
//           },
//           setAll(cookiesToSet) {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set({ name, value, ...options }),
//             );
//           },
//         },
//       },
//     );

//     // Exchange the temporary code for a long-lived cookie session
//     const { error } = await supabase.auth.exchangeCodeForSession(code);

//     if (!error) {
//       // Redirect to the dashboard; proxy.ts will catch this and handle it gracefully
//       return NextResponse.redirect(`${origin}${next}`);
//     }
//   }

//   // If something goes wrong, boot them back to the landing page
//   return NextResponse.redirect(`${origin}/?error=auth-callback-failed`);
// }



import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRoute } from "@/lib/routes";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? getRoute("dashboard");

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth-callback-failed`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options }),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?error=auth-callback-failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}