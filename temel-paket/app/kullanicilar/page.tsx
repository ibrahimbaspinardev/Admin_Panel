import {
  PageIntro,
  PanelCard,
  StatCard,
  StatusBadge,
} from "../_components/panel-elements";
import { users } from "../_data/admin";

const activeUsers = users.filter((user) => user.status === "Aktif").length;
const passiveUsers = users.length - activeUsers;
const managerCount = users.filter((user) => user.role === "Yönetici").length;

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Kullanıcı Paneli"
        description="Gelişmiş yetkilendirme olmadan, temel kullanıcı rolü ve hesap durumunu gösteren sade panel."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Aktif Kullanıcı"
          value={String(activeUsers)}
          note="Panelde aktif görünen hesaplar."
        />
        <StatCard
          label="Pasif Kullanıcı"
          value={String(passiveUsers)}
          note="Şimdilik pasif bırakılmış kayıt."
        />
        <StatCard
          label="Yönetici"
          value={String(managerCount)}
          note="Temel yönetici rolü bulunan hesap."
        />
      </section>

      <PanelCard
        title="Kullanıcı Listesi"
        description="En fazla 10 içerik girişine uygun, basit ve mobil uyumlu tablo görünümü."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="pb-3 font-semibold">Kod</th>
                <th className="pb-3 font-semibold">Ad Soyad</th>
                <th className="pb-3 font-semibold">E-posta</th>
                <th className="pb-3 font-semibold">Rol</th>
                <th className="pb-3 font-semibold">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-4 font-medium text-slate-500">
                    {user.id}
                  </td>
                  <td className="py-4 font-semibold text-slate-950">
                    {user.name}
                  </td>
                  <td className="py-4 text-slate-600">{user.email}</td>
                  <td className="py-4 text-slate-600">{user.role}</td>
                  <td className="py-4">
                    <StatusBadge status={user.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
