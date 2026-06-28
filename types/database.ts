// Supabase Database types — manually written
// Run `supabase gen types typescript` after connecting to actual Supabase project
// to replace this with auto-generated types

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      weddings: {
        Row: Wedding
        Insert: Partial<Wedding> & { user_id: string }
        Update: Partial<Omit<Wedding, 'id' | 'user_id' | 'created_at'>>
      }
      budget_categories: {
        Row: BudgetCategory
        Insert: Partial<BudgetCategory> & { wedding_id: string; name: string }
        Update: Partial<Omit<BudgetCategory, 'id' | 'wedding_id' | 'created_at'>>
      }
      expenses: {
        Row: Expense
        Insert: Partial<Expense> & { wedding_id: string; name: string; amount: number }
        Update: Partial<Omit<Expense, 'id' | 'wedding_id' | 'created_at'>>
      }
      milestones: {
        Row: Milestone
        Insert: Partial<Milestone> & { wedding_id: string; title: string }
        Update: Partial<Omit<Milestone, 'id' | 'wedding_id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Partial<Task> & { wedding_id: string; title: string }
        Update: Partial<Omit<Task, 'id' | 'wedding_id' | 'created_at'>>
      }
      seserahan_items: {
        Row: SeserahanItem
        Insert: Partial<SeserahanItem> & { wedding_id: string; name: string }
        Update: Partial<Omit<SeserahanItem, 'id' | 'wedding_id' | 'created_at'>>
      }
      kua_documents: {
        Row: KuaDocument
        Insert: Partial<KuaDocument> & { wedding_id: string; name: string }
        Update: Partial<Omit<KuaDocument, 'id' | 'wedding_id' | 'created_at'>>
      }
      guests: {
        Row: Guest
        Insert: Partial<Guest> & { wedding_id: string; name: string }
        Update: Partial<Omit<Guest, 'id' | 'wedding_id' | 'created_at'>>
      }
      vendors: {
        Row: Vendor
        Insert: Partial<Vendor> & { wedding_id: string; name: string; category: string }
        Update: Partial<Omit<Vendor, 'id' | 'wedding_id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: {
      seed_wedding_data: {
        Args: { p_wedding_id: string; p_akad_date: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface Profile {
  id: string
  groom_name: string
  bride_name: string
  onboarding_completed: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Wedding {
  id: string
  user_id: string
  akad_date: string | null
  akad_time: string | null
  resepsi_date: string | null
  resepsi_time: string | null
  has_resepsi: boolean
  kota_pernikahan: string | null
  total_budget: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BudgetItem {
  id: string
  wedding_id: string
  category_id: string
  name: string
  estimated_price: number
  sort_order: number
  created_at: string
}

export interface BudgetCategory {
  id: string
  wedding_id: string
  name: string
  icon: string | null
  allocated_pct: number
  allocated_amount: number
  color: string | null
  sort_order: number
  is_custom: boolean
  created_at: string
}

export type PaymentStatus = 'belum_bayar' | 'dp' | 'lunas'

export interface Expense {
  id: string
  wedding_id: string
  category_id: string | null
  item_id: string | null
  name: string
  amount: number
  payment_status: PaymentStatus
  payment_date: string | null
  paid_date: string | null
  vendor_name: string | null
  notes: string | null
  receipt_url: string | null
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  wedding_id: string
  title: string
  description: string | null
  months_before: number | null
  weeks_before: number | null
  days_before: number | null
  target_date: string | null
  sort_order: number
  is_system: boolean
  created_at: string
}

export interface Task {
  id: string
  wedding_id: string
  milestone_id: string | null
  title: string
  description: string | null
  link_url: string | null
  is_completed: boolean
  is_active: boolean
  completed_at: string | null
  due_date: string | null
  category: string | null
  assigned_to: string | null
  reminder_sent: boolean
  sort_order: number
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface TaskTemplate {
  id: string
  category: string
  group_label: string
  sort_group: number
  title: string
  description: string | null
  link_url: string | null
  sort_order: number
  created_at: string
}

export interface WeddingTaskTemplate {
  id: string
  wedding_id: string
  template_id: string
  task_id: string | null
  created_at: string
}

export interface SeserahanItem {
  id: string
  wedding_id: string
  name: string
  quantity: number
  estimated_price: number
  is_checked: boolean
  notes: string | null
  sort_order: number
  created_at: string
}

export interface KuaDocument {
  id: string
  wedding_id: string
  name: string
  description: string | null
  required_for: string
  is_checked: boolean
  copies_needed: number
  notes: string | null
  sort_order: number
  created_at: string
}

export interface Guest {
  id: string
  wedding_id: string
  name: string
  phone: string | null
  address: string | null
  group_label: string | null
  invitation_type: string
  rsvp_status: string
  has_partner: boolean
  seat_number: string | null
  gift_notes: string | null
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  wedding_id: string
  category: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  instagram: string | null
  price_quoted: number | null
  status: string
  notes: string | null
  contract_url: string | null
  created_at: string
}
