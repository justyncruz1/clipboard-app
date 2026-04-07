import { NextRequest, NextResponse } from "next/server";
import { getAppointments } from "@/lib/ghl";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get("calendarId") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const userId = searchParams.get("userId") || undefined;

  try {
    const data = await getAppointments({ calendarId, startDate, endDate, userId });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}
