import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the JWT token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const publicRoutes = ["/", "/admin/login", "/member/login", "/signin"];

  const adminRoutes = [
    "/admin/dashboard",
    "/admin/billing",
    "/admin/members",
    "/admin/notifications",
    "/admin/reports",
    "/admin/settings",
    "/admin/store",
  ];

  const memberRoutes = [
    "/member/dashboard",
    "/member/bills",
    "/member/notifications",
    "/member/settings",
    "/member/store",
  ];

  // Check if current path is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if current path is a member route
  const isMemberRoute = memberRoutes.some((route) => pathname.startsWith(route));

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!token) {
    // Allow access to public routes (home, login pages)
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect to home page if trying to access protected routes
    if (isAdminRoute || isMemberRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  const userType = token.type as string;

  if (userType === "ADMIN") {
    // Allow access to admin routes
    if (isAdminRoute) {
      return NextResponse.next();
    }

    // Redirect admin away from member routes
    if (isMemberRoute) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Redirect admin away from login page to dashboard
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Allow public routes
    if (isPublicRoute) {
      // Redirect from home/login pages to dashboard if already authenticated
      if (pathname === "/" || pathname === "/admin/login" || pathname === "/signin" || pathname === "/member/login") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  if (userType === "MEMBER") {
    // Allow access to member routes
    if (isMemberRoute) {
      return NextResponse.next();
    }

    // Redirect member away from admin routes
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }

    // Redirect member away from login page to dashboard
    if (pathname === "/member/login") {
      return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }

    // Allow public routes
    if (isPublicRoute) {
      // Redirect from home/login pages to dashboard if already authenticated
      if (pathname === "/" || pathname === "/member/login" || pathname === "/signin" || pathname === "/admin/login") {
        return NextResponse.redirect(new URL("/member/dashboard", request.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
