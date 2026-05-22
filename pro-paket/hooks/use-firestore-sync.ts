"use client";

import { useEffect } from "react";
import {
  hasLiveFirestore,
  subscribeAdminCollections,
} from "@/services/firestore-service";
import { useAdminStore } from "@/store/admin-store";

export function useFirestoreSync() {
  const hydrateDemoData = useAdminStore((state) => state.hydrateDemoData);
  const setUsers = useAdminStore((state) => state.setUsers);
  const setRecords = useAdminStore((state) => state.setRecords);
  const setMetrics = useAdminStore((state) => state.setMetrics);
  const setActivities = useAdminStore((state) => state.setActivities);
  const setNotifications = useAdminStore((state) => state.setNotifications);
  const simulateRealtimeTick = useAdminStore((state) => state.simulateRealtimeTick);

  useEffect(() => {
    if (!hasLiveFirestore()) {
      hydrateDemoData();
    }

    const unsubscribe = subscribeAdminCollections({
      users: setUsers,
      records: setRecords,
      metrics: setMetrics,
      activities: setActivities,
      notifications: setNotifications,
    });

    const interval = window.setInterval(() => {
      simulateRealtimeTick();
    }, 5200);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [
    hydrateDemoData,
    setActivities,
    setMetrics,
    setNotifications,
    setRecords,
    setUsers,
    simulateRealtimeTick,
  ]);
}
