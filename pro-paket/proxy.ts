import { NextRequest, NextResponse } from "next/server";

const sessionCookie = "admin_panel_session";
const roleCookie = "admin_panel_role";
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function rateLimited(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) return false;
  if (request.nextUrl.pathname === "/api/session" && request.method === "GET") return false;

  const key = `${clientKey(request)}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  bucket.count += 1;
  return bucket.count > 80;
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (rateLimited(request)) {
    return withSecurityHeaders(
      NextResponse.json({ error: "Rate limit aşıldı." }, { status: 429 }),
    );
  }

  if (pathname.startsWith("/dashboard")) {
    const session = request.cookies.get(sessionCookie)?.value;
    if (!session) {
      const url = new URL("/", request.url);
      url.searchParams.set("auth", "required");
      return withSecurityHeaders(NextResponse.redirect(url));
    }
  }

  if (pathname.startsWith("/api/private")) {
    const session = request.cookies.get(sessionCookie)?.value;
    const role = request.cookies.get(roleCookie)?.value;
    if (!session || !["super_admin", "admin"].includes(role || "")) {
      return withSecurityHeaders(NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 }));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
