"use client";

import { useState } from "react";
import { mockShop, mockBarbers, mockServices, generateTimeSlots, formatTime, formatPrice } from "@/lib/mock-data";
import { format, addDays, isSameDay } from "date-fns";
import type { Barber, Service } from "@/types/database";

type Step = "service" | "barber" | "datetime" | "info" | "confirm" | "success";

export default function BookingPage() {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const shop = mockShop;
  const barbers = mockBarbers;
  const services = mockServices;

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  // Generate time slots based on day (Sat different hours)
  const getSlots = (date: Date) => {
    const day = date.getDay();
    if (day === 0 || day === 1) return []; // Sun/Mon closed
    if (day === 6) return generateTimeSlots(10, 18, 30); // Saturday
    return generateTimeSlots(11, 19, 30); // Tue-Fri
  };

  const timeSlots = selectedDate ? getSlots(selectedDate) : [];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("barber");
  };

  const handleBarberSelect = (barber: Barber | null) => {
    setSelectedBarber(barber);
    setStep("datetime");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("info");
  };

  const handleBook = () => {
    // TODO: submit to Supabase
    setStep("success");
  };

  const goBack = () => {
    const steps: Step[] = ["service", "barber", "datetime", "info"];
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const groupedServices = services.reduce<Record<string, Service[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold tracking-wide uppercase">{shop.name}</div>
            <div className="text-[10px] text-red-500 uppercase tracking-[0.2em]">Book Online</div>
          </div>
          <a href={`tel:${shop.phone?.replace(/-/g, "")}`} className="text-xs text-zinc-400 hover:text-red-500 transition">
            {shop.phone}
          </a>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-1.5">
          {["service", "barber", "datetime", "info"].map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              ["service", "barber", "datetime", "info"].indexOf(step) >= i
                ? "bg-red-600"
                : "bg-zinc-800"
            }`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pb-32">
        {/* STEP 1: Service */}
        {step === "service" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl font-bold mt-4 mb-1">Choose a service</h2>
            <p className="text-sm text-zinc-500 mb-6">Select what you need done.</p>
            {Object.entries(groupedServices).map(([category, svcs]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">{category}</h3>
                <div className="space-y-2">
                  {svcs.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => handleServiceSelect(svc)}
                      className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all group text-left"
                    >
                      <div>
                        <div className="font-semibold text-sm group-hover:text-white transition">{svc.name}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{svc.duration_minutes} min{svc.description ? ` — ${svc.description}` : ""}</div>
                      </div>
                      <div className="text-lg font-bold text-red-500">{formatPrice(svc.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2: Barber */}
        {step === "barber" && (
          <div>
            <button onClick={goBack} className="text-xs text-zinc-500 hover:text-white mb-4 flex items-center gap-1 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <h2 className="text-xl font-bold mb-1">Choose your barber</h2>
            <p className="text-sm text-zinc-500 mb-6">Pick who you want, or let us assign the next available.</p>
            <div className="space-y-2">
              <button
                onClick={() => handleBarberSelect(null)}
                className="w-full flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all text-left"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">Next Available</div>
                  <div className="text-xs text-zinc-500">First barber who&apos;s free</div>
                </div>
              </button>
              {barbers.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBarberSelect(b)}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(b.display_name || b.first_name)[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{b.display_name || b.first_name}</div>
                    <div className="text-xs text-zinc-500">{b.bio ? b.bio.slice(0, 60) : "Master Barber"}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Date & Time */}
        {step === "datetime" && (
          <div>
            <button onClick={goBack} className="text-xs text-zinc-500 hover:text-white mb-4 flex items-center gap-1 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <h2 className="text-xl font-bold mb-1">Pick a date & time</h2>
            <p className="text-sm text-zinc-500 mb-6">
              {selectedService?.name} with {selectedBarber?.display_name || "next available"}
            </p>

            {/* Date picker */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {dates.map((d) => {
                const dayOfWeek = d.getDay();
                const closed = dayOfWeek === 0 || dayOfWeek === 1;
                const selected = selectedDate && isSameDay(d, selectedDate);
                return (
                  <button
                    key={d.toISOString()}
                    disabled={closed}
                    onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                    className={`flex-shrink-0 w-16 py-3 rounded-2xl text-center transition-all ${
                      closed
                        ? "opacity-30 cursor-not-allowed"
                        : selected
                        ? "bg-red-600 text-white"
                        : "bg-zinc-900 border border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-inherit opacity-70">{format(d, "EEE")}</div>
                    <div className="text-lg font-bold">{format(d, "d")}</div>
                    <div className="text-[10px] opacity-70">{format(d, "MMM")}</div>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Available Times</h3>
                {timeSlots.length === 0 ? (
                  <p className="text-sm text-zinc-600">Closed on this day.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleTimeSelect(t)}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${
                          selectedTime === t
                            ? "bg-red-600 text-white"
                            : "bg-zinc-900 border border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        {formatTime(t)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Client Info */}
        {step === "info" && (
          <div>
            <button onClick={goBack} className="text-xs text-zinc-500 hover:text-white mb-4 flex items-center gap-1 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <h2 className="text-xl font-bold mb-1">Your info</h2>
            <p className="text-sm text-zinc-500 mb-6">No account needed. Just your name and number.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">Your Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="First and last name"
                  className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(561) 555-0100"
                  className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Service</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Barber</span>
                  <span className="font-medium">{selectedBarber?.display_name || "Next Available"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date</span>
                  <span className="font-medium">{selectedDate ? format(selectedDate, "EEE, MMM d") : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Time</span>
                  <span className="font-medium">{selectedTime ? formatTime(selectedTime) : ""}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800">
                  <span className="text-zinc-400">Price</span>
                  <span className="text-lg font-bold text-red-500">{selectedService ? formatPrice(selectedService.price) : ""}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={!clientName || !clientPhone}
              className="w-full mt-6 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all text-sm uppercase tracking-wider"
            >
              Confirm Booking
            </button>
          </div>
        )}

        {/* STEP 5: Success */}
        {step === "success" && (
          <div className="text-center pt-20">
            <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">You&apos;re Booked!</h2>
            <p className="text-zinc-400 mb-2">{selectedService?.name} with {selectedBarber?.display_name || "Next Available"}</p>
            <p className="text-zinc-400 mb-1">{selectedDate ? format(selectedDate, "EEEE, MMMM d") : ""} at {selectedTime ? formatTime(selectedTime) : ""}</p>
            <p className="text-sm text-zinc-600 mt-4">A confirmation text will be sent to {clientPhone}</p>
            <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-zinc-400">
              <p className="font-medium text-zinc-300 mb-1">{shop.name}</p>
              <p>{shop.address_line1}</p>
              <p>{shop.city}, {shop.state} {shop.zip}</p>
              <a href={`tel:${shop.phone?.replace(/-/g, "")}`} className="text-red-500 mt-2 inline-block">{shop.phone}</a>
            </div>
            <button
              onClick={() => { setStep("service"); setSelectedService(null); setSelectedBarber(null); setSelectedDate(null); setSelectedTime(null); setClientName(""); setClientPhone(""); }}
              className="mt-6 px-8 py-3 border border-zinc-700 hover:border-zinc-500 text-white font-semibold rounded-full transition-all text-sm uppercase tracking-wider"
            >
              Book Another
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
