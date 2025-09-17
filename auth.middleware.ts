import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  "/sign-in",
  "/sign-up",
  "/",
  "/home",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/videos",
]);

export default clerkMiddleware((auth, req) => {
  const  {userId}  = auth();
  const currentUrl = new URL(req.url);

  const isAccessingDashboard = currentUrl.pathname === "/home";
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // If user is logged in and trying to access a public route but not dashboard
  if (userId && isPublicRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // If user is not logged in
  if (!userId) {
    // Protected API route
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Protected page route
    if (!isPublicRoute(req) && !isApiRequest) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});


// Specify the paths that should be protected by the middleware

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // all non-static, non-_next routes
    "/",                      // root
    "/(api|trpc)(.*)",        // api + trpc routes
  ],
};
