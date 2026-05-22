import { Badge } from "@/components/ui/badge";
import type { OrderStatus, ProductStatus, UserStatus } from "@/lib/types";

type Status = OrderStatus | ProductStatus | UserStatus;

const statusTone: Record<Status, "slate" | "emerald" | "cyan" | "amber" | "rose"> = {
  Aktif: "emerald",
  Pasif: "slate",
  Beklemede: "amber",
  Yeni: "cyan",
  Hazirlaniyor: "amber",
  Tamamlandi: "emerald",
  Iptal: "rose",
  Taslak: "slate",
  "Stokta Yok": "rose",
};

const statusLabel: Record<Status, string> = {
  Aktif: "Aktif",
  Pasif: "Pasif",
  Beklemede: "Beklemede",
  Yeni: "Yeni",
  Hazirlaniyor: "Hazırlanıyor",
  Tamamlandi: "Tamamlandı",
  Iptal: "İptal",
  Taslak: "Taslak",
  "Stokta Yok": "Stokta Yok",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
}
