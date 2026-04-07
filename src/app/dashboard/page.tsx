"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import type { Shop, Barber, Service, Appointment, WalkInQueue } from "@/types/database";

type Tab = "today" | "queue";

const statusColors: Record<string, string> = {
  booked: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  checked_in: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  in_progress: "bg-green-500/10 text-green-400 border-green-500/20",
  completed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  no_show: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

const statusActions: Record<string, { label: string; next: string }[]> = {
  booked: [{ label: "Check In", next: "checked_in" }, { label: "No Show", next: "no_show" }],
  checked_in: [{ label: "Start Cut", next: "in_progress" }],
  in_progress: [{ label: "Complete", next: "completed" }],
};

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatPrice(price: number): string {
  return `$${Number(price).toFixed(0)}`;
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("today");
  const [shop, setShop] = useState<Shop | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<WalkInQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWalkIn, setShowAddWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInService, setWalkInService] = useState("");

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Using the-spot as the default demo shop
  const shopSlug = "the-spot";

  const loadData = useCallback(async () => {
    const { data: shopData } = await supabase.from("shops").select("*").eq("slug", shopSlug).single();
    if (!shopData) return;
    setShop(shopData as Shop);

    const [barberRes, serviceRes, aptRes, queueRes] = await Promise.all([
      supabase.from("barbers").select("*").eq("shop_id", shopData.id).eq("is_active", true).order("sort_order"),
      supabase.from("services").select("*").eq("shop_id", shopData.id).eq("is_active", true).order("sort_order"),
      supabase.from("appointments").select("*").eq("shop_id", shopData.id).eq("date", todayStr).order("start_time"),
      supabase.from("walk_in_queue").select("*").eq("shop_id", shopData.id).in("status", ["waiting", "assigned", "in_progress"]).order("position"),
    ]);

    setBarbers((barberRes.data || []) as Barber[]);
    setServices((serviceRes.data || []) as Service[]);
    setAppointments((aptRes.data || []) as Appointment[]);
    setQueue((queueRes.data || []) as WalkInQueue[]);
    setLoading(false);
  }, [todayStr]);

  useEffect(() => {
    loadData();

    // Real-time subscription for appointments
    const aptChannel = supabase
      .channel("appointments-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        loadData();
      })
      .subscribe();

    const queueChannel = supabase
      .channel("queue-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "walk_in_queue" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(aptChannel);
      supabase.removeChannel(queueChannel);
    };
  }, [loadData]);

  const getBarberName = (id: string) => barbers.find((b) => b.id === id)?.display_name || "Unknown";
  const getServiceName = (id: string) => services.find((s) => s.id === id)?.name || "Unknown";

  const updateAppointmentStatus = async (id: string, status: string) => {
    const updates: Record<string, string> = { status };
    if (status === "checked_in") updates.checked_in_at = new Date().toISOString();
    if (status === "in_progress") updates.started_at = new Date().toISOString();
    if (status === "completed") updates.completed_at = new Date().toISOString();
    if (status === "cancelled") updates.cancelled_at = new Date().toISOString();

    await supabase.from("appointments").update(updates).eq("id", id);
    // Real-time will refresh the data
  };

  const addWalkIn = async () => {
    if (!walkInName || !shop) return;
    const waitingCount = queue.filter((q) => q.status === "waiting").length;

    await supabase.from("walk_in_queue").insert({
      shop_id: shop.id,
      client_name: walkInName,
      service_id: walkInService || null,
      position: waitingCount + 1,
      estimated_wait_minutes: waitingCount * 20 + 15,
      status: "waiting",
    });

    setWalkInName("");
    setWalkInService("");
    setShowAddWalkIn(false);
  };

  const removeFromQueue = async (id: string) => {
    await supabase.from("walk_in_queue").delete().eq("id", id);
  };

  const activeAppointments = appointments.filter((a) => !["completed", "cancelled", "no_show"].includes(a.status));
  const completedAppointments = appointments.filter((a) => a.status === "completed");
  const waitingQueue = queue.filter((q) => q.status === "waiting");
  const todayRevenue = completedAppointments.reduce((sum, a) => sum + Number(a.price), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-wide">
              <span className="text-white">Clip</span><span className="text-red-500">Board</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-sm text-zinc-400">{shop?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live" />
            <span className="text-xs text-zinc-500">{format(today, "EEEE, MMMM d")}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Today's Revenue", value: formatPrice(todayRevenue), color: "text-green-400" },
            { label: "Appointments", value: appointments.length.toString(), color: "text-blue-400" },
            { label: "In Queue", value: waitingQueue.length.toString(), color: "text-yellow-400" },
            { label: "Completed", value: completedAppointments.length.toString(), color: "text-zinc-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
              <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-full p-1 w-fit">
          {[
            { id: "today" as Tab, label: "Today's Schedule" },
            { id: "queue" as Tab, label: `Walk-In Queue (${waitingQueue.length})` },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all ${
                tab === t.id ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TODAY */}
        {tab === "today" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barbers.map((barber) => {
              const barberAppts = appointments.filter((a) => a.barber_id === barber.id).sort((a, b) => a.start_time.localeCompare(b.start_time));
              return (
                <div key={barber.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {(barber.display_name || barber.first_name)[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{barber.display_name || barber.first_name}</div>
                      <div className="text-[10px] text-zinc-500">{barberAppts.length} appointments today</div>
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {barberAppts.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-zinc-600">No appointments yet</div>
                    )}
                    {barberAppts.map((apt) => (
                      <div key={apt.id} className="px-4 py-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm font-semibold">{apt.client_name}</div>
                            <div className="text-xs text-zinc-500">
                              {formatTime(apt.start_time)} – {formatTime(apt.end_time)} &middot; {getServiceName(apt.service_id)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-red-500">{formatPrice(Number(apt.price))}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${statusColors[apt.status]}`}>
                              {apt.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        {statusActions[apt.status] && (
                          <div className="flex gap-2 mt-2">
                            {statusActions[apt.status].map((action) => (
                              <button key={action.next} onClick={() => updateAppointmentStatus(apt.id, action.next)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                                  action.next === "no_show"
                                    ? "bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400"
                                    : "bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/20"
                                }`}>
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {apt.notes && <div className="mt-2 text-xs text-zinc-600 italic">Note: {apt.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* QUEUE */}
        {tab === "queue" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Current Queue</h3>
              <button onClick={() => setShowAddWalkIn(!showAddWalkIn)}
                className="text-xs px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all uppercase tracking-wider">
                + Add Walk-In
              </button>
            </div>
            {showAddWalkIn && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} placeholder="Client name"
                    className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 text-sm" />
                  <select value={walkInService} onChange={(e) => setWalkInService(e.target.value)}
                    className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-600 text-sm">
                    <option value="">Service (optional)</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {formatPrice(s.price)}</option>)}
                  </select>
                  <button onClick={addWalkIn} disabled={!walkInName}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-all text-sm">
                    Add to Queue
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {waitingQueue.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                  <div className="text-zinc-600 text-sm">No one in the queue right now.</div>
                </div>
              )}
              {waitingQueue.map((entry, index) => (
                <div key={entry.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-lg font-bold text-zinc-400">{index + 1}</div>
                    <div>
                      <div className="text-sm font-semibold">{entry.client_name}</div>
                      <div className="text-xs text-zinc-500">
                        {entry.service_id ? getServiceName(entry.service_id) : "No service selected"} · Joined {format(new Date(entry.joined_at), "h:mm a")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Est. wait</div>
                      <div className="text-sm font-semibold text-yellow-400">{entry.estimated_wait_minutes} min</div>
                    </div>
                    <button onClick={() => removeFromQueue(entry.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition" title="Remove">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
