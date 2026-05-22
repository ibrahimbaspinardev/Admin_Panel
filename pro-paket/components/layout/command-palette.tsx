"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useAdminStore } from "@/store/admin-store";
import type { SectionKey } from "@/types/admin";
import { canAccessSection } from "@/utils/permissions";

const commands: Array<{ key: SectionKey; label: string; hint: string }> = [
  { key: "dashboard", label: "Dashboard", hint: "Canlı metrikler ve grafikler" },
  { key: "users", label: "Kullanıcılar", hint: "Rol, ban ve kullanıcı detayları" },
  { key: "data", label: "Veri Yönetimi", hint: "CRUD, export, pagination" },
  { key: "uploads", label: "Dosya Yükleme", hint: "Storage ve progress" },
  { key: "activity", label: "Activity Log", hint: "Audit ve session kayıtları" },
  { key: "notifications", label: "Bildirimler", hint: "Gerçek zamanlı merkez" },
  { key: "settings", label: "Ayarlar", hint: "Tema, dil ve güvenlik" },
];

export function CommandPalette() {
  const open = useAdminStore((state) => state.commandOpen);
  const setOpen = useAdminStore((state) => state.setCommandOpen);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);
  const currentUser = useAdminStore((state) => state.currentUser);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const role = currentUser?.role || "editor";
    return commands
      .filter((command) => canAccessSection(role, command.key))
      .filter((command) => {
        const needle = query.toLowerCase();
        return (
          command.label.toLowerCase().includes(needle) ||
          command.hint.toLowerCase().includes(needle)
        );
      });
  }, [currentUser?.role, query]);

  function runCommand(section: SectionKey) {
    setActiveSection(section);
    setOpen(false);
    setQuery("");
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-[#0b1020] shadow-2xl"
          >
            <div className="relative border-b border-white/10">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                placeholder="Komut veya ekran ara..."
                className="h-14 w-full bg-transparent pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="max-h-[360px] overflow-auto p-2">
              {filtered.map((command) => (
                <button
                  key={command.key}
                  onClick={() => runCommand(command.key)}
                  className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-3 text-left transition hover:bg-white/[0.07]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-white">{command.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{command.hint}</span>
                  </span>
                  <span className="rounded border border-white/10 px-2 py-1 text-[10px] text-slate-500">
                    Aç
                  </span>
                </button>
              ))}
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Eşleşen komut bulunamadı.
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
