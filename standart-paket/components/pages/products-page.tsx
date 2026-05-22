"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Boxes, Edit3, PackagePlus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField, SelectField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePanelData } from "@/components/providers/panel-data-provider";
import { usePanelUI } from "@/components/providers/panel-ui-provider";
import type { Product, ProductStatus } from "@/lib/types";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const emptyProductForm = {
  name: "",
  category: "Yazilim",
  price: 0,
  stock: 0,
  status: "Aktif" as ProductStatus,
};

export function ProductsPage() {
  const { loading, products, addProduct, updateProduct, deleteProduct } = usePanelData();
  const { globalSearch, showToast } = usePanelUI();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tumu");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProductForm);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products],
  );

  const effectiveQuery = (query || globalSearch).trim().toLocaleLowerCase("tr-TR");
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesQuery =
          !effectiveQuery ||
          `${product.name} ${product.category}`
            .toLocaleLowerCase("tr-TR")
            .includes(effectiveQuery);
        const matchesCategory =
          categoryFilter === "Tumu" || product.category === categoryFilter;
        return matchesQuery && matchesCategory;
      }),
    [categoryFilter, effectiveQuery, products],
  );

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProductForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.id, form);
      showToast({
        tone: "success",
        title: "Ürün güncellendi",
        description: `${form.name} bilgileri kaydedildi.`,
      });
    } else {
      await addProduct(form);
      showToast({
        tone: "success",
        title: "Ürün eklendi",
        description: `${form.name} ürün listesine eklendi.`,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`${product.name} ürünü silinsin mi?`)) {
      return;
    }
    await deleteProduct(product.id);
    showToast({
      tone: "info",
      title: "Ürün silindi",
      description: `${product.name} listeden kaldırıldı.`,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Katalog ve stok"
        title="Ürün Yönetimi"
        description="Ürünleri, kategorileri, fiyatları ve stok seviyelerini tek ekrandan yönetin."
        action={<Button icon={PackagePlus} onClick={openCreate}>Ürün ekle</Button>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Toplam ürün
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            {products.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Stok adedi
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            {products.reduce((total, product) => total + product.stock, 0)}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Kategori
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            {categories.length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextField
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ürün veya kategori ara"
              className="pl-10"
            />
          </label>
          <SelectField
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="Tumu">Tüm kategoriler</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "Yazilim" ? "Yazılım" : category}
              </option>
            ))}
          </SelectField>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 font-bold">Ürün</th>
                  <th className="py-3 font-bold">Kategori</th>
                  <th className="py-3 font-bold">Fiyat</th>
                  <th className="py-3 font-bold">Stok</th>
                  <th className="py-3 font-bold">Satış</th>
                  <th className="py-3 font-bold">Durum</th>
                  <th className="py-3 text-right font-bold">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                          <Boxes className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-bold text-slate-950 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {product.category === "Yazilim" ? "Yazılım" : product.category}
                    </td>
                    <td className="py-4 font-semibold text-slate-900 dark:text-slate-100">
                      {currency.format(product.price)}
                    </td>
                    <td className="py-4">
                      <span className={product.stock < 10 ? "font-bold text-rose-600" : ""}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {product.sales}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                          aria-label="Ürün düzenle"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          aria-label="Ürün sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Ürün düzenle" : "Yeni ürün"}
        description="Kategori, stok ve ürün durumunu güncelleyin."
      >
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Ürün adı
            </span>
            <TextField
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Kategori
            </span>
            <TextField
              required
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Durum
            </span>
            <SelectField
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as ProductStatus }))
              }
            >
              <option value="Aktif">Aktif</option>
              <option value="Taslak">Taslak</option>
              <option value="Stokta Yok">Stokta Yok</option>
            </SelectField>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Fiyat
            </span>
            <TextField
              required
              min={0}
              type="number"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: Number(event.target.value) }))
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Stok
            </span>
            <TextField
              required
              min={0}
              type="number"
              value={form.stock}
              onChange={(event) =>
                setForm((current) => ({ ...current, stock: Number(event.target.value) }))
              }
            />
          </label>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Vazgeç
            </Button>
            <Button icon={PackagePlus} type="submit">
              Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
