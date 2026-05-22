"use client";

import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  authPersistence,
  firebaseAuth,
  firestoreDb,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import type { AdminProfile, AdminRole } from "@/types/admin";
import { demoAdmin } from "@/utils/seed-data";

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

function avatarFallback(name: string, email: string) {
  const seed = encodeURIComponent(name || email);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=0f172a,111827,1e293b&fontFamily=Inter`;
}

async function createSession(idToken: string, demo = false) {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, demo }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Oturum başlatılamadı.");
  }
}

async function clearSession() {
  await fetch("/api/session", { method: "DELETE" });
}

async function resolveProfile(user: User, provider: AdminProfile["provider"]) {
  const baseProfile: AdminProfile = {
    id: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "Admin",
    email: user.email || "admin@company.com",
    role: "admin",
    avatarUrl:
      user.photoURL ||
      avatarFallback(user.displayName || "Admin", user.email || "admin"),
    lastLogin: new Date().toISOString(),
    provider,
  };

  if (!firestoreDb) return baseProfile;

  const ref = doc(firestoreDb, "adminProfiles", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, baseProfile, { merge: true });
    return baseProfile;
  }

  const data = snapshot.data() as Partial<AdminProfile>;
  return {
    ...baseProfile,
    ...data,
    role: (data.role as AdminRole) || baseProfile.role,
    lastLogin: new Date().toISOString(),
  };
}

export async function loginWithEmail(payload: LoginPayload) {
  if (!firebaseAuth || !isFirebaseConfigured) {
    const cleanEmail = payload.email.trim().toLowerCase();
    if (!cleanEmail || payload.password.length < 6) {
      throw new Error("Demo giriş için geçerli e-posta ve en az 6 karakter şifre girin.");
    }

    await createSession("demo-session", true);
    return {
      ...demoAdmin,
      email: cleanEmail,
      lastLogin: new Date().toISOString(),
    };
  }

  await setPersistence(
    firebaseAuth,
    payload.remember ? authPersistence.local : authPersistence.session,
  );
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    payload.email,
    payload.password,
  );
  const token = await credential.user.getIdToken();
  await createSession(token);
  return resolveProfile(credential.user, "password");
}

export async function loginWithGoogle() {
  if (!firebaseAuth || !isFirebaseConfigured) {
    await createSession("demo-session", true);
    return { ...demoAdmin, lastLogin: new Date().toISOString() };
  }

  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  const token = await credential.user.getIdToken();
  await createSession(token);
  return resolveProfile(credential.user, "google");
}

export async function resetPassword(email: string) {
  if (!firebaseAuth || !isFirebaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function logout() {
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
  await clearSession();
}

export function subscribeAuth(callback: (profile: AdminProfile | null) => void) {
  if (!firebaseAuth || !isFirebaseConfigured) {
    return () => undefined;
  }

  return onAuthStateChanged(firebaseAuth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    callback(await resolveProfile(user, "password"));
  });
}
