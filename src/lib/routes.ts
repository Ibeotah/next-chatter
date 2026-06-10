// lib/routes.ts
export const ROUTES = {
  home: "/",
  forgot_password: "/forgot-password",
  update_password: "/update-password",
  social: "/social",
  analytics: "/analytics",
  profile: "/profile",
  new_post: "/new-post",
  dashboard: "/dashboard",
  discovery: "/discovery",

  post_detail: (id: string) => `/new-post/${id}`,
} as const;

// 2. getRoute to safely check if the route is a string or a function
export const getRoute = (key: string, param?: string): string => {
 const route = (ROUTES as any)[key];

  if (!route) return "/";

  // If the route is a function (like post_detail), execute it with the param
  if (typeof route === "function") {
    return param ? route(param) : "/";
  }

  // Otherwise, return the static string path directly
  return route;
};
