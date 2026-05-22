"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActiveUserPoint,
  ActivityLog,
  AdminProfile,
  AdminSeedData,
  DashboardMetric,
  DashboardWidget,
  LanguageCode,
  ManagedRecord,
  ManagedUser,
  NotificationItem,
  SectionKey,
  SessionRecord,
  SystemStatus,
  ThemeMode,
  ToastMessage,
  UploadedFileItem,
} from "@/types/admin";
import { defaultWidgets, seedData } from "@/utils/seed-data";
import { slugId } from "@/utils/format";

interface AdminState {
  currentUser: AdminProfile | null;
  isAuthenticated: boolean;
  authReady: boolean;
  activeSection: SectionKey;
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  language: LanguageCode;
  commandOpen: boolean;
  users: ManagedUser[];
  records: ManagedRecord[];
  metrics: DashboardMetric[];
  sales: AdminSeedData["sales"];
  activeUsers: ActiveUserPoint[];
  statuses: SystemStatus[];
  activities: ActivityLog[];
  uploads: UploadedFileItem[];
  notifications: NotificationItem[];
  sessions: SessionRecord[];
  widgets: DashboardWidget[];
  selectedUserId: string | null;
  toasts: ToastMessage[];
  setAuthReady: (value: boolean) => void;
  signIn: (profile: AdminProfile) => void;
  signOutLocal: () => void;
  setActiveSection: (section: SectionKey) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: LanguageCode) => void;
  setCommandOpen: (open: boolean) => void;
  updateCurrentUser: (patch: Partial<AdminProfile>) => void;
  hydrateDemoData: () => void;
  setUsers: (users: ManagedUser[]) => void;
  setRecords: (records: ManagedRecord[]) => void;
  setMetrics: (metrics: DashboardMetric[]) => void;
  setActivities: (activities: ActivityLog[]) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  updateUser: (id: string, patch: Partial<ManagedUser>) => void;
  setSelectedUserId: (id: string | null) => void;
  addRecord: (record: ManagedRecord) => void;
  updateRecord: (id: string, patch: Partial<ManagedRecord>) => void;
  deleteRecords: (ids: string[]) => void;
  bulkUpdateRecords: (ids: string[], patch: Partial<ManagedRecord>) => void;
  addUpload: (file: UploadedFileItem) => void;
  updateUpload: (id: string, patch: Partial<UploadedFileItem>) => void;
  pushActivity: (activity: Omit<ActivityLog, "id" | "createdAt">) => void;
  pushNotification: (notification: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  reorderWidgets: (fromId: string, toId: string) => void;
  toggleWidget: (id: string) => void;
  simulateRealtimeTick: () => void;
}

