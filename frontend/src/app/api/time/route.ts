import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Singularity Hackathon kickoff: October 8, 2026 at 9:00 AM IST (UTC+05:30)
export const EVENT_TARGET_TIMESTAMP = new Date("2026-10-08T09:00:00+05:30").getTime();

export async function GET() {
  const serverTime = Date.now();
  const diffMs = Math.max(0, EVENT_TARGET_TIMESTAMP - serverTime);

  return NextResponse.json(
    {
      serverTime,
      targetTime: EVENT_TARGET_TIMESTAMP,
      diffMs,
      iso: new Date(serverTime).toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(req: Request) {
  const t1 = Date.now();
  const body = await req.json().catch(() => ({}));
  const t2 = Date.now();

  return NextResponse.json(
    {
      t0: body?.t0 ?? t1,
      t1,
      t2,
      serverTime: t2,
      targetTime: EVENT_TARGET_TIMESTAMP,
      diffMs: Math.max(0, EVENT_TARGET_TIMESTAMP - t2),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
