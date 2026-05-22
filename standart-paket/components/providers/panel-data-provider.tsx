"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  revenueChart,
  seedActivities,
  seedNotifications,
  seedOrders,
  seedProducts,
  seedUsers,
  userGrowthChart,
} from "@/lib/demo-data";
import { getFirebaseServices } from "@/lib/firebase";
import type {
  ActivityItem,
  ChartPoint,
  NotificationItem,
  Order,
  OrderStatus,
  PanelUser,
  Product,
} from "@/lib/types";
import { useAuth } from "@/components/providers/auth-provider";

type PanelDataContextValue = {
  loading: boolean;
  users: PanelUser[];
  orders: Order[];
  products: Product[];
  notifications: NotificationItem[];
  activities: ActivityItem[];
  revenue: ChartPoint[];
  userGrowth: ChartPoint[];
  addUser: (user: Omit<PanelUser, "id" | "orders" | "spent" | "joinedAt">) => Promise<void>;
  updateUser: (id: string, user: Partial<PanelUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "sales">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const PanelDataContext = createContext<PanelDataContextValue | null>(null);

function withId<T extends { id: string }>(snapshotDocs: { id: string; data: () => unknown }[]) {
  return snapshotDocs.map((item) => ({ ...(item.data() as T), id: item.id }));
}

export function PanelDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, authReady, firebaseEnabled } = useAuth();
  const services = useMemo(() => getFirebaseServices(), []);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(seedUsers);
  const [orders, setOrders] = useState(seedOrders);
  const [products, setProducts] = useState(seedProducts);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [activities] = useState(seedActivities);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!services || !authReady || !isAuthenticated) {
      return;
    }

    const unsubscribers = [
      onSnapshot(collection(services.db, "panelUsers"), (snapshot) => {
        if (!snapshot.empty) {
          setUsers(withId<PanelUser>(snapshot.docs));
        }
        setLoading(false);
      }),
      onSnapshot(collection(services.db, "orders"), (snapshot) => {
        if (!snapshot.empty) {
          setOrders(withId<Order>(snapshot.docs));
        }
      }),
      onSnapshot(collection(services.db, "products"), (snapshot) => {
        if (!snapshot.empty) {
          setProducts(withId<Product>(snapshot.docs));
        }
      }),
      onSnapshot(collection(services.db, "notifications"), (snapshot) => {
        if (!snapshot.empty) {
          setNotifications(withId<NotificationItem>(snapshot.docs));
        }
      }),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [authReady, isAuthenticated, services]);

  const writeDocument = useCallback(
    async (path: string, id: string, data: object) => {
      if (!services || !firebaseEnabled) {
        return;
      }
      await setDoc(doc(services.db, path, id), { ...data, updatedAt: serverTimestamp() });
    },
    [firebaseEnabled, services],
  );

  const addUser = useCallback(
    async (user: Omit<PanelUser, "id" | "orders" | "spent" | "joinedAt">) => {
      const nextUser: PanelUser = {
        ...user,
        id: `USR-${Date.now().toString().slice(-5)}`,
        joinedAt: new Date().toISOString().slice(0, 10),
        orders: 0,
        spent: 0,
      };
      setUsers((current) => [nextUser, ...current]);
      await writeDocument("panelUsers", nextUser.id, nextUser);
    },
    [writeDocument],
  );

  const updateUser = useCallback(
    async (id: string, user: Partial<PanelUser>) => {
      setUsers((current) =>
        current.map((item) => (item.id === id ? { ...item, ...user } : item)),
      );
      if (services && firebaseEnabled) {
        await updateDoc(doc(services.db, "panelUsers", id), user);
      }
    },
    [firebaseEnabled, services],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      setUsers((current) => current.filter((item) => item.id !== id));
      if (services && firebaseEnabled) {
        await deleteDoc(doc(services.db, "panelUsers", id));
      }
    },
    [firebaseEnabled, services],
  );

  const addProduct = useCallback(
    async (product: Omit<Product, "id" | "sales">) => {
      const nextProduct: Product = {
        ...product,
        id: `PRD-${Date.now().toString().slice(-4)}`,
        sales: 0,
      };
      setProducts((current) => [nextProduct, ...current]);
      await writeDocument("products", nextProduct.id, nextProduct);
    },
    [writeDocument],
  );

  const updateProduct = useCallback(
    async (id: string, product: Partial<Product>) => {
      setProducts((current) =>
        current.map((item) => (item.id === id ? { ...item, ...product } : item)),
      );
      if (services && firebaseEnabled) {
        await updateDoc(doc(services.db, "products", id), product);
      }
    },
    [firebaseEnabled, services],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      setProducts((current) => current.filter((item) => item.id !== id));
      if (services && firebaseEnabled) {
        await deleteDoc(doc(services.db, "products", id));
      }
    },
    [firebaseEnabled, services],
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      setOrders((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      if (services && firebaseEnabled) {
        await updateDoc(doc(services.db, "orders", id), { status });
      }
    },
    [firebaseEnabled, services],
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      if (services && firebaseEnabled) {
        await updateDoc(doc(services.db, "notifications", id), { read: true });
      }
    },
    [firebaseEnabled, services],
  );

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    if (services && firebaseEnabled) {
      await addDoc(collection(services.db, "systemEvents"), {
        type: "notifications.readAll",
        createdAt: serverTimestamp(),
      });
    }
  }, [firebaseEnabled, services]);

  const value = useMemo(
    () => ({
      loading,
      users,
      orders,
      products,
      notifications,
      activities,
      revenue: revenueChart,
      userGrowth: userGrowthChart,
      addUser,
      updateUser,
      deleteUser,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      activities,
      addProduct,
      addUser,
      deleteProduct,
      deleteUser,
      loading,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      orders,
      products,
      updateOrderStatus,
      updateProduct,
      updateUser,
      users,
    ],
  );

  return <PanelDataContext.Provider value={value}>{children}</PanelDataContext.Provider>;
}

export function usePanelData() {
  const context = useContext(PanelDataContext);
  if (!context) {
    throw new Error("usePanelData must be used within PanelDataProvider");
  }
  return context;
}
