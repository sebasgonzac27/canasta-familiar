import { useEffect, useRef, useState, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { fetchActiveItems } from "@/lib/items";
import { fetchActiveSession } from "@/lib/shopping";
import { getMembers, type Member } from "@/lib/households";
import type { ItemWithAuthor, ShoppingSession } from "@/types/db";

type Session = (ShoppingSession & { starter: { id: string; name: string; avatar_color: string } | null }) | null;

export type RealtimeEvent =
  | { kind: "item_added"; byUserId: string | null }
  | { kind: "shopping_started"; byUserId: string | null };

interface HouseholdState {
  items: ItemWithAuthor[];
  members: Member[];
  session: Session;
  onlineIds: string[];
  loading: boolean;
}

const emptyState = (): HouseholdState => ({
  items: [],
  members: [],
  session: null,
  onlineIds: [],
  loading: true,
});

/**
 * One shared store per household. Several screens can be mounted at once (a
 * Stack keeps previous screens alive), and Supabase reuses a Realtime channel
 * by topic — so each consumer must NOT create/subscribe its own channel.
 * Instead they all share a single ref-counted channel here.
 */
interface Store {
  householdId: string;
  currentUserId: string | null;
  refCount: number;
  channel: RealtimeChannel | null;
  state: HouseholdState;
  listeners: Set<() => void>;
  eventListeners: Set<(e: RealtimeEvent) => void>;
  teardownTimer: ReturnType<typeof setTimeout> | null;
}

const stores = new Map<string, Store>();

// Keep the channel alive briefly after the last consumer unmounts so rapid
// navigation / StrictMode remounts reuse it instead of fighting the async
// unsubscribe (which is what triggered the "after subscribe()" crash).
const TEARDOWN_DELAY_MS = 5000;

function emit(s: Store) {
  s.listeners.forEach((l) => l());
}

function patch(s: Store, p: Partial<HouseholdState>) {
  s.state = { ...s.state, ...p };
  emit(s);
}

async function refresh(s: Store) {
  const [its, mem, sess] = await Promise.all([
    fetchActiveItems(s.householdId),
    getMembers(s.householdId),
    fetchActiveSession(s.householdId),
  ]);
  patch(s, { items: its, members: mem, session: sess, loading: false });
}

function setupChannel(s: Store) {
  const filter = `household_id=eq.${s.householdId}`;
  const channel = supabase.channel(`household:${s.householdId}`, {
    config: { presence: { key: s.currentUserId ?? "anon" } },
  });
  s.channel = channel;

  channel
    .on("postgres_changes", { event: "*", schema: "public", table: "items", filter }, (payload) => {
      if (payload.eventType === "INSERT") {
        const by = (payload.new as any)?.added_by ?? null;
        if (by && by !== s.currentUserId) s.eventListeners.forEach((fn) => fn({ kind: "item_added", byUserId: by }));
      }
      refresh(s);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "shopping_sessions", filter }, (payload) => {
      if (payload.eventType === "INSERT") {
        const by = (payload.new as any)?.started_by ?? null;
        if (by && by !== s.currentUserId) s.eventListeners.forEach((fn) => fn({ kind: "shopping_started", byUserId: by }));
      }
      refresh(s);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "household_members", filter }, () => refresh(s))
    .on("presence", { event: "sync" }, () => {
      patch(s, { onlineIds: Object.keys(channel.presenceState()) });
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED" && s.currentUserId) {
        channel.track({ user_id: s.currentUserId, at: Date.now() });
      }
    });
}

function acquire(householdId: string, currentUserId: string | null, onEvent: (e: RealtimeEvent) => void): Store {
  let s = stores.get(householdId);
  if (!s) {
    s = {
      householdId,
      currentUserId,
      refCount: 0,
      channel: null,
      state: emptyState(),
      listeners: new Set(),
      eventListeners: new Set(),
      teardownTimer: null,
    };
    stores.set(householdId, s);
  }
  s.currentUserId = currentUserId;
  if (s.teardownTimer) {
    clearTimeout(s.teardownTimer);
    s.teardownTimer = null;
  }
  s.refCount++;
  s.eventListeners.add(onEvent);
  if (!s.channel) {
    setupChannel(s);
    refresh(s);
  }
  return s;
}

function release(s: Store, onEvent: (e: RealtimeEvent) => void) {
  s.eventListeners.delete(onEvent);
  s.refCount--;
  if (s.refCount > 0) return;
  s.teardownTimer = setTimeout(() => {
    if (s.refCount > 0) return;
    if (s.channel) supabase.removeChannel(s.channel);
    stores.delete(s.householdId);
  }, TEARDOWN_DELAY_MS);
}

/**
 * Loads a household's active items, members and shopping session, then keeps
 * them in sync via Supabase Realtime (table changes) + Presence (who's online).
 * `onEvent` fires for changes made by *other* members (for toasts).
 */
export function useHouseholdData(
  householdId: string | null,
  currentUserId: string | null,
  onEvent?: (e: RealtimeEvent) => void
) {
  const [state, setState] = useState<HouseholdState>(emptyState);
  const eventRef = useRef(onEvent);
  eventRef.current = onEvent;

  useEffect(() => {
    if (!householdId) {
      setState({ items: [], members: [], session: null, onlineIds: [], loading: false });
      return;
    }
    const handler = (e: RealtimeEvent) => eventRef.current?.(e);
    const s = acquire(householdId, currentUserId, handler);
    const listener = () => setState(s.state);
    s.listeners.add(listener);
    setState(s.state);
    return () => {
      s.listeners.delete(listener);
      release(s, handler);
    };
  }, [householdId, currentUserId]);

  const refreshFn = useCallback(() => {
    const s = householdId ? stores.get(householdId) : null;
    return s ? refresh(s) : Promise.resolve();
  }, [householdId]);

  const setItems = useCallback(
    (value: ItemWithAuthor[] | ((prev: ItemWithAuthor[]) => ItemWithAuthor[])) => {
      const s = householdId ? stores.get(householdId) : null;
      if (!s) return;
      patch(s, { items: typeof value === "function" ? value(s.state.items) : value });
    },
    [householdId]
  );

  const setSession = useCallback(
    (value: Session | ((prev: Session) => Session)) => {
      const s = householdId ? stores.get(householdId) : null;
      if (!s) return;
      patch(s, { session: typeof value === "function" ? value(s.state.session) : value });
    },
    [householdId]
  );

  return {
    items: state.items,
    members: state.members,
    session: state.session,
    onlineIds: state.onlineIds,
    loading: state.loading,
    refresh: refreshFn,
    setItems,
    setSession,
  };
}
