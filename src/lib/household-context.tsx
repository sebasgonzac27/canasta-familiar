import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/lib/auth";
import { listMyHouseholds } from "@/lib/households";
import type { Household } from "@/types/db";

const ACTIVE_KEY = "canasta.activeHousehold";

type HouseholdContextValue = {
  loading: boolean;
  households: Household[];
  activeHousehold: Household | null;
  setActiveHousehold: (id: string) => void;
  refresh: () => Promise<void>;
};

const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined);

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setHouseholds([]);
      setActiveId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await listMyHouseholds(user.id);
      setHouseholds(list);
      const stored = await AsyncStorage.getItem(ACTIVE_KEY);
      const valid = list.find((h) => h.id === stored);
      setActiveId(valid ? valid.id : list[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setActiveHousehold = useCallback((id: string) => {
    setActiveId(id);
    AsyncStorage.setItem(ACTIVE_KEY, id).catch(() => {});
  }, []);

  const activeHousehold = useMemo(
    () => households.find((h) => h.id === activeId) ?? null,
    [households, activeId]
  );

  const value = useMemo<HouseholdContextValue>(
    () => ({ loading, households, activeHousehold, setActiveHousehold, refresh }),
    [loading, households, activeHousehold, setActiveHousehold, refresh]
  );

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHouseholds() {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error("useHouseholds must be used within HouseholdProvider");
  return ctx;
}
