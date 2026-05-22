"use client";

import { FormEvent, MouseEvent, useMemo, useState } from "react";
import {
  ArrowDownUp,
  Copy,
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useDebounce } from "@/hooks/use-debounce";
import { deleteRemoteRecords, upsertRemoteRecord } from "@/services/firestore-service";
import { useAdminStore } from "@/store/admin-store";
import type { ManagedRecord, RecordStatus } from "@/types/admin";
import { currency, relativeTime, slugId } from "@/utils/format";
import { canManageData } from "@/utils/permissions";
import {
  exportRecordsToCsv,
  exportRecordsToExcel,
  exportRecordsToPdf,
} from "@/utils/exporters";

type SortKey = "title" | "category" | "status" | "updatedAt" | "amount";
type SortDirection = "asc" | "desc";

const pageSize = 5;
const statusOptions: Array<RecordStatus | "all"> = ["all", "published", "draft", "archived"];

function statusTone(status: RecordStatus) {
  if (status === "published") return "green";
  if (status === "draft") return "amber";
  return "slate";
}

function blankRecord(): ManagedRecord {
  return {
    id: slugId("rec"),
    title: "",
    owner: "",
    category: "Operations",
    status: "draft",
    priority: "Medium",
    updatedAt: new Date().toISOString(),
    amount: 0,
    tags: [],
  };
}

