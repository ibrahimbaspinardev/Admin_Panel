"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  Shield,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useDebounce } from "@/hooks/use-debounce";
import { updateRemoteUser } from "@/services/firestore-service";
import { useAdminStore } from "@/store/admin-store";
import type { AdminRole, ManagedUser, UserStatus } from "@/types/admin";
import { currency, dateTime, relativeTime } from "@/utils/format";
import {
  canChangeRole,
  canManageUsers,
  formatRole,
} from "@/utils/permissions";
import { exportUsersToExcel, exportUsersToPdf } from "@/utils/exporters";

const roleOptions: AdminRole[] = ["super_admin", "admin", "moderator", "editor"];
const statusOptions: Array<UserStatus | "all"> = ["all", "active", "passive", "banned"];

function statusTone(status: UserStatus) {
  if (status === "active") return "green";
  if (status === "banned") return "rose";
  return "amber";
}

function statusLabel(status: UserStatus) {
  const labels: Record<UserStatus, string> = {
    active: "Aktif",
    passive: "Pasif",
    banned: "Banlı",
  };
  return labels[status];
}

export function UsersManagement() {
  const users = useAdminStore((state) => state.users);
  const currentUser = useAdminStore((state) => state.currentUser);
  const updateUser = useAdminStore((state) => state.updateUser);
  const selectedUserId = useAdminStore((state) => state.selectedUserId);
  const setSelectedUserId = useAdminStore((state) => state.setSelectedUserId);
  const addToast = useAdminStore((state) => state.addToast);
  const pushActivity = useAdminStore((state) => state.pushActivity);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const debouncedQuery = useDebounce(query, 200);

  const role = currentUser?.role || "editor";
  const canManage = canManageUsers(role);

  const filteredUsers = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !needle ||
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle) ||
        user.location.toLowerCase().includes(needle);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [debouncedQuery, roleFilter, statusFilter, users]);

  const selectedUser = users.find((user) => user.id === selectedUserId) || null;

  async function changeRole(user: ManagedUser, nextRole: AdminRole) {
    if (!canChangeRole(role, user.role)) {
      addToast({
        title: "Yetki reddedildi",
        message: "Rol değiştirme sadece Super Admin için açık.",
        variant: "warning",
      });
      return;
    }

    updateUser(user.id, { role: nextRole });
    await updateRemoteUser(user.id, { role: nextRole }).catch(() => undefined);
    pushActivity({
      actor: currentUser?.name || "Admin",
      actorRole: role,
      action: "Rol güncelledi",
      target: `${user.name} -> ${formatRole(nextRole)}`,
      level: "info",
      ip: "local",
    });
    addToast({
      title: "Rol güncellendi",
      message: `${user.name} artık ${formatRole(nextRole)}.`,
      variant: "success",
    });
  }

  async function toggleBan(user: ManagedUser) {
    if (!canManage) return;
    const nextStatus: UserStatus = user.status === "banned" ? "active" : "banned";
    updateUser(user.id, { status: nextStatus });
    await updateRemoteUser(user.id, { status: nextStatus }).catch(() => undefined);
    pushActivity({
      actor: currentUser?.name || "Admin",
      actorRole: role,
      action: nextStatus === "banned" ? "Kullanıcı banladı" : "Ban kaldırdı",
      target: user.name,
      level: nextStatus === "banned" ? "warning" : "info",
      ip: "local",
    });
    addToast({
      title: nextStatus === "banned" ? "Kullanıcı banlandı" : "Ban kaldırıldı",
      message: `${user.name} durumu ${statusLabel(nextStatus)} olarak güncellendi.`,
      variant: nextStatus === "banned" ? "warning" : "success",
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            className="pl-10"
            placeholder="Ad, e-posta veya lokasyon ara..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as AdminRole | "all")}
            className="h-10 rounded-lg border border-white/10 bg-[#101827] px-3 text-sm text-white outline-none"
          >
            <option value="all">Tüm roller</option>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {formatRole(option)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as UserStatus | "all")}
            className="h-10 rounded-lg border border-white/10 bg-[#101827] px-3 text-sm text-white outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Tüm durumlar" : statusLabel(option)}
              </option>
            ))}
          </select>
          <Button onClick={() => exportUsersToExcel(filteredUsers)}>
            <Filter className="h-4 w-4" />
            Excel
          </Button>
          <Button onClick={() => exportUsersToPdf(filteredUsers)}>PDF</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">
                <th className="px-4 py-3 font-medium">Kullanıcı</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Gelir</th>
                <th className="px-4 py-3 font-medium">Son aktiflik</th>
                <th className="px-4 py-3 text-right font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 transition hover:bg-white/[0.04]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{user.name}</p>
                          {user.verified ? <CheckCircle2 className="h-3.5 w-3.5 text-cyan-200" /> : null}
                        </div>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(event) => changeRole(user, event.target.value as AdminRole)}
                      disabled={!canChangeRole(role, user.role)}
                      className="h-9 rounded-md border border-white/10 bg-[#101827] px-2 text-xs text-white outline-none disabled:opacity-60"
                    >
                      {roleOptions.map((option) => (
                        <option key={option} value={option}>
                          {formatRole(option)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(user.status)}>{statusLabel(user.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{user.plan}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{currency.format(user.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{relativeTime(user.lastActive)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedUserId(user.id)} aria-label="Detay">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canManage ? (
                        <Button
                          size="icon"
                          variant={user.status === "banned" ? "success" : "danger"}
                          onClick={() => toggleBan(user)}
                          aria-label={user.status === "banned" ? "Ban kaldır" : "Banla"}
                        >
                          {user.status === "banned" ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" disabled aria-label="Yetki yok">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="grid place-items-center px-4 py-16 text-center">
            <Shield className="mb-3 h-8 w-8 text-slate-600" />
            <p className="font-medium text-white">Kullanıcı bulunamadı</p>
            <p className="mt-1 text-sm text-slate-500">Filtreleri değiştirip tekrar deneyin.</p>
          </div>
        ) : null}
      </Card>

      <Modal open={Boolean(selectedUser)} title="Kullanıcı detayı" onClose={() => setSelectedUserId(null)}>
        {selectedUser ? (
          <div className="grid gap-5 md:grid-cols-[180px_1fr]">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedUser.avatarUrl}
                alt={selectedUser.name}
                className="aspect-square w-full rounded-lg object-cover"
              />
            </div>
            <div className="grid gap-3 text-sm">
              <div>
                <h3 className="text-2xl font-semibold text-white">{selectedUser.name}</h3>
                <p className="text-slate-400">{selectedUser.email}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Rol", formatRole(selectedUser.role)],
                  ["Durum", statusLabel(selectedUser.status)],
                  ["Plan", selectedUser.plan],
                  ["Gelir", currency.format(selectedUser.revenue)],
                  ["Konum", selectedUser.location],
                  ["Oturum", `${selectedUser.sessions} aktif cihaz`],
                  ["Kayıt", dateTime.format(new Date(selectedUser.createdAt))],
                  ["Son aktiflik", dateTime.format(new Date(selectedUser.lastActive))],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default UsersManagement;
