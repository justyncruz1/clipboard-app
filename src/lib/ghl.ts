/**
 * GoHighLevel API Client
 *
 * Handles all communication with GHL's API v2.
 * Server-side only — never expose API keys to the client.
 *
 * Base URL: https://services.leadconnectorhq.com
 */

const GHL_API_BASE = "https://services.leadconnectorhq.com";

interface GHLConfig {
  apiKey: string;
  locationId: string;
}

function getConfig(): GHLConfig {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    throw new Error("Missing GHL_API_KEY or GHL_LOCATION_ID environment variables");
  }

  return { apiKey, locationId };
}

async function ghlFetch(path: string, options: RequestInit = {}) {
  const { apiKey } = getConfig();

  const res = await fetch(`${GHL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GHL API error ${res.status}: ${error}`);
  }

  return res.json();
}

// ============================================
// CALENDARS
// ============================================

export async function getCalendars() {
  const { locationId } = getConfig();
  return ghlFetch(`/calendars/?locationId=${locationId}`);
}

export async function getCalendar(calendarId: string) {
  return ghlFetch(`/calendars/${calendarId}`);
}

export async function getFreeSlots(calendarId: string, startDate: string, endDate: string, timezone?: string) {
  const { locationId } = getConfig();
  const params = new URLSearchParams({
    startDate,
    endDate,
    timezone: timezone || "America/New_York",
    locationId,
  });
  return ghlFetch(`/calendars/${calendarId}/free-slots?${params}`);
}

// ============================================
// CONTACTS
// ============================================

export async function upsertContact(data: {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  tags?: string[];
  source?: string;
}) {
  const { locationId } = getConfig();
  return ghlFetch("/contacts/upsert", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      locationId,
    }),
  });
}

export async function getContact(contactId: string) {
  return ghlFetch(`/contacts/${contactId}`);
}

export async function searchContacts(query: string) {
  const { locationId } = getConfig();
  return ghlFetch(`/contacts/?locationId=${locationId}&query=${encodeURIComponent(query)}&limit=10`);
}

// ============================================
// APPOINTMENTS
// ============================================

export async function createAppointment(data: {
  calendarId: string;
  contactId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  title: string;
  appointmentStatus?: string;
  assignedUserId?: string;
  address?: string;
  notes?: string;
}) {
  return ghlFetch("/calendars/events/appointments", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      appointmentStatus: data.appointmentStatus || "confirmed",
    }),
  });
}

export async function getAppointment(eventId: string) {
  return ghlFetch(`/calendars/events/appointments/${eventId}`);
}

export async function updateAppointment(eventId: string, data: Record<string, unknown>) {
  return ghlFetch(`/calendars/events/appointments/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getAppointments(params: {
  calendarId?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}) {
  const { locationId } = getConfig();
  const searchParams = new URLSearchParams({ locationId });
  if (params.calendarId) searchParams.set("calendarId", params.calendarId);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.userId) searchParams.set("userId", params.userId);

  return ghlFetch(`/calendars/events?${searchParams}`);
}

// ============================================
// USERS (Staff / Barbers)
// ============================================

export async function getUsers() {
  const { locationId } = getConfig();
  return ghlFetch(`/users/?locationId=${locationId}`);
}

export async function getUser(userId: string) {
  return ghlFetch(`/users/${userId}`);
}

// ============================================
// OPPORTUNITIES (for pipeline tracking)
// ============================================

export async function createOpportunity(data: {
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  name: string;
  monetaryValue?: number;
  assignedTo?: string;
  status?: string;
}) {
  return ghlFetch("/opportunities/", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      status: data.status || "open",
    }),
  });
}

export async function getPipelines() {
  const { locationId } = getConfig();
  return ghlFetch(`/opportunities/pipelines?locationId=${locationId}`);
}

// ============================================
// WORKFLOW TRIGGERS
// ============================================

export async function triggerWorkflow(webhookUrl: string, data: Record<string, unknown>) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}