export function DataManagement() {
  const records = useAdminStore((state) => state.records);
  const addRecord = useAdminStore((state) => state.addRecord);
  const updateRecord = useAdminStore((state) => state.updateRecord);
  const deleteRecords = useAdminStore((state) => state.deleteRecords);
  const bulkUpdateRecords = useAdminStore((state) => state.bulkUpdateRecords);
  const addToast = useAdminStore((state) => state.addToast);
  const pushActivity = useAdminStore((state) => state.pushActivity);
  const currentUser = useAdminStore((state) => state.currentUser);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RecordStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<ManagedRecord | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    record: ManagedRecord;
  } | null>(null);

  const debouncedQuery = useDebounce(query, 200);
  const canManage = canManageData(currentUser?.role || "editor");

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return records
      .filter((record) => {
        const matchesQuery =
          !needle ||
          record.title.toLowerCase().includes(needle) ||
          record.owner.toLowerCase().includes(needle) ||
          record.category.toLowerCase().includes(needle) ||
          record.tags.join(" ").toLowerCase().includes(needle);
        return matchesQuery && (status === "all" || record.status === status);
      })
      .sort((a, b) => {
        const first = a[sortKey];
        const second = b[sortKey];
        const value = first > second ? 1 : first < second ? -1 : 0;
        return sortDirection === "asc" ? value : -value;
      });
  }, [debouncedQuery, records, sortDirection, sortKey, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRecords = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSelected(id: string) {
    setSelected((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !canManage) return;

    const exists = records.some((record) => record.id === editing.id);
    const payload = { ...editing, updatedAt: new Date().toISOString() };
    if (exists) {
      updateRecord(editing.id, payload);
    } else {
      addRecord(payload);
    }
    await upsertRemoteRecord(payload).catch(() => undefined);
    pushActivity({
      actor: currentUser?.name || "Admin",
      actorRole: currentUser?.role || "editor",
      action: exists ? "Veri güncelledi" : "Veri oluşturdu",
      target: payload.title,
      level: "info",
      ip: "local",
    });
    addToast({
      title: exists ? "Kayıt güncellendi" : "Kayıt oluşturuldu",
      message: payload.title,
      variant: "success",
    });
    setEditing(null);
  }

  async function removeRecords(ids: string[]) {
    if (!canManage || ids.length === 0) return;
    deleteRecords(ids);
    setSelected([]);
    await deleteRemoteRecords(ids).catch(() => undefined);
    addToast({
      title: "Kayıtlar silindi",
      message: `${ids.length} kayıt veri tablosundan kaldırıldı.`,
      variant: "success",
    });
  }

  function duplicate(record: ManagedRecord) {
    const copyRecord = {
      ...record,
      id: slugId("rec"),
      title: `${record.title} kopya`,
      updatedAt: new Date().toISOString(),
    };
    addRecord(copyRecord);
    void upsertRemoteRecord(copyRecord);
    addToast({ title: "Kopya oluşturuldu", message: copyRecord.title, variant: "success" });
  }

  function openContext(event: MouseEvent<HTMLTableRowElement>, record: ManagedRecord) {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, record });
  }

  return (
    <div className="grid gap-4" onClick={() => setContextMenu(null)}>
      <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            className="pl-10"
            placeholder="Başlık, sahip, kategori veya etiket ara..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as RecordStatus | "all");
              setPage(1);
            }}
            className="h-10 rounded-lg border border-white/10 bg-[#101827] px-3 text-sm text-white outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Tüm durumlar" : option}
              </option>
            ))}
          </select>
          <Button onClick={() => exportRecordsToExcel(filtered)}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button onClick={() => exportRecordsToPdf(filtered)}>PDF</Button>
          <Button onClick={() => exportRecordsToCsv(filtered)}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          {canManage ? (
            <Button variant="primary" onClick={() => setEditing(blankRecord())}>
              <Plus className="h-4 w-4" />
              Yeni kayıt
            </Button>
          ) : null}
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3">
          <span className="text-sm text-cyan-100">{selected.length} kayıt seçildi</span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                bulkUpdateRecords(selected, { status: "archived" });
                addToast({
                  title: "Toplu düzenleme tamam",
                  message: "Seçili kayıtlar arşivlendi.",
                  variant: "success",
                });
              }}
            >
              Arşivle
            </Button>
            <Button size="sm" variant="danger" onClick={() => removeRecords(selected)}>
              Toplu sil
            </Button>
          </div>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={pageRecords.length > 0 && pageRecords.every((record) => selected.includes(record.id))}
                    onChange={(event) => {
                      const ids = pageRecords.map((record) => record.id);
                      setSelected((items) =>
                        event.target.checked
                          ? Array.from(new Set([...items, ...ids]))
                          : items.filter((item) => !ids.includes(item)),
                      );
                    }}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-300"
                  />
                </th>
                {[
                  ["title", "Başlık"],
                  ["category", "Kategori"],
                  ["status", "Durum"],
                  ["amount", "Tutar"],
                  ["updatedAt", "Güncelleme"],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 font-medium">
                    <button
                      className="inline-flex items-center gap-2 hover:text-white"
                      onClick={() => toggleSort(key as SortKey)}
                    >
                      {label}
                      <ArrowDownUp className="h-3 w-3" />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((record) => (
                <tr
                  key={record.id}
                  onContextMenu={(event) => openContext(event, record)}
                  className="border-b border-white/5 transition hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(record.id)}
                      onChange={() => toggleSelected(record.id)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{record.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {record.owner} / {record.tags.join(", ")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{record.category}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(record.status)}>{record.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{currency.format(record.amount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{relativeTime(record.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(record)} aria-label="Düzenle">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => duplicate(record)} aria-label="Kopyala">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="danger" onClick={() => removeRecords([record.id])} aria-label="Sil">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageRecords.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="font-medium text-white">Kayıt yok</p>
            <p className="mt-1 text-sm text-slate-500">Yeni kayıt oluşturun veya filtreleri temizleyin.</p>
          </div>
        ) : null}
        <div className="flex flex-col justify-between gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            {filtered.length} kayıt / Sayfa {page} - {pages}
          </p>
          <div className="flex gap-2">
            <Button size="sm" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Önceki
            </Button>
            <Button size="sm" disabled={page === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>
              Sonraki
            </Button>
          </div>
        </div>
      </Card>

      {contextMenu ? (
        <div
          className="fixed z-50 w-56 rounded-lg border border-white/10 bg-[#0b1020] p-2 shadow-2xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.07]"
            onClick={() => setEditing(contextMenu.record)}
          >
            <Edit3 className="h-4 w-4" />
            Düzenle
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.07]"
            onClick={() => duplicate(contextMenu.record)}
          >
            <Copy className="h-4 w-4" />
            Kopyala
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-100 hover:bg-rose-500/15"
            onClick={() => removeRecords([contextMenu.record.id])}
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </button>
        </div>
      ) : null}

      <Modal open={Boolean(editing)} title={editing?.title ? "Kayıt düzenle" : "Yeni kayıt"} onClose={() => setEditing(null)}>
        {editing ? (
          <form className="grid gap-4" onSubmit={saveRecord}>
            <label className="grid gap-2 text-sm text-slate-300">
              Başlık
              <Input
                value={editing.title}
                onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                Sahip
                <Input
                  value={editing.owner}
                  onChange={(event) => setEditing({ ...editing, owner: event.target.value })}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Kategori
                <Input
                  value={editing.category}
                  onChange={(event) => setEditing({ ...editing, category: event.target.value })}
                  required
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm text-slate-300">
                Durum
                <select
                  value={editing.status}
                  onChange={(event) => setEditing({ ...editing, status: event.target.value as RecordStatus })}
                  className="h-10 rounded-lg border border-white/10 bg-[#101827] px-3 text-sm text-white outline-none"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Öncelik
                <select
                  value={editing.priority}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      priority: event.target.value as ManagedRecord["priority"],
                    })
                  }
                  className="h-10 rounded-lg border border-white/10 bg-[#101827] px-3 text-sm text-white outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Tutar
                <Input
                  type="number"
                  value={editing.amount}
                  onChange={(event) => setEditing({ ...editing, amount: Number(event.target.value) })}
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-slate-300">
              Etiketler
              <Input
                value={editing.tags.join(", ")}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    tags: event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Vazgeç
              </Button>
              <Button type="submit" variant="primary">
                Kaydet
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}

export default DataManagement;
