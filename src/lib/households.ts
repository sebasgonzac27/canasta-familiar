import { supabase } from "@/lib/supabase";
import type { Household, Profile } from "@/types/db";

export type Member = Pick<Profile, "id" | "name" | "avatar_color" | "email"> & { joined_at: string };

/** Households the current user belongs to. */
export async function listMyHouseholds(userId: string): Promise<Household[]> {
  const { data, error } = await supabase
    .from("household_members")
    .select("joined_at, households(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => r.households).filter(Boolean) as Household[];
}

export async function createHousehold(name: string): Promise<Household> {
  const { data, error } = await supabase.rpc("create_household", { _name: name });
  if (error) throw error;
  return data as unknown as Household;
}

export async function joinHousehold(code: string): Promise<Household> {
  const { data, error } = await supabase.rpc("join_household_by_code", { _code: code });
  if (error) throw error;
  return data as unknown as Household;
}

export async function leaveHousehold(householdId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("household_members")
    .delete()
    .eq("household_id", householdId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getMembers(householdId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("household_members")
    .select("joined_at, profiles(id, name, avatar_color, email)")
    .eq("household_id", householdId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r.profiles, joined_at: r.joined_at })) as Member[];
}
