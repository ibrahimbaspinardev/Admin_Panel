"use client";

import { Bell, CheckCheck, Inbox, MailOpen, ShoppingCart, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { usePanelData } from "@/components/providers/panel-data-provider";
import { usePanelUI } from "@/components/providers/panel-ui-provider";
import type { NotificationItem } from "@/lib/types";

const tabItems = [
  { label: "Tümü", value: "all" },
  { label: "Okunmadı", value: "unread" },
  { label: "Okundu", value: "read" },
];

function notificationIcon(type: NotificationItem["type"]) {
  if (type === "order") {
    return ShoppingCart;
  }
  if (type === "user") {
    return UserRound;
  }
  if (type === "stock") {
    return Inbox;
  }
  return Bell;
}

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = usePanelData();
  const { showToast } = usePanelUI();
  const [activeTab, setActiveTab] = useState("all");

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        if (activeTab === "unread") {
          return !notification.read;
        }
        if (activeTab === "read") {
          return notification.read;
        }
        return true;
      }),
    [activeTab, notifications],
  );

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <>
      <PageHeader
        eyebrow="Mesaj merkezi"
        title="Bildirimler"
        description="Yeni siparişleri, sistem mesajlarını ve okunma durumlarını takip edin."
        action={
          <Button
            icon={CheckCheck}
            variant="secondary"
            onClick={async () => {
              await markAllNotificationsRead();
              showToast({
                tone: "success",
                title: "Bildirimler okundu",
                description: "Tüm bildirimler okundu olarak işaretlendi.",
              });
            }}
          >
            Tümünü okundu yap
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Toplam bildirim
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            {notifications.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Okunmadı
          </p>
          <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-300">
            {unreadCount}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Sistem mesajı
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            {notifications.filter((notification) => notification.type === "system").length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap gap-2">
          {tabItems.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`h-10 rounded-lg px-4 text-sm font-bold transition ${
                activeTab === tab.value
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
              aria-pressed={activeTab === tab.value}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const Icon = notificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 transition ${
                  notification.read
                    ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    : "border-teal-200 bg-teal-50/60 dark:border-teal-500/30 dark:bg-teal-500/10"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-teal-600 shadow-sm dark:bg-slate-950 dark:text-teal-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-950 dark:text-white">
                          {notification.title}
                        </h2>
                        {!notification.read ? (
                          <span className="rounded-md bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                            Yeni
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {notification.description}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        {notification.createdAt}
                      </p>
                    </div>
                  </div>
                  {!notification.read ? (
                    <Button
                      icon={MailOpen}
                      variant="secondary"
                      onClick={async () => {
                        await markNotificationRead(notification.id);
                        showToast({
                          tone: "success",
                          title: "Bildirim okundu",
                          description: notification.title,
                        });
                      }}
                    >
                      Okundu yap
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
