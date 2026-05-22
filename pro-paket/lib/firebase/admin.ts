import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const secureTokenJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

function projectId() {
  return process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}

export function isFirebaseAdminConfigured() {
  return Boolean(projectId());
}

export interface VerifiedFirebaseToken extends JWTPayload {
  uid: string;
  role?: string;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken | null> {
  const id = projectId();
  if (!id) return null;

  const { payload } = await jwtVerify(idToken, secureTokenJwks, {
    issuer: `https://securetoken.google.com/${id}`,
    audience: id,
  });

  if (!payload.sub) return null;

  return {
    ...payload,
    uid: payload.sub,
    role: typeof payload.role === "string" ? payload.role : undefined,
  };
}
