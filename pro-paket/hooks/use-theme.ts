"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/store/admin-store";

export function useTheme() {
  const theme = useAdminStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = theme === "dark" || (theme === "system" && systemDark);

    root.classList.toggle("dark", shouldUseDark);
    root.style.colorScheme = shouldUseDark ? "dark" : "light";
  }, [theme]);
}