function prepend<T>(items: T[], item: T, limit = 20) {
  return [item, ...items].slice(0, limit);
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      authReady: false,
      activeSection: "dashboard",
      sidebarCollapsed: false,
      theme: "dark",
      language: "tr",
      commandOpen: false,
      users: seedData.users,
      records: seedData.records,
      metrics: seedData.metrics,
      sales: seedData.sales,
      activeUsers: seedData.activeUsers,
      statuses: seedData.statuses,
      activities: seedData.activities,
      uploads: seedData.uploads,
      notifications: seedData.notifications,
      sessions: seedData.sessions,
      widgets: defaultWidgets,
      selectedUserId: null,
      toasts: [],
      setAuthReady: (value) => set({ authReady: value }),
      signIn: (profile) =>
        set({
          currentUser: profile,
          isAuthenticated: true,
          authReady: true,
          activeSection: "dashboard",
        }),
      signOutLocal: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
          authReady: true,
          activeSection: "dashboard",
          commandOpen: false,
        }),
      setActiveSection: (section) => set({ activeSection: section }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCommandOpen: (open) => set({ commandOpen: open }),
      updateCurrentUser: (patch) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...patch } : null,
        })),
      hydrateDemoData: () =>
        set({
          users: seedData.users,
          records: seedData.records,
          metrics: seedData.metrics,
          sales: seedData.sales,
          activeUsers: seedData.activeUsers,
          statuses: seedData.statuses,
          activities: seedData.activities,
          uploads: seedData.uploads,
          notifications: seedData.notifications,
          sessions: seedData.sessions,
        }),
      setUsers: (users) => set({ users }),
      setRecords: (records) => set({ records }),
      setMetrics: (metrics) => set({ metrics }),
      setActivities: (activities) => set({ activities }),
      setNotifications: (notifications) => set({ notifications }),
      updateUser: (id, patch) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...patch } : user,
          ),
        })),
      setSelectedUserId: (id) => set({ selectedUserId: id }),
      addRecord: (record) =>
        set((state) => ({
          records: prepend(state.records, record, 100),
        })),
      updateRecord: (id, patch) =>
        set((state) => ({
          records: state.records.map((record) =>
            record.id === id ? { ...record, ...patch } : record,
          ),
        })),
      deleteRecords: (ids) =>
        set((state) => ({
          records: state.records.filter((record) => !ids.includes(record.id)),
        })),
      bulkUpdateRecords: (ids, patch) =>
        set((state) => ({
          records: state.records.map((record) =>
            ids.includes(record.id) ? { ...record, ...patch } : record,
          ),
        })),
      addUpload: (file) =>
        set((state) => ({
          uploads: prepend(state.uploads, file, 60),
        })),
      updateUpload: (id, patch) =>
        set((state) => ({
          uploads: state.uploads.map((upload) =>
            upload.id === id ? { ...upload, ...patch } : upload,
          ),
        })),
      pushActivity: (activity) =>
        set((state) => ({
          activities: prepend(
            state.activities,
            {
              ...activity,
              id: slugId("act"),
              createdAt: new Date().toISOString(),
            },
            40,
          ),
        })),
      pushNotification: (notification) =>
        set((state) => ({
          notifications: prepend(
            state.notifications,
            {
              ...notification,
              id: slugId("ntf"),
              read: false,
              createdAt: new Date().toISOString(),
            },
            50,
          ),
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({ ...item, read: true })),
        })),
      addToast: (toast) => {
        const id = slugId("toast");
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        window.setTimeout(() => get().removeToast(id), 4200);
      },
      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      reorderWidgets: (fromId, toId) =>
        set((state) => {
          const widgets = [...state.widgets];
          const from = widgets.findIndex((widget) => widget.id === fromId);
          const to = widgets.findIndex((widget) => widget.id === toId);
          if (from < 0 || to < 0) return state;
          const [item] = widgets.splice(from, 1);
          widgets.splice(to, 0, item);
          return { widgets };
        }),
      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, visible: !widget.visible } : widget,
          ),
        })),
      simulateRealtimeTick: () =>
        set((state) => {
          const jitter = Math.floor(Math.random() * 90);
          const nextMetrics = state.metrics.map((metric) => {
            if (metric.id === "active-users") {
              return { ...metric, value: metric.value + jitter };
            }
            if (metric.id === "mrr") {
              return { ...metric, value: metric.value + jitter * 12 };
            }
            return metric;
          });

          const shouldNotify = Math.random() > 0.72;
          const notification: NotificationItem = {
            id: slugId("ntf"),
            title: "Canlı veri güncellendi",
            message: `${jitter} yeni etkileşim Firestore akışına işlendi.`,
            type: "info",
            read: false,
            createdAt: new Date().toISOString(),
          };

          return {
            metrics: nextMetrics,
            activeUsers: state.activeUsers.map((point, index) =>
              index === state.activeUsers.length - 1
                ? {
                    ...point,
                    active: point.active + jitter,
                    mobile: point.mobile + Math.floor(jitter * 0.55),
                    desktop: point.desktop + Math.floor(jitter * 0.45),
                  }
                : point,
            ),
            notifications: shouldNotify
              ? prepend(state.notifications, notification, 50)
              : state.notifications,
          };
        }),
    }),
    {
      name: "pro-admin-panel-state",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
        widgets: state.widgets,
      }),
    },
  ),
);
