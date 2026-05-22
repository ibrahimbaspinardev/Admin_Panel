"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginPanel } from "@/components/auth/login-panel";
import { ToastStack } from "@/components/ui/toast-stack";
import { subscribeAuth } from "@/services/auth-service";
import { useAdminStore } from "@/store/admin-store";
import { useTheme } from "@/hooks/use-theme";

export function AuthGateway() {
  useTheme();
  const router = useRouter();
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const signIn = useAdminStore((state) => state.signIn);
  const signOutLocal = useAdminStore((state) => state.signOutLocal);
  const setAuthReady = useAdminStore((state) => state.setAuthReady);

  useEffect(() => {
    const unsubscribe = subscribeAuth((profile) => {
      if (profile) signIn(profile);
      setAuthReady(true);
    });

    const timeout = window.setTimeout(() => setAuthReady(true), 300);
    return () => {
      unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [setAuthReady, signIn]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function verifySessionBeforeRedirect() {
      const response = await fetch("/api/session", { cache: "no-store" }).catch(() => null);
      if (response?.ok) {
        router.replace("/dashboard");
        return;
      }
      signOutLocal();
    }

    void verifySessionBeforeRedirect();
  }, [isAuthenticated, router, signOutLocal]);

  return (
    <>
      <LoginPanel onAuthenticated={() => router.replace("/dashboard")} />
      <ToastStack />
    </>
  );
}
