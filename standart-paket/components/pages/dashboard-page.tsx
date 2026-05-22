"use client";

import {
  ArrowUpRight,
  Banknote,
  Clock3,
  PackageCheck,
  ShoppingCart,
  UsersRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, LineChart } from "@/components/ui/charts";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePanelData } from "@/components/providers/panel-data-provider";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function DashboardPage() {
  const { loading, users, orders, products, activities, revenue, userGrowth } =
    usePanelData();

  const todayRevenue = orders
    .filter((order) => order.date === "2026-05-21")
    .reduce((total, order) => total + order.total, 0);
  const completedOrders = orders.filter((order) => order.status === "Tamamlandi").length;
  const activeProducts = products.filter((product) => product.status === "Aktif").length;

  const metrics = [
    {
      label: "Toplam sipariş",
      value: orders.length.toString(),
      helper: `${completedOrders} sipariş tamamlandı`,
      icon: ShoppingCart,
      tone: "bg-teal-500",
    },
    {
      label: "Toplam kullanıcı",
      value: users.length.toString(),
      helper: `${users.filter((user) => user.status === "Aktif").length} aktif hesap`,
      icon: UsersRound,
      tone: "bg-cyan-500",
    },
    {
      label: "Günlük gelir",
      value: currency.format(todayRevenue),
      helper: "Bugünkü onaylı ciro",
      icon: Banknote,
      tone: "bg-emerald-500",
    },
    {
      label: "Aktif ürün",
      value: activeProducts.toString(),
      helper: "Satışa açık stoklar",
      icon: PackageCheck,
      tone: "bg-amber-500",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Canlı yönetim özeti"
        title="Dashboard"
        description="Sipariş, kullanıcı, gelir ve operasyon akışını tek ekranda takip edin."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
                        {metric.value}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        {metric.helper}
                      </p>
                    </div>
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white shadow-sm ${metric.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Haftalık gelir grafiği
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Siparişlerden gelen günlük gelir dağılımı.
              </p>
            </div>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              +18.4%
            </span>
          </div>
          {loading ? <Skeleton className="h-64" /> : <BarChart data={revenue} />}
        </Card>

        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Kullanıcı büyümesi
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aylık yeni kayıt hacmi.
            </p>
          </div>
          {loading ? <Skeleton className="h-64" /> : <LineChart data={userGrowth} />}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Son işlemler
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Güncel sipariş hareketleri.
              </p>
            </div>
          </div>
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-3 font-bold">Sipariş</th>
                    <th className="py-3 font-bold">Müşteri</th>
                    <th className="py-3 font-bold">Tutar</th>
                    <th className="py-3 font-bold">Durum</th>
                    <th className="py-3 font-bold">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="py-4 font-bold text-slate-950 dark:text-white">
                        {order.id}
                      </td>
                      <td className="py-4 text-slate-600 dark:text-slate-300">
                        {order.customer}
                      </td>
                      <td className="py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {currency.format(order.total)}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Aktivite akışı
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sistem ve ekip hareketleri.
            </p>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <span
                  className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    activity.tone === "emerald"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                      : activity.tone === "cyan"
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10"
                        : activity.tone === "amber"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                          : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                  }`}
                >
                  <Clock3 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {activity.detail}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {activity.createdAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
