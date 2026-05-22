import { DashboardShell } from "@/components/dashboard-shell";

export default function Home() {
  return (
    <DashboardShell
      title="Standart Paket"
      description="Operational admin panel package with stronger reporting and team workflows."
      stats={[
        { label: "Active Teams", value: "48" },
        { label: "Tickets", value: "914" },
        { label: "Conversion", value: "7.8%" }
      ]}
    />
  );
}
