import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PanelDataProvider } from "@/components/providers/panel-data-provider";
import { PanelUIProvider } from "@/components/providers/panel-ui-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PanelUIProvider>
      <AuthProvider>
        <PanelDataProvider>
          <AdminShell>{children}</AdminShell>
        </PanelDataProvider>
      </AuthProvider>
    </PanelUIProvider>
  );
}
