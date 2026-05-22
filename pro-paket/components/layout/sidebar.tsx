"use client";

import clsx from "clsx";
import {
  Activity,
  Bell,
  Database,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/store/admin-store";
import type { SectionKey } from "@/types/admin";
import { canAccessSection, formatRole } from "@/utils/permissions";

const navItems: Array<{ key: SectionKey; label: string; icon: React.ElementType }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "users", label: "Kullanıcılar", icon: Users },
  { key: "data", label: "Veri Yönetimi", icon: Database },
  { key: "uploads", label: "Dosya Yükleme", icon: UploadCloud },
  { key: "activity", label: "Activity Log", icon: Activity },
  { key: "notifications", label: "Bildirimler", icon: Bell },
  { key: "settings", label: "Ayarlar", icon: Settings },
];

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const currentUser = useAdminStore((state) => state.currentUser);
  const activeSection = useAdminStore((state) => state.activeSection);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);
  const sidebarCollapsed = useAdminStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useAdminStore((state) => state.setSidebarCollapsed);

  const role = currentUser?.role || "editor";

  function selectSection(section: SectionKey) {
    setActiveSection(section);
    onMobileClose();
  }

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileClose}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex border-r border-white/10 bg-[#070a12]/92 p-3 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen",
          sidebarCollapsed ? "w-[86px]" : "w-[284px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              className={clsx(
                "flex min-w-0 items-center gap-3 rounded-lg p-2 text-left transition hover:bg-white/[0.07]",
                sidebarCollapsed && "justify-center",
              )}
              onClick={() => selectSection("dashboard")}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 to-violet-400 text-sm font-black text-slate-950">
                PA
              </span>
              {!sidebarCollapsed ? (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">Pro Admin</span>
                  <span className="block truncate text-xs text-slate-400">
                    SaaS Control Center
                  </span>
                </span>
              ) : null}
            </button>
            <Button
              className="lg:hidden"
              size="icon"
              variant="ghost"
              onClick={onMobileClose}
              aria-label="Menüyü kapat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="grid gap-1">
            {navItems.map((item) => {
              const allowed = canAccessSection(role, item.key);
              const Icon = item.icon;
              if (!allowed) return null;
              return (
                <button
                  key={item.key}
                  onClick={() => selectSection(item.key)}
                  className={clsx(
                    "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                    activeSection === item.key
                      ? "bg-white text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.14)]"
                      : "text-slate-400 hover:bg-white/[0.07] hover:text-white",
                    sidebarCollapsed && "justify-center px-0",
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto grid gap-3">
            {!sidebarCollapsed ? (
              <div className="rounded-lg border border-cyan-200/20 bg-cyan-300/10 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">Rol güvenliği</span>
                  <Badge tone="blue">{formatRole(role)}</Badge>
                </div>
                <p className="text-xs leading-5 text-slate-400">
                  Yetki kontrolleri UI, Proxy ve Firestore Rules katmanlarında ayrıldı.
                </p>
              </div>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={clsx("hidden lg:flex", sidebarCollapsed && "px-0")}
              title={sidebarCollapsed ? "Sidebar genişlet" : "Sidebar küçült"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
              {!sidebarCollapsed ? "Sidebar küçült" : null}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
