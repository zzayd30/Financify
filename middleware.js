import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)"
]);

export default clerkMiddleware((auth, req) => {
  try {
    const { userId } = auth();

    if (!userId && isProtectedRoute(req)) {
      return auth().redirectToSignIn();
    }
  } catch (error) {
    console.error('Middleware error:', error);
    return undefined;
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};