type Stat = {
  label: string;
  value: string;
};

type DashboardShellProps = {
  title: string;
  description: string;
  stats: Stat[];
};

export function DashboardShell({ title, description, stats }: DashboardShellProps) {
  return (
    <main className="dashboard-shell">
      <section className="hero">
        <p className="eyebrow">Admin Panel</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      <section className="stats-grid" aria-label="Dashboard summary">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
