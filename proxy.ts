import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/verifier(.*)",
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isOfficierRoute = createRouteMatcher(["/officier(.*)"]);
const isCitoyenRoute = createRouteMatcher(["/citoyen(.*)"]);

// ← export default, pas export function proxy()
export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  const role =
    (sessionClaims?.publicMetadata as { role?: string })?.role ??
    (sessionClaims?.metadata as { role?: string })?.role ??
    "CITOYEN";

  console.log(`[proxy] role=${role} path=${request.nextUrl.pathname}`);

  if (isAdminRoute(request) && role !== "ADMIN") {
    return NextResponse.redirect(new URL(getRoleRedirect(role), request.url));
  }

  if (isOfficierRoute(request) && role !== "OFFICIER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(getRoleRedirect(role), request.url));
  }

  if (isCitoyenRoute(request) && (role === "OFFICIER" || role === "ADMIN")) {
    return NextResponse.redirect(new URL(getRoleRedirect(role), request.url));
  }

  return NextResponse.next();
});

function getRoleRedirect(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "OFFICIER") return "/officier";
  return "/citoyen";
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
