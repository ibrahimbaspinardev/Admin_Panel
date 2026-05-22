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
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";

type ThemeMode = "light" | "dark";
type ToastTone = "success" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type PanelUIContextValue = {
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  showToast: (toast: Omit<Toast, "id">) => void;
};

const PanelUIContext = createContext<PanelUIContextValue | null>(null);

export function PanelUIProvider({ children }: { children: ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedTheme = window.localStorage.getItem("panel-theme") as ThemeMode | null;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(savedTheme ?? (prefersDark ? "dark" : "light"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    window.localStorage.setItem("panel-theme", nextTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}`;
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(
    () => ({
      globalSearch,
      setGlobalSearch,
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      showToast,
    }),
    [globalSearch, setTheme, showToast, theme],
  );

  return (
    <PanelUIContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toast.tone === "success" ? CheckCircle2 : Info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="pointer-events-auto rounded-lg border border-white/60 bg-white/95 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 text-teal-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {toast.title}
                    </p>
                    {toast.description ? (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {toast.description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    onClick={() =>
                      setToasts((current) =>
                        current.filter((item) => item.id !== toast.id),
                      )
                    }
                    aria-label="Bildirimi kapat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </PanelUIContext.Provider>
  );
}

export function usePanelUI() {
  const context = useContext(PanelUIContext);
  if (!context) {
    throw new Error("usePanelUI must be used within PanelUIProvider");
  }
  return context;
}
