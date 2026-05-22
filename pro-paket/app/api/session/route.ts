import { NextRequest, NextResponse } from "next/server";
import { isFirebaseAdminConfigured, verifyFirebaseIdToken } from "@/lib/firebase/admin";

const cookieName = "admin_panel_session";
const roleCookieName = "admin_panel_role";

function sessionResponse(payload: { uid: string; role: string; demo?: boolean }) {
  const response = NextResponse.json({ ok: true, uid: payload.uid });
  const maxAge = 60 * 60 * 24 * 7;

  response.cookies.set(cookieName, payload.demo ? "demo" : payload.uid, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  response.cookies.set(roleCookieName, payload.role, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return response;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { idToken?: string; demo?: boolean }
    | null;

  if (body?.demo) {
    return sessionResponse({
      uid: "demo-super-admin",
      role: "super_admin",
      demo: true,
    });
  }

  if (!body?.idToken) {
    return NextResponse.json({ error: "Oturum tokenı eksik." }, { status: 400 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Firebase proje kimliği eksik. FIREBASE_PROJECT_ID veya NEXT_PUBLIC_FIREBASE_PROJECT_ID tanımlayın.",
      },
      { status: 503 },
    );
  }

  const decoded = await verifyFirebaseIdToken(body.idToken).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Geçersiz Firebase oturumu." }, { status: 401 });
  }

  const role = (decoded.role as string | undefined) || "admin";
  return sessionResponse({ uid: decoded.uid, role });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(cookieName);
  response.cookies.delete(roleCookieName);
  return response;
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(cookieName)?.value;
  const role = request.cookies.get(roleCookieName)?.value || "admin";

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    uid: session,
    role,
    demo: session === "demo",
  });
}
