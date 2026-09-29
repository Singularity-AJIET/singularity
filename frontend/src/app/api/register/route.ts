import { NextRequest, NextResponse } from "next/server";
import {
  VALID_TRACKS,
  ValidTrack,
  TRACK_NUMBERS,
  MAX_SLOTS_PER_TRACK,
  globalMutex,
  getOrCreateWorkbook,
  getTrackCounts,
  getTrackLocks,
  EXCEL_FILE_PATH,
} from "@/lib/trackRegistrations";

export const dynamic = "force-dynamic";

/**
 * GET /api/register
 * Returns current counts, 12-slot capacity, and manual lock states
 */
export async function GET() {
  try {
    const { worksheet } = await getOrCreateWorkbook();
    const counts = getTrackCounts(worksheet);
    const lockedTracks = getTrackLocks();

    return NextResponse.json({
      success: true,
      counts,
      maxSlots: MAX_SLOTS_PER_TRACK,
      lockedTracks,
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
 * Concurrency-safe registration write wrapped in Mutex
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

  return await globalMutex.runExclusive(async () => {
    try {
      // 1. Check manual admin lock first
      const locks = getTrackLocks();
      if (locks[cleanTrack]) {
        return NextResponse.json(
          {
            error: `Registration Unavailable: Track "${cleanTrack}" has been locked by the administrator. Please select an alternative track.`,
            trackLocked: true,
          },
          { status: 409 }
        );
      }

      // 2. Check 12-slot capacity
      const { workbook, worksheet } = await getOrCreateWorkbook();
      const counts = getTrackCounts(worksheet);
      const currentTrackCount = counts[cleanTrack] || 0;

      if (currentTrackCount >= MAX_SLOTS_PER_TRACK) {
        return NextResponse.json(
          {
            error: `Capacity Reached: Track "${cleanTrack}" has reached its maximum capacity of ${MAX_SLOTS_PER_TRACK} teams. Please select an alternative track to complete your registration.`,
            trackFull: true,
            counts,
          },
          { status: 409 }
        );
      }

      // 3. Determine auto-assigned sequential Team No
      let maxTeamNo = 0;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const val = Number(row.getCell(2).value);
        if (!isNaN(val) && val > maxTeamNo) {
          maxTeamNo = val;
        }
      });
      const teamNo = maxTeamNo > 0 ? maxTeamNo + 1 : Math.max(1, worksheet.rowCount);

      // 4. Append row: [Track Number, Team No, Team Name, Track Name, Leader Name]
      const trackNumber = TRACK_NUMBERS[cleanTrack];
      const newRow = worksheet.addRow([
        trackNumber,
        teamNo,
        cleanTeamName,
        cleanTrack,
        cleanLeaderName,
      ]);

      // Styling and alignment
      newRow.getCell(1).alignment = { horizontal: "center" };
      newRow.getCell(2).alignment = { horizontal: "center" };

      // Persist to Excel file
      await workbook.xlsx.writeFile(EXCEL_FILE_PATH);

      const updatedCounts = {
        ...counts,
        [cleanTrack]: currentTrackCount + 1,
      };

      return NextResponse.json(
        {
          success: true,
          message: `Team "${cleanTeamName}" successfully selected ${cleanTrack}!`,
          teamName: cleanTeamName,
          teamNo,
          trackNumber,
          track: cleanTrack,
          leaderName: cleanLeaderName,
          counts: updatedCounts,
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
