import { NextRequest, NextResponse } from "next/server";
import {
  VALID_TRACKS,
  ValidTrack,
  MAX_SLOTS_PER_TRACK,
  globalMutex,
  getTrackCounts,
  getTrackLocks,
  getAllowMultipleSelections,
  getDisplayTrackSelection,
  registerTeam,
} from "@/lib/trackRegistrations";

export const dynamic = "force-dynamic";

/**
 * GET /api/register
 * Returns current counts, 12-slot capacity, and manual lock states from Turso Cloud
 */
export async function GET() {
  try {
    const counts = await getTrackCounts();
    const lockedTracks = await getTrackLocks();
    const allowMultipleSelections = await getAllowMultipleSelections();
    const displayTrackSelection = await getDisplayTrackSelection();

    return NextResponse.json({
      success: true,
      counts,
      maxSlots: MAX_SLOTS_PER_TRACK,
      lockedTracks,
      allowMultipleSelections,
      displayTrackSelection,
      "Coastal Intelligence": counts["Coastal Intelligence"],
      "Supply Chain Intelligence": counts["Supply Chain Intelligence"],
      "Industrial Intelligence": counts["Industrial Intelligence"],
    });
  } catch (error) {
    console.error("Error reading registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/register
 * Body: { teamName: string, leaderName: string, track: string }
 * Concurrency-safe registration write to Turso Cloud
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload in request body" },
      { status: 400 }
    );
  }

  const { teamName, leaderName, track } = (body as Record<string, unknown>) || {};

  if (!teamName || typeof teamName !== "string" || teamName.trim().length === 0) {
    return NextResponse.json(
      { error: "Team Name is required." },
      { status: 400 }
    );
  }

  if (!leaderName || typeof leaderName !== "string" || leaderName.trim().length === 0) {
    return NextResponse.json(
      { error: "Leader Name is required." },
      { status: 400 }
    );
  }

  if (
    !track ||
    typeof track !== "string" ||
    !VALID_TRACKS.includes(track.trim() as ValidTrack)
  ) {
    return NextResponse.json(
      {
        error: `Invalid track. Must be one of: ${VALID_TRACKS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const cleanTeamName = teamName.trim();
  const cleanLeaderName = leaderName.trim();
  const cleanTrack = track.trim() as ValidTrack;

  const displayTrackSelection = await getDisplayTrackSelection();
  if (!displayTrackSelection) {
    return NextResponse.json(
      { error: "Track selection portal is currently closed by administrators." },
      { status: 403 }
    );
  }

  return await globalMutex.runExclusive(async () => {
    try {
      const result = await registerTeam(cleanTeamName, cleanLeaderName, cleanTrack);

      if (!result.success) {
        return NextResponse.json(
          {
            error: result.error,
            trackLocked: result.trackLocked,
            trackFull: result.trackFull,
            counts: result.counts,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `Team "${cleanTeamName}" successfully selected ${cleanTrack}!`,
          teamName: cleanTeamName,
          teamNo: result.teamNo,
          trackNumber: result.trackNumber,
          track: cleanTrack,
          leaderName: cleanLeaderName,
          trackAndTeamNumber: result.trackAndTeamNumber,
          counts: result.counts,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("Registration error:", err);
      return NextResponse.json(
        { error: "Internal server error while saving registration." },
        { status: 500 }
      );
    }
  });
}
