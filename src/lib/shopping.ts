import { supabase } from "@/lib/supabase";
import type { ShoppingSession } from "@/types/db";

/** The open shopping session for a household, if any, with the starter's profile. */
export async function fetchActiveSession(householdId: string) {
  const { data, error } = await supabase
    .from("shopping_sessions")
    .select("*, starter:profiles!shopping_sessions_started_by_fkey(id, name, avatar_color)")
    .eq("household_id", householdId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as (ShoppingSession & { starter: { id: string; name: string; avatar_color: string } | null }) | null;
}

/** Start a session (or return the existing open one). */
export async function startShopping(householdId: string, userId: string): Promise<ShoppingSession> {
  const existing = await fetchActiveSession(householdId);
  if (existing) return existing;
  const { data, error } = await supabase
    .from("shopping_sessions")
    .insert({ household_id: householdId, started_by: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Confirm the run: checked → confirmed (cleared), unchecked stay pending, session closes. */
export async function confirmShopping(sessionId: string): Promise<void> {
  const { error } = await supabase.rpc("confirm_shopping", { _session: sessionId });
  if (error) throw error;
}

/** Close a session without confirming (e.g. "seguir comprando" → exit). */
export async function endSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("shopping_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId)
    .is("ended_at", null);
  if (error) throw error;
}
