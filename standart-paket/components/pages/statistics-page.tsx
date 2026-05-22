"use client";

import { Activity, ArrowUpRight, MousePointerClick, TrendingUp, UsersRound } from "lucide-react";
import { BarChart, LineChart } from "@/components/ui/charts";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { usePanelData } from "@/components/providers/panel-data-provider";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function StatisticsPage() {
  const { loading, orders, users, products, revenue, userGrowth } = usePanelData();
  const totalRevenue = orders.reduce((total, order) => total + order.total, 0);
  const averageOrder = totalRevenue / Math.max(orders.length, 1);
  const activeUsers = users.filter((user) => user.status === "Aktif").length;
  const topProducts = [...products].sort((a, b) => b.sales - a.sales).slice(0, 4);

  const stats = [
    {
      label: "Toplam satış",
      value: currency.format(totalRevenue),
      helper: "Tüm sipariş cirosu",
      icon: TrendingUp,
    },
    {
      label: "Ortalama sepet",
      value: currency.format(averageOrder),
      helper: "Sipariş başına gelir",
      icon: MousePointerClick,
    },
    {
      label: "Aktif kullanıcı",
      value: activeUsers.toString(),
      helper: "Doğrulanmış hesap",
      icon: UsersRound,
    },
    {
      label: "Dönüşüm",
      value: "64%",
      helper: "Son 7 gün ortalaması",
      icon: Activity,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Raporlama"
        title="İstatistikler"
        description="Satış performansı, kullanıcı büyümesi ve ürün verilerini grafiklerle inceleyin."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {stat.helper}
                    </p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Satış istatistikleri
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Günlük gelir ve sipariş ivmesi.
            </p>
          </div>
          {loading ? <Skeleton className="h-64" /> : <BarChart data={revenue} />}
        </Card>
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Kullanıcı verileri
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aylık kayıt ve büyüme trendi.
            </p>
          </div>
          {loading ? <Skeleton className="h-64" /> : <LineChart data={userGrowth} />}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            En çok satan ürünler
          </h2>
          <div className="mt-5 space-y-4">
            {topProducts.map((product) => {
              const percent = Math.min((product.sales / Math.max(topProducts[0].sales, 1)) * 100, 100);
              return (
                <div key={product.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {product.name}
                    </span>
                    <span className="text-sm font-bold text-slate-950 dark:text-white">
                      {product.sales}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-teal-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Dashboard chart sistemi
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ["Sipariş tamamlama", "78%"],
              ["Stok sağlığı", "84%"],
              ["Okunmamış bildirim", "2"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Bu alan, Firebase verisi bağlandığında sipariş, kullanıcı ve stok
            koleksiyonlarından gerçek zamanlı olarak beslenir.
          </p>
        </Card>
      </div>
    </>
  );
}
