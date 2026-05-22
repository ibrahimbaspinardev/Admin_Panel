"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CommandPalette } from "@/components/layout/command-palette";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SectionSkeleton } from "@/components/ui/skeleton";
import { ToastStack } from "@/components/ui/toast-stack";
import { useFirestoreSync } from "@/hooks/use-firestore-sync";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useTheme } from "@/hooks/use-theme";
import { logout, subscribeAuth } from "@/services/auth-service";
import { useAdminStore } from "@/store/admin-store";
import { demoAdmin } from "@/utils/seed-data";
import { canAccessSection } from "@/utils/permissions";
import type { AdminRole } from "@/types/admin";

const DashboardOverview = dynamic(() => import("@/components/dashboard/dashboard-overview"), {
  loading: () => <SectionSkeleton />,
});
const UsersManagement = dynamic(() => import("@/components/users/users-management"), {
  loading: () => <SectionSkeleton />,
});
const DataManagement = dynamic(() => import("@/components/data/data-management"), {
  loading: () => <SectionSkeleton />,
});
const FileUploadCenter = dynamic(() => import("@/components/uploads/file-upload-center"), {
  loading: () => <SectionSkeleton />,
});
const ActivityLogPanel = dynamic(() => import("@/components/activity/activity-log"), {
  loading: () => <SectionSkeleton />,
});
const NotificationCenter = dynamic(() => import("@/components/notifications/notification-center"), {
  loading: () => <SectionSkeleton />,
});
const SettingsPanel = dynamic(() => import("@/components/settings/settings-panel"), {
  loading: () => <SectionSkeleton />,
});

export function AdminShell() {
  useTheme();
  useFirestoreSync();
  const router = useRouter();
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const authReady = useAdminStore((state) => state.authReady);
  const currentUser = useAdminStore((state) => state.currentUser);
  const activeSection = useAdminStore((state) => state.activeSection);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);
  const signIn = useAdminStore((state) => state.signIn);
  const signOutLocal = useAdminStore((state) => state.signOutLocal);
  const setAuthReady = useAdminStore((state) => state.setAuthReady);
  const addToast = useAdminStore((state) => state.addToast);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout().catch(() => undefined);
    signOutLocal();
    addToast({
      title: "Çıkış yapıldı",
      message: "Yönetici oturumu kapatıldı.",
      variant: "info",
    });
    router.replace("/");
  }, [addToast, router, signOutLocal]);

  useKeyboardShortcuts(handleLogout);

  useEffect(() => {
    const unsubscribe = subscribeAuth((profile) => {
      if (profile) signIn(profile);
      setAuthReady(true);
    });

    async function restoreSession() {
      const response = await fetch("/api/session", { cache: "no-store" }).catch(() => null);
      if (!response?.ok) {
        setAuthReady(true);
        return;
      }

      const data = (await response.json()) as {
        authenticated?: boolean;
        demo?: boolean;
        uid?: string;
        role?: AdminRole;
      };

      if (!isAuthenticated && data.authenticated && data.demo) {
        signIn({ ...demoAdmin, lastLogin: new Date().toISOString() });
      } else if (!isAuthenticated && data.authenticated && data.uid) {
        signIn({
          id: data.uid,
          name: "Firebase Admin",
          email: "admin@firebase.local",
          role: data.role || "admin",
          avatarUrl:
            "https://api.dicebear.com/9.x/initials/svg?seed=Firebase%20Admin&backgroundColor=0f172a",
          lastLogin: new Date().toISOString(),
          provider: "password",
        });
      }
      setAuthReady(true);
    }

    void restoreSession();
    return () => unsubscribe();
  }, [isAuthenticated, setAuthReady, signIn]);

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/");
  }, [authReady, isAuthenticated, router]);

  useEffect(() => {
    if (
      currentUser &&
      activeSection !== "dashboard" &&
      !canAccessSection(currentUser.role, activeSection)
    ) {
      setActiveSection("dashboard");
    }
  }, [activeSection, currentUser, setActiveSection]);

  const section = useMemo(() => {
    switch (activeSection) {
      case "users":
        return <UsersManagement />;
      case "data":
        return <DataManagement />;
      case "uploads":
        return <FileUploadCenter />;
      case "activity":
        return <ActivityLogPanel />;
      case "notifications":
        return <NotificationCenter />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <DashboardOverview />;
    }
  }, [activeSection]);

  if (!authReady && !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070a12] text-white">
        <SectionSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(139,92,246,0.12),transparent_34%)]" />
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="min-w-0 flex-1">
          <Topbar onMenu={() => setMobileOpen(true)} onLogout={handleLogout} />
          <main className="mx-auto w-full max-w-[1600px] p-4 lg:p-6">{section}</main>
        </div>
      </div>
      <CommandPalette />
      <ToastStack />
    </div>
  );
}

export default AdminShell;
