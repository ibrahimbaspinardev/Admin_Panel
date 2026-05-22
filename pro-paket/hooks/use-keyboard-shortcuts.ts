"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/store/admin-store";

export function useKeyboardShortcuts(onLogout: () => void) {
  const setCommandOpen = useAdminStore((state) => state.setCommandOpen);
  const sidebarCollapsed = useAdminStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useAdminStore((state) => state.setSidebarCollapsed);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        onLogout();
        return;
      }

      if (!isTyping && event.key === "/") {
        const search = document.querySelector<HTMLInputElement>("[data-global-search]");
        if (search) {
          event.preventDefault();
          search.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onLogout, setCommandOpen, setSidebarCollapsed, sidebarCollapsed]);
}
