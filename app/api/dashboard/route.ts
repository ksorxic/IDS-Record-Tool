import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/dashboard";

export const runtime = "nodejs";

export async function GET() {
  const data = await fetchDashboardData();

  return NextResponse.json({
    success: true,
    data
  });
}
