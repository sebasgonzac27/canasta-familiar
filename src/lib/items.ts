import { supabase } from "@/lib/supabase";
import type { Item, ItemStatus, ItemWithAuthor } from "@/types/db";
import { CATEGORIES } from "@/theme";

const AUTHOR_SELECT = "*, added_by_profile:profiles!items_added_by_fkey(id, name, avatar_color)";

/** Active list = items that are pending or checked (confirmed items are cleared). */
export async function fetchActiveItems(householdId: string): Promise<ItemWithAuthor[]> {
  const { data, error } = await supabase
    .from("items")
    .select(AUTHOR_SELECT)
    .eq("household_id", householdId)
    .in("status", ["pending", "checked"])
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ItemWithAuthor[];
}

export async function addItem(args: {
  householdId: string; userId: string; name: string; qty?: string; category?: string;
}): Promise<void> {
  const { error } = await supabase.from("items").insert({
    household_id: args.householdId,
    added_by: args.userId,
    name: args.name.trim(),
    qty: (args.qty ?? "").trim(),
    category: args.category ?? "Otros",
  });
  if (error) throw error;
}

export async function setItemStatus(id: string, status: ItemStatus, userId: string | null): Promise<void> {
  const patch: Partial<Item> =
    status === "checked"
      ? { status, checked_by: userId, checked_at: new Date().toISOString() }
      : { status, checked_by: null, checked_at: null };
  const { error } = await supabase.from("items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

/** Group items by category, in the canonical category order. */
export function groupByCategory(items: ItemWithAuthor[]): [string, ItemWithAuthor[]][] {
  const order = [...CATEGORIES];
  const buckets = new Map<string, ItemWithAuthor[]>();
  for (const it of items) {
    const key = it.category || "Otros";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(it);
  }
  return Array.from(buckets.entries()).sort(
    (a, b) => (order.indexOf(a[0]) + 1 || 99) - (order.indexOf(b[0]) + 1 || 99)
  );
}

/** Recent distinct item names for the "frequents" suggestions. */
export async function fetchFrequentNames(householdId: string, limit = 8): Promise<string[]> {
  const { data } = await supabase
    .from("items")
    .select("name")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(40);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of data ?? []) {
    const n = (r as any).name as string;
    if (!seen.has(n.toLowerCase())) {
      seen.add(n.toLowerCase());
      out.push(n);
    }
    if (out.length >= limit) break;
  }
  return out;
}
