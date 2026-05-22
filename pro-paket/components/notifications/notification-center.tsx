"use client";

import { Bell, CheckCheck, Info, MailOpen, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { markRemoteNotificationRead } from "@/services/firestore-service";
import { useAdminStore } from "@/store/admin-store";
import { relativeTime } from "@/utils/format";

const tone = {
  success: "green",
  error: "rose",
  warning: "amber",
  info: "blue",
} as const;

export function NotificationCenter() {
  const notifications = useAdminStore((state) => state.notifications);
  const markNotificationRead = useAdminStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useAdminStore((state) => state.markAllNotificationsRead);
  const pushNotification = useAdminStore((state) => state.pushNotification);
  const addToast = useAdminStore((state) => state.addToast);

  async function markRead(id: string) {
    markNotificationRead(id);
    await markRemoteNotificationRead(id).catch(() => undefined);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">Bildirim merkezi</h2>
            <p className="mt-1 text-sm text-slate-400">Toast, popup ve gerçek zamanlı panel akışı</p>
          </div>
          <Button onClick={markAllNotificationsRead}>
            <CheckCheck className="h-4 w-4" />
            Tümünü okundu yap
          </Button>
        </div>
        <div className="grid divide-y divide-white/5">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => markRead(notification.id)}
              className="grid gap-3 p-4 text-left transition hover:bg-white/[0.04] sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <span className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                  {notification.read ? (
                    <MailOpen className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Bell className="h-4 w-4 text-cyan-200" />
                  )}
                </span>
                <span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{notification.title}</span>
                    {!notification.read ? <span className="h-2 w-2 rounded-full bg-cyan-300" /> : null}
                  </span>
                  <span className="mt-1 block text-sm text-slate-400">{notification.message}</span>
                </span>
              </span>
              <span className="flex items-center gap-2 sm:justify-end">
                <Badge tone={tone[notification.type]}>{notification.type}</Badge>
                <span className="text-xs text-slate-500">{relativeTime(notification.createdAt)}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white">Test bildirimi</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Gerçek zamanlı bildirim akışını demo verisiyle tetikler ve toast gösterir.
          </p>
          <Button
            className="mt-5 w-full"
            variant="primary"
            onClick={() => {
              pushNotification({
                title: "Manuel bildirim",
                message: "Operasyon ekibine yeni kontrol bildirimi gönderildi.",
                type: "info",
              });
              addToast({
                title: "Bildirim gönderildi",
                message: "Bildirim merkezine yeni kayıt eklendi.",
                variant: "success",
              });
            }}
          >
            <Send className="h-4 w-4" />
            Bildirim gönder
          </Button>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-cyan-200" />
            <h3 className="font-semibold text-white">Bağlantı davranışı</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Firestore env tanımlıysa `notifications` koleksiyonu dinlenir. Env yoksa aynı UI
            demo modda interval bazlı canlı veri üretir.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default NotificationCenter;
