"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/urunler", label: "Ürün Yönetimi" },
  { href: "/kullanicilar", label: "Kullanıcı Paneli" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <Link href="/" className="block rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Temel Paket
            </p>
            <h1 className="mt-2 text-xl font-bold text-slate-950">
              Başlangıç Admin Paneli
            </h1>
          </Link>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      active ? "bg-emerald-300" : "bg-slate-300"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Kapsam</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              3 sayfalı, sade, responsive ve temel yönetim ihtiyaçlarına uygun
              panel.
            </p>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Küçük işletmeler ve yeni başlayan girişimler için
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Başlangıç Admin Paneli
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  1000 TL
                </span>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                  Teslim: 2 gün
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
                  Revizyon: 1
                </span>
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
