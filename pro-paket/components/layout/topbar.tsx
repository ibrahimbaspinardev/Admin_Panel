"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/store/admin-store";
import { formatRole } from "@/utils/permissions";
import type { SectionKey } from "@/types/admin";

const titles: Record<SectionKey, string> = {
  dashboard: "Dashboard",
  users: "Kullanıcı yönetimi",
  data: "Veri yönetimi",
  uploads: "Dosya yükleme",
  activity: "Activity & audit log",
  notifications: "Bildirim merkezi",
  settings: "Ayarlar",
};

export function Topbar({
  onMenu,
  onLogout,
}: {
  onMenu: () => void;
  onLogout: () => void;
}) {
  const currentUser = useAdminStore((state) => state.currentUser);
  const activeSection = useAdminStore((state) => state.activeSection);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);
  const setCommandOpen = useAdminStore((state) => state.setCommandOpen);
  const theme = useAdminStore((state) => state.theme);
  const setTheme = useAdminStore((state) => state.setTheme);
  const notifications = useAdminStore((state) => state.notifications);
  const [profileOpen, setProfileOpen] = useState(false);
  const avatarUrl =
    currentUser?.avatarUrl ||
    "https://api.dicebear.com/9.x/initials/svg?seed=Admin&backgroundColor=0f172a";

  const unread = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080b14]/78 px-4 py-3 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <Button className="lg:hidden" size="icon" variant="ghost" onClick={onMenu} aria-label="Menü">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">Admin Console</p>
          <h1 className="truncate text-xl font-semibold text-white">{titles[activeSection]}</h1>
        </div>

        <div className="relative hidden min-w-[280px] max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            data-global-search
            onFocus={() => setCommandOpen(true)}
            placeholder="Ara veya komut çalıştır..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.065] pl-10 pr-20 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 px-2 py-1 text-[10px] text-slate-500">
            Ctrl K
          </span>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Tema değiştir"
          title="Tema değiştir"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setActiveSection("notifications")}
          aria-label="Bildirimler"
          title="Bildirimler"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-300" />
          ) : null}
        </Button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((value) => !value)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.065] p-1.5 pr-2 transition hover:bg-white/[0.1]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={currentUser?.name || "Admin"}
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="hidden min-w-0 text-left md:block">
              <span className="block max-w-32 truncate text-xs font-semibold text-white">
                {currentUser?.name}
              </span>
              <span className="block text-[11px] text-slate-500">
                {currentUser ? formatRole(currentUser.role) : "Admin"}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-500 md:block" />
          </button>

          {profileOpen ? (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-white/10 bg-[#0b1020] p-2 shadow-2xl">
              <div className="border-b border-white/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">{currentUser?.name}</p>
                  {currentUser ? <Badge tone="violet">{formatRole(currentUser.role)}</Badge> : null}
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => {
                  setActiveSection("settings");
                  setProfileOpen(false);
                }}
                className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.07] hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Profil ve güvenlik
              </button>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-100 hover:bg-rose-500/15"
              >
                <LogOut className="h-4 w-4" />
                Çıkış yap
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
