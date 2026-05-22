"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase/client";
import type {
  ActivityLog,
  DashboardMetric,
  ManagedRecord,
  ManagedUser,
  NotificationItem,
} from "@/types/admin";

export function hasLiveFirestore() {
  return Boolean(firestoreDb);
}

export interface FirestoreSubscriptions {
  users?: (items: ManagedUser[]) => void;
  records?: (items: ManagedRecord[]) => void;
  activities?: (items: ActivityLog[]) => void;
  notifications?: (items: NotificationItem[]) => void;
  metrics?: (items: DashboardMetric[]) => void;
}

function mapDocs<T>(snapshot: { docs: Array<{ id: string; data: () => unknown }> }) {
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as object) })) as T[];
}

export function subscribeAdminCollections(callbacks: FirestoreSubscriptions) {
  if (!firestoreDb) return () => undefined;

  const subscriptions: Unsubscribe[] = [];

  if (callbacks.users) {
    subscriptions.push(
      onSnapshot(collection(firestoreDb, "managedUsers"), (snapshot) => {
        callbacks.users?.(mapDocs<ManagedUser>(snapshot));
      }),
    );
  }

  if (callbacks.records) {
    subscriptions.push(
      onSnapshot(collection(firestoreDb, "managedRecords"), (snapshot) => {
        callbacks.records?.(mapDocs<ManagedRecord>(snapshot));
      }),
    );
  }

  if (callbacks.activities) {
    subscriptions.push(
      onSnapshot(
        query(collection(firestoreDb, "activityLogs"), orderBy("createdAt", "desc")),
        (snapshot) => callbacks.activities?.(mapDocs<ActivityLog>(snapshot)),
      ),
    );
  }

  if (callbacks.notifications) {
    subscriptions.push(
      onSnapshot(
        query(collection(firestoreDb, "notifications"), orderBy("createdAt", "desc")),
        (snapshot) => callbacks.notifications?.(mapDocs<NotificationItem>(snapshot)),
      ),
    );
  }

  if (callbacks.metrics) {
    subscriptions.push(
      onSnapshot(collection(firestoreDb, "dashboardMetrics"), (snapshot) => {
        callbacks.metrics?.(mapDocs<DashboardMetric>(snapshot));
      }),
    );
  }

  return () => subscriptions.forEach((unsubscribe) => unsubscribe());
}

export async function updateRemoteUser(id: string, patch: Partial<ManagedUser>) {
  const db = firestoreDb;
  if (!db) return;
  await updateDoc(doc(db, "managedUsers", id), patch);
}

export async function upsertRemoteRecord(record: ManagedRecord) {
  const db = firestoreDb;
  if (!db) return;
  await setDoc(doc(db, "managedRecords", record.id), record, {
    merge: true,
  });
}

export async function deleteRemoteRecords(ids: string[]) {
  const db = firestoreDb;
  if (!db) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(doc(db, "managedRecords", id)));
  await batch.commit();
}

export async function addRemoteActivity(activity: Omit<ActivityLog, "id">) {
  const db = firestoreDb;
  if (!db) return;
  await addDoc(collection(db, "activityLogs"), {
    ...activity,
    createdAt: activity.createdAt || serverTimestamp(),
  });
}

export async function markRemoteNotificationRead(id: string) {
  const db = firestoreDb;
  if (!db) return;
  await updateDoc(doc(db, "notifications", id), { read: true });
}

export async function deleteRemoteNotification(id: string) {
  const db = firestoreDb;
  if (!db) return;
  await deleteDoc(doc(db, "notifications", id));
}
