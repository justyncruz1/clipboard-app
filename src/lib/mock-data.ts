// Mock data for development before Supabase is connected
import type { Shop, Barber, Service, Appointment, WalkInQueue, BarberSchedule } from "@/types/database";

export const mockShop: Shop = {
  id: "shop-1",
  name: "The Spot Barbershop",
  slug: "the-spot",
  phone: "561-429-3732",
  email: null,
  address_line1: "4618 S. Jog Rd.",
  address_line2: null,
  city: "Greenacres",
  state: "FL",
  zip: "33467",
  timezone: "America/New_York",
  logo_url: null,
  booking_notice_hours: 1,
  cancellation_hours: 24,
  require_deposit: false,
  deposit_amount: 0,
  walk_ins_enabled: true,
  online_booking_enabled: true,
  google_place_id: null,
  facebook_url: "https://www.facebook.com/thespotbarbershopwpb/",
  instagram_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockBarbers: Barber[] = [
  {
    id: "barber-1",
    shop_id: "shop-1",
    user_id: null,
    first_name: "Manuel",
    last_name: "De La Torre",
    display_name: "Manny",
    phone: null,
    email: null,
    avatar_url: null,
    bio: "Master barber, co-owner. Traditional and modern techniques.",
    is_owner: true,
    is_active: true,
    commission_rate: null,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "barber-2",
    shop_id: "shop-1",
    user_id: null,
    first_name: "Samuel",
    last_name: "De La Torre",
    display_name: "Sammy",
    phone: null,
    email: null,
    avatar_url: null,
    bio: "Master barber, co-owner. Precision fades and classic shaves.",
    is_owner: true,
    is_active: true,
    commission_rate: null,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockServices: Service[] = [
  { id: "svc-1", shop_id: "shop-1", name: "Regular Men's Haircut", description: "Precision cut tailored to your style", duration_minutes: 30, price: 30, category: "Haircuts", is_active: true, sort_order: 1, created_at: new Date().toISOString() },
  { id: "svc-2", shop_id: "shop-1", name: "Haircut with Beard Trim", description: "Full cut plus beard shape and lineup", duration_minutes: 40, price: 35, category: "Haircuts", is_active: true, sort_order: 2, created_at: new Date().toISOString() },
  { id: "svc-3", shop_id: "shop-1", name: "Haircut with Beard & Eyebrows", description: "The complete grooming package", duration_minutes: 45, price: 38, category: "Haircuts", is_active: true, sort_order: 3, created_at: new Date().toISOString() },
  { id: "svc-4", shop_id: "shop-1", name: "Shape Up", description: "Clean edges and lineup", duration_minutes: 15, price: 15, category: "Haircuts", is_active: true, sort_order: 4, created_at: new Date().toISOString() },
  { id: "svc-5", shop_id: "shop-1", name: "Shape Up with Beard", description: "Edge work plus beard cleanup", duration_minutes: 20, price: 21, category: "Haircuts", is_active: true, sort_order: 5, created_at: new Date().toISOString() },
  { id: "svc-6", shop_id: "shop-1", name: "Hot Towel Shave", description: "Classic straight-razor experience", duration_minutes: 30, price: 30, category: "Shaves", is_active: true, sort_order: 6, created_at: new Date().toISOString() },
  { id: "svc-7", shop_id: "shop-1", name: "Hot Towel Shave with Haircut", description: "The ultimate barbershop experience", duration_minutes: 60, price: 50, category: "Shaves", is_active: true, sort_order: 7, created_at: new Date().toISOString() },
  { id: "svc-8", shop_id: "shop-1", name: "Kid's Haircut", description: "Ages 12 and under", duration_minutes: 25, price: 23, category: "Haircuts", is_active: true, sort_order: 8, created_at: new Date().toISOString() },
  { id: "svc-9", shop_id: "shop-1", name: "Senior Haircut", description: "Senior discount cut", duration_minutes: 25, price: 21, category: "Haircuts", is_active: true, sort_order: 9, created_at: new Date().toISOString() },
];

// Generate time slots for a given date
export function generateTimeSlots(startHour: number, endHour: number, intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      if (h === endHour - 1 && m + intervalMinutes > 60) break;
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return slots;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`;
}

// Mock today's appointments
const today = new Date().toISOString().split("T")[0];

export const mockAppointments: Appointment[] = [
  {
    id: "apt-1", shop_id: "shop-1", barber_id: "barber-1", client_id: null, service_id: "svc-1",
    client_name: "James Wilson", client_phone: "561-555-0101",
    date: today, start_time: "11:00", end_time: "11:30", duration_minutes: 30,
    price: 30, tip: 0, total: null, status: "completed", source: "online",
    checked_in_at: null, started_at: null, completed_at: new Date().toISOString(), cancelled_at: null,
    notes: null, cancellation_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "apt-2", shop_id: "shop-1", barber_id: "barber-2", client_id: null, service_id: "svc-2",
    client_name: "Marcus Brown", client_phone: "561-555-0102",
    date: today, start_time: "11:30", end_time: "12:10", duration_minutes: 40,
    price: 35, tip: 0, total: null, status: "in_progress", source: "online",
    checked_in_at: null, started_at: new Date().toISOString(), completed_at: null, cancelled_at: null,
    notes: null, cancellation_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "apt-3", shop_id: "shop-1", barber_id: "barber-1", client_id: null, service_id: "svc-7",
    client_name: "David Rodriguez", client_phone: "561-555-0103",
    date: today, start_time: "12:00", end_time: "13:00", duration_minutes: 60,
    price: 50, tip: 0, total: null, status: "booked", source: "online",
    checked_in_at: null, started_at: null, completed_at: null, cancelled_at: null,
    notes: "First time client", cancellation_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "apt-4", shop_id: "shop-1", barber_id: "barber-2", client_id: null, service_id: "svc-1",
    client_name: "Tyler Johnson", client_phone: "561-555-0104",
    date: today, start_time: "13:00", end_time: "13:30", duration_minutes: 30,
    price: 30, tip: 0, total: null, status: "booked", source: "phone",
    checked_in_at: null, started_at: null, completed_at: null, cancelled_at: null,
    notes: null, cancellation_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "apt-5", shop_id: "shop-1", barber_id: "barber-1", client_id: null, service_id: "svc-3",
    client_name: "Andre Mitchell", client_phone: "561-555-0105",
    date: today, start_time: "14:00", end_time: "14:45", duration_minutes: 45,
    price: 38, tip: 0, total: null, status: "booked", source: "online",
    checked_in_at: null, started_at: null, completed_at: null, cancelled_at: null,
    notes: null, cancellation_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

export const mockQueue: WalkInQueue[] = [
  {
    id: "q-1", shop_id: "shop-1", client_id: null, barber_id: null, service_id: "svc-1",
    client_name: "Chris Taylor", client_phone: "561-555-0201",
    party_size: 1, status: "waiting", position: 1, estimated_wait_minutes: 15,
    joined_at: new Date(Date.now() - 20 * 60000).toISOString(),
    assigned_at: null, started_at: null, completed_at: null,
  },
  {
    id: "q-2", shop_id: "shop-1", client_id: null, barber_id: null, service_id: "svc-4",
    client_name: "Kevin Martinez", client_phone: null,
    party_size: 1, status: "waiting", position: 2, estimated_wait_minutes: 35,
    joined_at: new Date(Date.now() - 10 * 60000).toISOString(),
    assigned_at: null, started_at: null, completed_at: null,
  },
];
