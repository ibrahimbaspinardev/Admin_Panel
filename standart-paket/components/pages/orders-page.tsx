"use client";

import { useMemo, useState } from "react";
import { Eye, Filter, Search, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TextField, SelectField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePanelData } from "@/components/providers/panel-data-provider";
import { usePanelUI } from "@/components/providers/panel-ui-provider";
import type { Order, OrderStatus } from "@/lib/types";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const orderStatuses: OrderStatus[] = ["Yeni", "Hazirlaniyor", "Tamamlandi", "Iptal"];

export function OrdersPage() {
  const { loading, orders, updateOrderStatus } = usePanelData();
  const { globalSearch, showToast } = usePanelUI();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tumu");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const effectiveQuery = (query || globalSearch).trim().toLocaleLowerCase("tr-TR");
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesQuery =
          !effectiveQuery ||
          `${order.id} ${order.customer} ${order.email} ${order.product} ${order.city}`
            .toLocaleLowerCase("tr-TR")
            .includes(effectiveQuery);
        const matchesStatus = statusFilter === "Tumu" || order.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [effectiveQuery, orders, statusFilter],
  );

  const changeStatus = async (order: Order, status: OrderStatus) => {
    await updateOrderStatus(order.id, status);
    showToast({
      tone: "success",
      title: "Sipariş durumu değişti",
      description: `${order.id} artık ${status === "Hazirlaniyor" ? "Hazırlanıyor" : status}.`,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Operasyon akışı"
        title="Sipariş Yönetimi"
        description="Siparişleri listeleyin, filtreleyin, detaylarını inceleyin ve durumlarını değiştirin."
      />

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        {orderStatuses.map((status) => (
          <Card key={status}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {status === "Hazirlaniyor"
                    ? "Hazırlanıyor"
                    : status === "Tamamlandi"
                      ? "Tamamlandı"
                      : status === "Iptal"
                        ? "İptal"
                        : status}
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {orders.filter((order) => order.status === status).length}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                <ShoppingBag className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextField
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Sipariş, müşteri, ürün veya şehir ara"
              className="pl-10"
            />
          </label>
          <label className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <SelectField
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="pl-10"
            >
              <option value="Tumu">Tüm durumlar</option>
              <option value="Yeni">Yeni</option>
              <option value="Hazirlaniyor">Hazırlanıyor</option>
              <option value="Tamamlandi">Tamamlandı</option>
              <option value="Iptal">İptal</option>
            </SelectField>
          </label>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 font-bold">Sipariş</th>
                  <th className="py-3 font-bold">Müşteri</th>
                  <th className="py-3 font-bold">Ürün</th>
                  <th className="py-3 font-bold">Tutar</th>
                  <th className="py-3 font-bold">Durum</th>
                  <th className="py-3 font-bold">Tarih</th>
                  <th className="py-3 text-right font-bold">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-4 font-bold text-slate-950 dark:text-white">
                      {order.id}
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {order.customer}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {order.email}
                      </p>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {order.product}
                    </td>
                    <td className="py-4 font-semibold text-slate-900 dark:text-slate-100">
                      {currency.format(order.total)}
                    </td>
                    <td className="py-4">
                      <SelectField
                        value={order.status}
                        onChange={(event) =>
                          changeStatus(order, event.target.value as OrderStatus)
                        }
                        className="w-40"
                      >
                        <option value="Yeni">Yeni</option>
                        <option value="Hazirlaniyor">Hazırlanıyor</option>
                        <option value="Tamamlandi">Tamamlandı</option>
                        <option value="Iptal">İptal</option>
                      </SelectField>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">
                      {order.date}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label="Sipariş detayı"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title="Sipariş detayı"
        description="Sipariş bilgileri ve ödeme durumu."
      >
        {selectedOrder ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Sipariş No", selectedOrder.id],
              ["Müşteri", selectedOrder.customer],
              ["E-posta", selectedOrder.email],
              ["Ürün", selectedOrder.product],
              ["Şehir", selectedOrder.city],
              ["Ödeme", selectedOrder.payment],
              ["Tutar", currency.format(selectedOrder.total)],
              ["Tarih", selectedOrder.date],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-2 font-semibold text-slate-950 dark:text-white">{value}</p>
              </div>
            ))}
            <div className="sm:col-span-2">
              <StatusBadge status={selectedOrder.status} />
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
