export type UserStatus = "Aktif" | "Pasif" | "Beklemede";
export type UserRole = "Admin" | "Editor" | "Destek" | "Musteri";

export type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  orders: number;
  spent: number;
};

export type OrderStatus = "Yeni" | "Hazirlaniyor" | "Tamamlandi" | "Iptal";

export type Order = {
  id: string;
  customer: string;
  email: string;
  product: string;
  status: OrderStatus;
  total: number;
  date: string;
  payment: "Kart" | "Havale" | "Kapida";
  city: string;
};

export type ProductStatus = "Aktif" | "Taslak" | "Stokta Yok";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  sales: number;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: "order" | "system" | "stock" | "user";
  read: boolean;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  tone: "emerald" | "cyan" | "amber" | "rose";
};

export type ChartPoint = {
  label: string;
  value: number;
};
