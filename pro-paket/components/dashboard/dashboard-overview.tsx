"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  GripVertical,
  Server,
  Settings2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminStore } from "@/store/admin-store";
import { compactNumber, currency, relativeTime } from "@/utils/format";

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const start = previous.current;
    const delta = value - start;
    const startTime = performance.now();
    const duration = 650;

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayValue(start + delta * progress);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        previous.current = value;
      }
    }

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const isPercent = suffix === "%";
  const text = isPercent
    ? displayValue.toFixed(1)
    : suffix === "TL"
      ? compactNumber.format(Math.round(displayValue))
      : compactNumber.format(Math.round(displayValue));

  return (
    <>
      {text}
      {suffix ? <span className="text-base text-slate-400"> {suffix}</span> : null}
    </>
  );
}

export function DashboardOverview() {
  const metrics = useAdminStore((state) => state.metrics);
  const sales = useAdminStore((state) => state.sales);
  const activeUsers = useAdminStore((state) => state.activeUsers);
  const statuses = useAdminStore((state) => state.statuses);
  const activities = useAdminStore((state) => state.activities);
  const widgets = useAdminStore((state) => state.widgets);
  const reorderWidgets = useAdminStore((state) => state.reorderWidgets);
  const toggleWidget = useAdminStore((state) => state.toggleWidget);
  const [dragged, setDragged] = useState<string | null>(null);

  const totalRevenue = useMemo(
    () => sales.reduce((sum, item) => sum + item.revenue, 0),
    [sales],
  );

  function renderWidget(type: string) {
    if (type === "metrics") {
      return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.id} interactive className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{metric.label}</p>
                  <div className="mt-3 text-3xl font-semibold text-white">
                    <AnimatedNumber value={metric.value} suffix={metric.suffix} />
                  </div>
                </div>
                <Badge tone={metric.trend === "up" ? "green" : "amber"}>
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              <p className="mt-4 text-xs text-slate-500">{metric.description}</p>
            </Card>
          ))}
        </div>
      );
    }

    if (type === "sales") {
      return (
        <Card className="p-4 lg:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Satış analizi</h2>
              <p className="mt-1 text-sm text-slate-400">
                Toplam hacim {currency.format(totalRevenue)}
              </p>
            </div>
            <Badge tone="blue">Canlı</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales}>
                <defs>
                  <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0b1020",
                    border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  fill="url(#revenue)"
                />
                <Line type="monotone" dataKey="users" stroke="#a78bfa" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }

    if (type === "active-users") {
      return (
        <Card className="p-4 lg:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Günlük aktif kullanıcı</h2>
              <p className="mt-1 text-sm text-slate-400">Mobil ve masaüstü oturum ayrımı</p>
            </div>
            <Users className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeUsers}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0b1020",
                    border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="mobile" stackId="a" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                <Bar dataKey="desktop" stackId="a" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }

    if (type === "system") {
      return (
        <Card className="p-4 lg:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Sistem durumu</h2>
              <p className="mt-1 text-sm text-slate-400">Firebase servisleri ve export kanalı</p>
            </div>
            <Server className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="grid gap-3">
            {statuses.map((status) => (
              <div
                key={status.service}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.07]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{status.service}</p>
                    <p className="text-xs text-slate-500">{status.latency} ms latency</p>
                  </div>
                </div>
                <Badge tone={status.status === "operational" ? "green" : "amber"}>
                  {status.uptime}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-4 lg:p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Son işlemler</h2>
            <p className="mt-1 text-sm text-slate-400">Audit log özet akışı</p>
          </div>
          <Badge tone="violet">Audit</Badge>
        </div>
        <div className="grid gap-3">
          {activities.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">{activity.action}</p>
                <span className="text-xs text-slate-500">{relativeTime(activity.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {activity.actor} - {activity.target}
              </p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Özelleştirilebilir dashboard</h2>
          <p className="mt-1 text-sm text-slate-400">
            Kartları sürükleyerek sıralayın, görünürlüğü hızlıca değiştirin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {widgets.map((widget) => (
            <Button key={widget.id} size="sm" variant={widget.visible ? "secondary" : "ghost"} onClick={() => toggleWidget(widget.id)}>
              <Settings2 className="h-3.5 w-3.5" />
              {widget.title}
            </Button>
          ))}
        </div>
      </div>

      {widgets
        .filter((widget) => widget.visible)
        .map((widget) => (
          <section
            key={widget.id}
            draggable
            onDragStart={() => setDragged(widget.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragged) reorderWidgets(dragged, widget.id);
              setDragged(null);
            }}
            className="group grid gap-2"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500 opacity-70 transition group-hover:opacity-100">
              <GripVertical className="h-4 w-4" />
              {widget.title}
            </div>
            {renderWidget(widget.type)}
          </section>
        ))}
    </div>
  );
}

export default DashboardOverview;
