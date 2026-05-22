import { DashboardShell } from "@/components/dashboard-shell";

export default function Home() {
  return (
    <DashboardShell
      title="Pro Paket"
      description="Advanced admin panel package for analytics, automation and enterprise workflows."
      stats={[
        { label: "Automation Runs", value: "12.6K" },
        { label: "Reports", value: "186" },
        { label: "SLA", value: "99.9%" }
      ]}
    />
  );
}
