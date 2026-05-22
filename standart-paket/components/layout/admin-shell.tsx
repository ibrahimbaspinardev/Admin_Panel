"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  Boxes,
  ChartNoAxesColumnIncreasing,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  UsersRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { usePanelData } from "@/components/providers/panel-data-provider";
import { usePanelUI } from "@/components/providers/panel-ui-provider";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kullanicilar", label: "Kullanici Yonetimi", icon: UsersRound },
  { href: "/siparisler", label: "Siparis Yonetimi", icon: ShoppingCart },
  { href: "/urunler", label: "Urun Yonetimi", icon: Boxes },
  { href: "/istatistikler", label: "Istatistikler", icon: ChartNoAxesColumnIncreasing },
  { href: "/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { notifications } = usePanelData();
  const unreadCount = notifications.filter((item) => !item.read).length;

  const content = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3 px-2">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
            SP
          </span>
          <div>
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Standart Paket
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Admin Panel
            </p>
          </div>
        </Link>
        <button
          type="button"
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          onClick={onClose}
          aria-label="Menuyu kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex h-11 items-center justify-between rounded-lg px-3 text-sm font-semibold transition ${
                active
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {item.href === "/bildirimler" && unreadCount > 0 ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active
                      ? "bg-white/20 text-current dark:bg-slate-950/10"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-950 dark:text-white">Paket kapsami</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          7 sayfa, 15 icerik girisi, Firebase, grafikler ve 2 revizyon.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{content}</div>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="h-full"
            >
              {content}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { authReady, firebaseEnabled, isAuthenticated, signInDemo } = useAuth();
  const { showToast } = usePanelUI();

  if (!authReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-white/70 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
    );
  }

  if (firebaseEnabled && !isAuthenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6 dark:bg-slate-950">
        <section className="w-full max-w-md rounded-lg border border-white/70 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <Badge tone="emerald">Firebase Authentication</Badge>
          <h1 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            Guvenli panel girisi
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Firebase env bilgileri tanımlı olduğu için panel rotaları kimlik
            doğrulama arkasında çalışır. Demo girişi anonim Firebase oturumu açar.
          </p>
          <Button
            className="mt-6 w-full"
            onClick={async () => {
              await signInDemo();
              showToast({
                tone: "success",
                title: "Oturum acildi",
                description: "Panel Firebase Authentication ile erisime acildi.",
              });
            }}
          >
            Demo giris yap
          </Button>
        </section>
      </main>
    );
  }

  return children;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { globalSearch, setGlobalSearch, theme, toggleTheme } = usePanelUI();
  const { firebaseEnabled, user, signOutPanel } = useAuth();
  const { notifications } = usePanelData();
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <AuthGate>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.10),transparent_28%),linear-gradient(180deg,#f8fafc,#eef2f7)] dark:bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
              <button
                type="button"
                className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setSidebarOpen(true)}
                aria-label="Menuyu ac"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={globalSearch}
                  onChange={(event) => setGlobalSearch(event.target.value)}
                  placeholder="Panelde ara..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                aria-label={theme === "dark" ? "Aydinlik tema" : "Koyu tema"}
                aria-pressed={theme === "dark"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link
                href="/bildirimler"
                className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                aria-label="Bildirimler"
              >
                <Bell className="h-5 w-5" />
                {unreadCount ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>

              <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex dark:border-slate-800 dark:bg-slate-900">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-teal-500 text-xs font-black text-white">
                  {user?.isAnonymous ? "DG" : "AP"}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-950 dark:text-white">
                    {firebaseEnabled ? "Firebase bagli" : "Demo mod"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {firebaseEnabled ? "Guvenli oturum" : "Env bekliyor"}
                  </p>
                </div>
              </div>

              {firebaseEnabled && user ? (
                <button
                  type="button"
                  onClick={signOutPanel}
                  className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 md:block dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Cikis yap"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
