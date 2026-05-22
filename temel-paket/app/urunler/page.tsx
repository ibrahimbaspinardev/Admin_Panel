import {
  PageIntro,
  PanelCard,
  StatCard,
  StatusBadge,
} from "../_components/panel-elements";
import { products } from "../_data/admin";

const publishedProducts = products.filter(
  (product) => product.status === "Yayında",
).length;
const draftProducts = products.length - publishedProducts;
const categories = new Set(products.map((product) => product.category)).size;

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Ürün Yönetimi"
        description="Küçük işletmeler için ürün adı, kategori, stok ve durum bilgisini gösteren basit yönetim ekranı."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Yayındaki Ürün"
          value={String(publishedProducts)}
          note="Müşteriye açık ürün sayısı."
        />
        <StatCard
          label="Taslak Ürün"
          value={String(draftProducts)}
          note="Henüz yayına alınmayan kayıt."
        />
        <StatCard
          label="Kategori"
          value={String(categories)}
          note="Temel sınıflandırma alanı."
        />
      </section>

      <PanelCard
        title="Ürün Listesi"
        description="Temel paket sınırına uygun, sade ve okunabilir tablo yapısı."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="pb-3 font-semibold">Kod</th>
                <th className="pb-3 font-semibold">Ürün</th>
                <th className="pb-3 font-semibold">Kategori</th>
                <th className="pb-3 font-semibold">Stok</th>
                <th className="pb-3 font-semibold">Fiyat</th>
                <th className="pb-3 font-semibold">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-4 font-medium text-slate-500">
                    {product.id}
                  </td>
                  <td className="py-4 font-semibold text-slate-950">
                    {product.name}
                  </td>
                  <td className="py-4 text-slate-600">{product.category}</td>
                  <td className="py-4 text-slate-600">{product.stock}</td>
                  <td className="py-4 text-slate-600">{product.price}</td>
                  <td className="py-4">
                    <StatusBadge status={product.status} />
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
