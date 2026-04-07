import { NextResponse } from "next/server";
import { getCalendars } from "@/lib/ghl";

export async function GET() {
  try {
    const data = await getCalendars();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch calendars:", error);
    return NextResponse.json({ error: "Failed to fetch calendars" }, { status: 500 });
  }
}
