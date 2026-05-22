"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Edit3, Plus, Search, Trash2, UserRoundCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField, SelectField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePanelData } from "@/components/providers/panel-data-provider";
import { usePanelUI } from "@/components/providers/panel-ui-provider";
import type { PanelUser, UserRole, UserStatus } from "@/lib/types";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const emptyUserForm = {
  name: "",
  email: "",
  role: "Musteri" as UserRole,
  status: "Aktif" as UserStatus,
};

export function UsersPage() {
  const { loading, users, addUser, updateUser, deleteUser } = usePanelData();
  const { globalSearch, showToast } = usePanelUI();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tumu");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PanelUser | null>(null);
  const [form, setForm] = useState(emptyUserForm);

  const effectiveQuery = (query || globalSearch).trim().toLocaleLowerCase("tr-TR");
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesQuery =
          !effectiveQuery ||
          `${user.name} ${user.email} ${user.role}`
            .toLocaleLowerCase("tr-TR")
            .includes(effectiveQuery);
        const matchesRole = roleFilter === "Tumu" || user.role === roleFilter;
        return matchesQuery && matchesRole;
      }),
    [effectiveQuery, roleFilter, users],
  );

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyUserForm);
    setModalOpen(true);
  };

  const openEdit = (user: PanelUser) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingUser) {
      await updateUser(editingUser.id, form);
      showToast({
        tone: "success",
        title: "Kullanıcı güncellendi",
        description: `${form.name} bilgileri kaydedildi.`,
      });
    } else {
      await addUser(form);
      showToast({
        tone: "success",
        title: "Kullanıcı eklendi",
        description: `${form.name} panele dahil edildi.`,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async (user: PanelUser) => {
    if (!window.confirm(`${user.name} kullanıcısı silinsin mi?`)) {
      return;
    }
    await deleteUser(user.id);
    showToast({
      tone: "info",
      title: "Kullanıcı silindi",
      description: `${user.name} listeden kaldırıldı.`,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Ekip ve müşteri hesapları"
        title="Kullanıcı Yönetimi"
        description="Kullanıcı ekleyin, düzenleyin, silin ve aktif hesapları hızlıca filtreleyin."
        action={<Button icon={Plus} onClick={openCreate}>Kullanıcı ekle</Button>}
      />

      <Card>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextField
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ad, e-posta veya role göre ara"
              className="pl-10"
            />
          </label>
          <SelectField value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="Tumu">Tüm roller</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Destek">Destek</option>
            <option value="Musteri">Müşteri</option>
          </SelectField>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 font-bold">Kullanıcı</th>
                  <th className="py-3 font-bold">Rol</th>
                  <th className="py-3 font-bold">Durum</th>
                  <th className="py-3 font-bold">Sipariş</th>
                  <th className="py-3 font-bold">Harcama</th>
                  <th className="py-3 text-right font-bold">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                          {user.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <div>
                          <p className="font-bold text-slate-950 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-slate-600 dark:text-slate-300">
                      {user.role === "Musteri" ? "Müşteri" : user.role}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{user.orders}</td>
                    <td className="py-4 font-semibold text-slate-900 dark:text-slate-100">
                      {currency.format(user.spent)}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                          aria-label="Kullanıcı düzenle"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          aria-label="Kullanıcı sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Kullanıcı düzenle" : "Yeni kullanıcı"}
        description="Kullanıcı bilgileri Firestore koleksiyonuna uygun formatta tutulur."
      >
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Ad soyad
            </span>
            <TextField
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              E-posta
            </span>
            <TextField
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Rol
            </span>
            <SelectField
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value as UserRole }))
              }
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Destek">Destek</option>
              <option value="Musteri">Müşteri</option>
            </SelectField>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Durum
            </span>
            <SelectField
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as UserStatus }))
              }
            >
              <option value="Aktif">Aktif</option>
              <option value="Beklemede">Beklemede</option>
              <option value="Pasif">Pasif</option>
            </SelectField>
          </label>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Vazgeç
            </Button>
            <Button icon={UserRoundCheck} type="submit">
              Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
