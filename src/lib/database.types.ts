export type SubscriptionTier = 'trial' | 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';
export type UserRole = 'admin' | 'attorney' | 'paralegal';

export interface Firm {
  id: string;
  name: string;
  created_at: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  max_users: number;
}

export interface User {
  id: string;
  clerk_id: string;
  firm_id: string | null;
  email: string;
  role: UserRole;
  created_at: string;
  last_active: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  firm_id: string;
  event_type: string;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

// Supabase JS v2 Database type schema
export interface Database {
  public: {
    Tables: {
      firms: {
        Row: Firm;
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          max_users?: number;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          max_users?: number;
        };
        Relationships: [];
      };
      users: {
        Row: User;
        Insert: {
          id?: string;
          clerk_id: string;
          firm_id?: string | null;
          email: string;
          role?: UserRole;
          created_at?: string;
          last_active?: string | null;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          firm_id?: string | null;
          email?: string;
          role?: UserRole;
          created_at?: string;
          last_active?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: {
          id?: string;
          user_id: string;
          firm_id: string;
          event_type: string;
          timestamp?: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
