import { NextRequest, NextResponse } from "next/server";
import { getFreeSlots } from "@/lib/ghl";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get("calendarId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const timezone = searchParams.get("timezone") || "America/New_York";

  if (!calendarId || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing calendarId, startDate, or endDate" }, { status: 400 });
  }

  try {
    const data = await getFreeSlots(calendarId, startDate, endDate, timezone);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch free slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
