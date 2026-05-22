import { NextResponse } from "next/server";

export async function POST(request: Request) {
    console.log('export async function POST',request)
    return NextResponse.json({ ok: true, next: "/" });
}