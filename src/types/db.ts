export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      household_members: {
        Row: {
          household_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          household_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          household_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          added_by: string | null
          category: string
          checked_at: string | null
          checked_by: string | null
          confirmed_at: string | null
          created_at: string
          household_id: string
          id: string
          name: string
          qty: string
          status: Database["public"]["Enums"]["item_status"]
        }
        Insert: {
          added_by?: string | null
          category?: string
          checked_at?: string | null
          checked_by?: string | null
          confirmed_at?: string | null
          created_at?: string
          household_id: string
          id?: string
          name: string
          qty?: string
          status?: Database["public"]["Enums"]["item_status"]
        }
        Update: {
          added_by?: string | null
          category?: string
          checked_at?: string | null
          checked_by?: string | null
          confirmed_at?: string | null
          created_at?: string
          household_id?: string
          id?: string
          name?: string
          qty?: string
          status?: Database["public"]["Enums"]["item_status"]
        }
        Relationships: [
          {
            foreignKeyName: "items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_color: string
          created_at: string
          email: string | null
          id: string
          name: string
        }
        Insert: {
          avatar_color?: string
          created_at?: string
          email?: string | null
          id: string
          name?: string
        }
        Update: {
          avatar_color?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      shopping_sessions: {
        Row: {
          ended_at: string | null
          household_id: string
          id: string
          started_at: string
          started_by: string | null
        }
        Insert: {
          ended_at?: string | null
          household_id: string
          id?: string
          started_at?: string
          started_by?: string | null
        }
        Update: {
          ended_at?: string | null
          household_id?: string
          id?: string
          started_at?: string
          started_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_sessions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_sessions_started_by_fkey"
            columns: ["started_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      confirm_shopping: { Args: { _session: string }; Returns: undefined }
      create_household: {
        Args: { _name: string }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          invite_code: string
          name: string
        }
      }
      generate_invite_code: { Args: never; Returns: string }
      is_household_member: {
        Args: { _household: string; _user: string }
        Returns: boolean
      }
      join_household_by_code: {
        Args: { _code: string }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          invite_code: string
          name: string
        }
      }
      shares_household: { Args: { _a: string; _b: string }; Returns: boolean }
    }
    Enums: {
      item_status: "pending" | "checked" | "confirmed"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Profile = PublicSchema["Tables"]["profiles"]["Row"]
export type Household = PublicSchema["Tables"]["households"]["Row"]
export type HouseholdMember = PublicSchema["Tables"]["household_members"]["Row"]
export type ShoppingSession = PublicSchema["Tables"]["shopping_sessions"]["Row"]
export type Item = PublicSchema["Tables"]["items"]["Row"]
export type ItemStatus = PublicSchema["Enums"]["item_status"]

/** An item joined with the profile of whoever added it. */
export type ItemWithAuthor = Item & { added_by_profile: Pick<Profile, "id" | "name" | "avatar_color"> | null }
