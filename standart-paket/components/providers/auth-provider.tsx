"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseServices, hasFirebaseConfig } from "@/lib/firebase";

type AuthContextValue = {
  authReady: boolean;
  firebaseEnabled: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signInDemo: () => Promise<void>;
  signOutPanel: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(!hasFirebaseConfig);
  const [user, setUser] = useState<User | null>(null);
  const services = useMemo(() => getFirebaseServices(), []);

  useEffect(() => {
    if (!services) {
      return;
    }

    return onAuthStateChanged(services.auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, [services]);

  const signInDemo = useCallback(async () => {
    if (!services) {
      return;
    }
    await signInAnonymously(services.auth);
  }, [services]);

  const signOutPanel = useCallback(async () => {
    if (!services) {
      return;
    }
    await signOut(services.auth);
  }, [services]);

  const value = useMemo(
    () => ({
      authReady,
      firebaseEnabled: Boolean(services),
      isAuthenticated: !services || Boolean(user),
      user,
      signInDemo,
      signOutPanel,
    }),
    [authReady, services, signInDemo, signOutPanel, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
