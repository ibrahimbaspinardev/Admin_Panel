"use client";

import { useMemo, useState } from "react";
import { Activity, MonitorSmartphone, Search, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useAdminStore } from "@/store/admin-store";
import { dateTime } from "@/utils/format";
import { formatRole } from "@/utils/permissions";

const levelTone = {
  info: "blue",
  warning: "amber",
  critical: "rose",
} as const;

export function ActivityLogPanel() {
  const activities = useAdminStore((state) => state.activities);
  const sessions = useAdminStore((state) => state.sessions);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  const filteredActivities = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return activities.filter((activity) => {
      if (!needle) return true;
      return [activity.actor, activity.action, activity.target, activity.ip]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [activities, debouncedQuery]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-cyan-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Activity Log</h2>
              <p className="mt-1 text-sm text-slate-400">Yetki, veri ve güvenlik olayları</p>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              className="pl-10"
              placeholder="Aktör, hedef, IP veya aksiyon ara..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="grid divide-y divide-white/5">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                  <ShieldAlert className="h-4 w-4 text-cyan-200" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{activity.action}</p>
                    <Badge tone={levelTone[activity.level]}>{activity.level}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {activity.actor} ({formatRole(activity.actorRole)}) - {activity.target}
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-300">{activity.ip}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {dateTime.format(new Date(activity.createdAt))}
                </p>
              </div>
            </div>
          ))}
          {filteredActivities.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-slate-500">
              Eşleşen log bulunamadı.
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <MonitorSmartphone className="h-5 w-5 text-violet-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Session tracking</h2>
              <p className="mt-1 text-sm text-slate-400">Aktif ve iptal edilen oturumlar</p>
            </div>
          </div>
        </div>
        <div className="grid divide-y divide-white/5">
          {sessions.map((session) => (
            <div key={session.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{session.user}</p>
                  <p className="mt-1 text-sm text-slate-400">{session.device}</p>
                </div>
                <Badge
                  tone={
                    session.status === "active"
                      ? "green"
                      : session.status === "revoked"
                        ? "rose"
                        : "slate"
                  }
                >
                  {session.status}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-500">
                <p>{session.location}</p>
                <p>{session.ip}</p>
                <p>{dateTime.format(new Date(session.startedAt))}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default ActivityLogPanel;
