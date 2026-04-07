export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled";

export type AppointmentSource = "online" | "walk_in" | "phone" | "manual";

export type QueueStatus =
  | "waiting"
  | "assigned"
  | "in_progress"
  | "completed"
  | "left";

export interface Shop {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  timezone: string;
  logo_url: string | null;
  booking_notice_hours: number;
  cancellation_hours: number;
  require_deposit: boolean;
  deposit_amount: number;
  walk_ins_enabled: boolean;
  online_booking_enabled: boolean;
  google_place_id: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Barber {
  id: string;
  shop_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_owner: boolean;
  is_active: boolean;
  commission_rate: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Client {
  id: string;
  shop_id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  notes: string | null;
  preferred_barber_id: string | null;
  no_show_count: number;
  visit_count: number;
  last_visit_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  shop_id: string;
  barber_id: string;
  client_id: string | null;
  service_id: string;
  client_name: string;
  client_phone: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  tip: number;
  total: number | null;
  status: AppointmentStatus;
  source: AppointmentSource;
  checked_in_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  barber?: Barber;
  service?: Service;
  client?: Client;
}

export interface WalkInQueue {
  id: string;
  shop_id: string;
  client_id: string | null;
  barber_id: string | null;
  service_id: string | null;
  client_name: string;
  client_phone: string | null;
  party_size: number;
  status: QueueStatus;
  position: number;
  estimated_wait_minutes: number | null;
  joined_at: string;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  // Joined
  barber?: Barber;
  service?: Service;
}

export interface BarberSchedule {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface BlockedTime {
  id: string;
  barber_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  reason: string | null;
}

// Supabase Database type helper
export interface Database {
  public: {
    Tables: {
      shops: { Row: Shop; Insert: Partial<Shop> & { name: string; slug: string }; Update: Partial<Shop> };
      barbers: { Row: Barber; Insert: Partial<Barber> & { shop_id: string; first_name: string; last_name: string }; Update: Partial<Barber> };
      services: { Row: Service; Insert: Partial<Service> & { shop_id: string; name: string; price: number }; Update: Partial<Service> };
      clients: { Row: Client; Insert: Partial<Client> & { shop_id: string; first_name: string; phone: string }; Update: Partial<Client> };
      appointments: {
        Row: Appointment;
        Insert: Partial<Appointment> & {
          shop_id: string;
          barber_id: string;
          service_id: string;
          client_name: string;
          client_phone: string;
          date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          price: number;
        };
        Update: Partial<Appointment>;
      };
      walk_in_queue: { Row: WalkInQueue; Insert: Partial<WalkInQueue> & { shop_id: string; client_name: string; position: number }; Update: Partial<WalkInQueue> };
      barber_schedules: { Row: BarberSchedule; Insert: Partial<BarberSchedule> & { barber_id: string; day_of_week: number; start_time: string; end_time: string }; Update: Partial<BarberSchedule> };
      blocked_times: { Row: BlockedTime; Insert: Partial<BlockedTime> & { barber_id: string; date: string }; Update: Partial<BlockedTime> };
    };
  };
}
