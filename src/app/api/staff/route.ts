import { NextResponse } from "next/server";
import { getUsers } from "@/lib/ghl";

export async function GET() {
  try {
    const data = await getUsers();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch staff:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}
