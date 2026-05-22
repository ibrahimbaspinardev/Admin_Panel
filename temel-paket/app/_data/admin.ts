export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: string;
  status: "Yayında" | "Taslak";
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "Yönetici" | "Editör" | "Destek";
  status: "Aktif" | "Pasif";
};

export const products: Product[] = [
  {
    id: "URN-001",
    name: "Kahve Paketi",
    category: "Gıda",
    stock: 24,
    price: "320 TL",
    status: "Yayında",
  },
  {
    id: "URN-002",
    name: "Seramik Kupa",
    category: "Aksesuar",
    stock: 18,
    price: "180 TL",
    status: "Yayında",
  },
  {
    id: "URN-003",
    name: "Not Defteri",
    category: "Kırtasiye",
    stock: 42,
    price: "95 TL",
    status: "Yayında",
  },
  {
    id: "URN-004",
    name: "Masa Lambası",
    category: "Ofis",
    stock: 9,
    price: "740 TL",
    status: "Yayında",
  },
  {
    id: "URN-005",
    name: "Bez Çanta",
    category: "Aksesuar",
    stock: 0,
    price: "150 TL",
    status: "Taslak",
  },
];

export const users: User[] = [
  {
    id: "KUL-001",
    name: "Ayşe Demir",
    email: "ayse@firma.com",
    role: "Yönetici",
    status: "Aktif",
  },
  {
    id: "KUL-002",
    name: "Mehmet Arslan",
    email: "mehmet@firma.com",
    role: "Editör",
    status: "Aktif",
  },
  {
    id: "KUL-003",
    name: "Elif Kaya",
    email: "elif@firma.com",
    role: "Destek",
    status: "Aktif",
  },
  {
    id: "KUL-004",
    name: "Burak Yılmaz",
    email: "burak@firma.com",
    role: "Editör",
    status: "Pasif",
  },
  {
    id: "KUL-005",
    name: "Zeynep Acar",
    email: "zeynep@firma.com",
    role: "Destek",
    status: "Aktif",
  },
];

export const packageDetails = [
  { label: "Paket", value: "Başlangıç Admin Paneli" },
  { label: "Fiyat", value: "1000 TL" },
  { label: "Teslim", value: "2 gün" },
  { label: "Revizyon", value: "1" },
];
