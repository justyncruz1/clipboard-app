import { NextRequest, NextResponse } from "next/server";
import { upsertContact, createAppointment } from "@/lib/ghl";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      calendarId,
      firstName,
      lastName,
      phone,
      email,
      startTime,
      endTime,
      title,
      assignedUserId,
      notes,
    } = body;

    if (!calendarId || !firstName || !phone || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1: Upsert contact in GHL
    const contactResult = await upsertContact({
      firstName,
      lastName,
      phone,
      email,
      tags: ["clipboard-booking", "online-booking"],
      source: "ClipBoard Booking Widget",
    });

    const contactId = contactResult.contact?.id;
    if (!contactId) {
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }

    // Step 2: Create appointment in GHL
    const appointment = await createAppointment({
      calendarId,
      contactId,
      startTime,
      endTime,
      title: title || `${firstName} ${lastName || ""} — Online Booking`.trim(),
      appointmentStatus: "confirmed",
      assignedUserId,
      notes: notes || "Booked via ClipBoard",
    });

    return NextResponse.json({
      success: true,
      contactId,
      appointmentId: appointment.id || appointment.event?.id,
    });
  } catch (error) {
    console.error("Booking failed:", error);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
