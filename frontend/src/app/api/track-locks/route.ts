import { NextRequest, NextResponse } from "next/server";
import {
  getTrackLocks,
  setTrackLock,
  getOrCreateWorkbook,
  getTrackCounts,
  getRegistrationRecords,
  VALID_TRACKS,
} from "@/lib/trackRegistrations";

// GET: Returns lock states, track counts, and all registrations
export async function GET() {
  try {
    const lockedTracks = getTrackLocks();
    const { worksheet } = await getOrCreateWorkbook();
    const counts = getTrackCounts(worksheet);
    const records = getRegistrationRecords(worksheet);
    return NextResponse.json({ lockedTracks, counts, records }, { status: 200 });
  } catch (err) {
    console.error("[/api/track-locks GET]", err);
    return NextResponse.json({ error: "Failed to fetch track lock data." }, { status: 500 });
  }
}

// POST: Update a track lock state
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trackName, locked } = body;

    if (!trackName || !VALID_TRACKS.includes(trackName as (typeof VALID_TRACKS)[number])) {
      return NextResponse.json({ error: "Invalid track name." }, { status: 400 });
    }
    if (typeof locked !== "boolean") {
      return NextResponse.json({ error: "locked must be a boolean." }, { status: 400 });
    }

    const updatedLocks = setTrackLock(trackName as (typeof VALID_TRACKS)[number], locked);
    return NextResponse.json({ success: true, lockedTracks: updatedLocks }, { status: 200 });
  } catch (err) {
    console.error("[/api/track-locks POST]", err);
    return NextResponse.json({ error: "Failed to update track lock." }, { status: 500 });
  }
}
