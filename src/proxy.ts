// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// // Next.js uses the named 'proxy' function export instead of 'middleware'
// export async function proxy(request: NextRequest) {
//   let response = NextResponse.next({
//     request: { headers: request.headers },
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies
//             .getAll()
//             .map(({ name, value }) => ({ name, value }));
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             request.cookies.set({ name, value, ...options }),
//           );
//           response = NextResponse.next({
//             request: { headers: request.headers },
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             response.cookies.set({ name, value, ...options }),
//           );
//         },
//       },
//     },
//   );

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();
//   const url = request.nextUrl.clone();

//   // 1. Root Route Handler: Unauthenticated visitors stay on http://localhost:3000 safely
//   if (url.pathname === "/") {
//     if (session) {
//       url.pathname = "/dashboard";
//       return NextResponse.redirect(url);
//     }
//     return response;
//   }

//   // 2. Protected Canvas Guard: Bounce out anyone trying to reach app dashboards/profiles unauthenticated
//   const protectedPaths = [
//     "/dashboard",
//     "/profile",
//     "/new-post",
//     "/social",
//     "/analytics",
//     "/discovery"
//   ];
//   const isProtected = protectedPaths.some((path) =>
//     // url.pathname.startsWith(path),
//   url.pathname === path || url.pathname.startsWith(`${path}/`)
//   );

//   if (isProtected && !session) {
//     url.pathname = "/";
//     return NextResponse.redirect(url);
//   }

//   return response;
// }

// export const config = {
//   // Applies the routing rules directly to your core canvas and profile paths
//   matcher: [
//     "/",
//     "/dashboard/:path*",
//     "/profile/:path*",
//     "/new-post/:path*",
//     "/social/:path*",
//     "/analytics/:path*",
//     "/discovery/:path*",
//   ],
// };
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options }),
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options }),
          );
        },
      },
    },
  );

  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Root: redirect authenticated users to dashboard
  if (url.pathname === "/") {
    if (user) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Protected routes: redirect unauthenticated users to root
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/new-post",
    "/social",
    "/analytics",
    "/discovery",
  ];

  const isProtected = protectedPaths.some(
    (path) => url.pathname === path || url.pathname.startsWith(`${path}/`),
  );

  if (isProtected && !user) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/new-post/:path*",
    "/social/:path*",
    "/analytics/:path*",
    "/discovery/:path*",
  ],
};