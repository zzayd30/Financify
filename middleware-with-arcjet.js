import arcjet, { createMiddleware, detectBot, shield } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/account(.*)",
    "/transaction(.*)"
]);

// Arcjet configuration
const aj = arcjet({
    key: process.env.ARCJET_KEY, // Make sure this env var is set in production
    rules: [
        shield({
            mode: "LIVE",
        }),
        detectBot({
            mode: "LIVE",
            allow: ["CATEGORY_SEARCH_ENGINE", "GO_HTTP"],
        })
    ],
});

// Clerk middleware with error handling
const clerk = clerkMiddleware((auth, req) => {
    try {
        const { userId } = auth();

        if (!userId && isProtectedRoute(req)) {
            return auth().redirectToSignIn();
        }
    } catch (error) {
        console.error('Clerk middleware error:', error);
        // Continue processing instead of failing
        return undefined;
    }
});

// Combined middleware with error boundary
export default createMiddleware(aj, clerk);

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};