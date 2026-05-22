export type AdminRole = "super_admin" | "admin" | "moderator" | "editor";

export type UserStatus = "active" | "passive" | "banned";

export type ThemeMode = "dark" | "light" | "system";

export type LanguageCode = "tr" | "en";

export type SectionKey =
  | "dashboard"
  | "users"
  | "data"
  | "uploads"
  | "activity"
  | "notifications"
  | "settings";

export type ToastVariant = "success" | "error" | "info" | "warning";

export type RecordStatus = "published" | "draft" | "archived";

export type UploadStatus = "queued" | "uploading" | "done" | "error";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl: string;
  lastLogin: string;
  provider: "password" | "google" | "demo";
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: UserStatus;
  avatarUrl: string;
  plan: "Free" | "Pro" | "Business" | "Enterprise";
  createdAt: string;
  lastActive: string;
  revenue: number;
  location: string;
  verified: boolean;
  sessions: number;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  change: number;
  trend: "up" | "down";
  description: string;
}

export interface SalesDataPoint {
  label: string;
  revenue: number;
  users: number;
  churn: number;
}

export interface ActiveUserPoint {
  hour: string;
  active: number;
  mobile: number;
  desktop: number;
}

export interface SystemStatus {
  service: string;
  status: "operational" | "degraded" | "maintenance";
  latency: number;
  uptime: number;
}

export interface ActivityLog {
  id: string;
  actor: string;
  actorRole: AdminRole;
  action: string;
  target: string;
  level: "info" | "warning" | "critical";
  createdAt: string;
  ip: string;
}

export interface ManagedRecord {
  id: string;
  title: string;
  owner: string;
  category: string;
  status: RecordStatus;
  priority: "Low" | "Medium" | "High";
  updatedAt: string;
  amount: number;
  tags: string[];
}

export interface UploadedFileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  status: UploadStatus;
  progress: number;
  url?: string;
  uploadedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: ToastVariant;
  read: boolean;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  user: string;
  device: string;
  location: string;
  ip: string;
  status: "active" | "expired" | "revoked";
  startedAt: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: "metrics" | "sales" | "active-users" | "system" | "activity";
  visible: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
}

export interface AdminSeedData {
  users: ManagedUser[];
  metrics: DashboardMetric[];
  sales: SalesDataPoint[];
  activeUsers: ActiveUserPoint[];
  statuses: SystemStatus[];
  activities: ActivityLog[];
  records: ManagedRecord[];
  uploads: UploadedFileItem[];
  notifications: NotificationItem[];
  sessions: SessionRecord[];
}
