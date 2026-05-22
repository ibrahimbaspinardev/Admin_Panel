"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useAdminStore } from "@/store/admin-store";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "border-emerald-300/30 bg-emerald-500/15 text-emerald-100",
  error: "border-rose-300/30 bg-rose-500/15 text-rose-100",
  warning: "border-amber-300/30 bg-amber-500/15 text-amber-100",
  info: "border-cyan-300/30 bg-cyan-500/15 text-cyan-100",
};

export function ToastStack() {
  const toasts = useAdminStore((state) => state.toasts);
  const removeToast = useAdminStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-[60] grid w-[min(380px,calc(100vw-2rem))] gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <motion.button
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={() => removeToast(toast.id)}
              className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left shadow-2xl backdrop-blur-xl ${colors[toast.variant]}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="grid gap-1">
                <span className="text-sm font-semibold">{toast.title}</span>
                <span className="text-xs opacity-80">{toast.message}</span>
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
