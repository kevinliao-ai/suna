import type { BillingSubscriptionStatus } from './model';

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type BillingCustomerRow = {
  user_id: string;
  stripe_customer_id: string;
  billing_email: string | null;
  created_at: string;
  updated_at: string;
};

type BillingSubscriptionRow = {
  stripe_subscription_id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  plan_id: string;
  status: BillingSubscriptionStatus;
  currency: string;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

type StripeEventRow = {
  stripe_event_id: string;
  event_type: string;
  object_id: string | null;
  processed_at: string;
};

export type BillingDatabase = {
  public: {
    Tables: {
      anisora_billing_customers: {
        Row: BillingCustomerRow;
        Insert: Pick<BillingCustomerRow, 'user_id' | 'stripe_customer_id'> &
          Partial<
            Pick<
              BillingCustomerRow,
              'billing_email' | 'created_at' | 'updated_at'
            >
          >;
        Update: Partial<BillingCustomerRow>;
        Relationships: [];
      };
      anisora_subscriptions: {
        Row: BillingSubscriptionRow;
        Insert: Omit<
          BillingSubscriptionRow,
          'created_at' | 'updated_at' | 'metadata'
        > & {
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Update: Partial<BillingSubscriptionRow>;
        Relationships: [];
      };
      anisora_stripe_events: {
        Row: StripeEventRow;
        Insert: Pick<StripeEventRow, 'stripe_event_id' | 'event_type'> &
          Partial<Pick<StripeEventRow, 'object_id' | 'processed_at'>>;
        Update: Partial<StripeEventRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
