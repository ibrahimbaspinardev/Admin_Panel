import {
  PageIntro,
  PanelCard,
  StatCard,
  StatusBadge,
} from "./_components/panel-elements";
import { packageDetails, products, users } from "./_data/admin";

const activeUsers = users.filter((user) => user.status === "Aktif").length;
const publishedProducts = products.filter(
  (product) => product.status === "Yayında",
).length;
const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Dashboard"
        description="Paket kapsamındaki temel ürün, kullanıcı ve içerik durumunu tek ekranda sade biçimde takip edin."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Toplam Ürün"
          value={String(products.length)}
          note={`${publishedProducts} ürün yayında, 1 ürün taslakta.`}
        />
        <StatCard
          label="Toplam Kullanıcı"
          value={String(users.length)}
          note={`${activeUsers} aktif kullanıcı panelde listeleniyor.`}
        />
        <StatCard
          label="Stok Adedi"
          value={String(totalStock)}
          note="Ürün yönetimindeki temel stok toplamı."
        />
        <StatCard
          label="İçerik Limiti"
          value="10"
          note="Temel paket için örnek içerik sınırı."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <PanelCard
          title="Son İçerik Girişleri"
          description="Ürün ve kullanıcı kayıtlarından oluşan sade bir özet tablo."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="pb-3 font-semibold">Kayıt</th>
                  <th className="pb-3 font-semibold">Tür</th>
                  <th className="pb-3 font-semibold">Durum</th>
                  <th className="pb-3 font-semibold">Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.slice(0, 3).map((product) => (
                  <tr key={product.id}>
                    <td className="py-4 font-medium text-slate-950">
                      {product.name}
                    </td>
                    <td className="py-4 text-slate-600">Ürün</td>
                    <td className="py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="py-4 text-slate-600">
                      {product.category} kategorisi
                    </td>
                  </tr>
                ))}
                {users.slice(0, 2).map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 font-medium text-slate-950">
                      {user.name}
                    </td>
                    <td className="py-4 text-slate-600">Kullanıcı</td>
                    <td className="py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="py-4 text-slate-600">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>

        <PanelCard
          title="Paket Bilgisi"
          description="Bu panel temel paket kapsamına göre sınırlandırılmıştır."
        >
          <div className="space-y-3">
            {packageDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-500">
                  {item.label}
                </span>
                <span className="text-sm font-bold text-slate-950">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </PanelCard>
      </section>
    </div>
  );
}
