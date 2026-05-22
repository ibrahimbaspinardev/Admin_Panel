import { DashboardShell } from "@/components/dashboard-shell";

export default function Home() {
  return (
    <DashboardShell
      title="Temel Paket"
      description="Essential admin panel foundation for small teams and starter products."
      stats={[
        { label: "Users", value: "1.2K" },
        { label: "Orders", value: "320" },
        { label: "Revenue", value: "$8.4K" }
      ]}
    />
  );
}
