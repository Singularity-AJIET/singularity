import { NextRequest, NextResponse } from "next/server";
import {
  VALID_TRACKS,
  ValidTrack,
  MAX_SLOTS_PER_TRACK,
  globalMutex,
  getOrCreateWorkbook,
  getTrackCounts,
  getTrackLocks,
  setTrackLock,
  getRegistrationRecords,
  EXCEL_FILE_PATH,
} from "@/lib/trackRegistrations";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/tracks
 * Returns tracks status, counts, manual lock states, and list of registered teams
 */
export async function GET() {
  try {
    const { worksheet } = await getOrCreateWorkbook();
    const counts = getTrackCounts(worksheet);
    const lockedTracks = getTrackLocks();
    const records = getRegistrationRecords(worksheet);

    return NextResponse.json({
      success: true,
      maxSlots: MAX_SLOTS_PER_TRACK,
      counts,
      lockedTracks,
      records,
    });
  } catch (error) {
    console.error("Admin tracks GET error:", error);
    return NextResponse.json(
      { error: "Failed to load admin tracks data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tracks
 * Toggle manual lock state for a track: { track: string, locked: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { track, locked } = body || {};

    if (!track || !VALID_TRACKS.includes(track as ValidTrack)) {
      return NextResponse.json(
        { error: `Invalid track. Must be one of: ${VALID_TRACKS.join(", ")}` },
        { status: 400 }
      );
    }

    if (typeof locked !== "boolean") {
      return NextResponse.json(
        { error: "Field 'locked' must be a boolean." },
        { status: 400 }
      );
    }

    const updatedLocks = setTrackLock(track as ValidTrack, locked);

    return NextResponse.json({
      success: true,
      message: `Track "${track}" is now ${locked ? "LOCKED" : "OPEN"}.`,
      lockedTracks: updatedLocks,
    });
  } catch (error) {
    console.error("Admin track lock toggle error:", error);
    return NextResponse.json(
      { error: "Failed to update track lock status." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tracks
 * Delete a registration row: { rowNumber: number }
 */
export async function DELETE(req: NextRequest) {
  return await globalMutex.runExclusive(async () => {
    try {
      const { searchParams } = new URL(req.url);
      const rowNumberStr = searchParams.get("rowNumber");
      const rowNumber = rowNumberStr ? parseInt(rowNumberStr, 10) : NaN;

      if (isNaN(rowNumber) || rowNumber < 2) {
        return NextResponse.json(
          { error: "Valid rowNumber (>= 2) is required." },
          { status: 400 }
        );
      }

      const { workbook, worksheet } = await getOrCreateWorkbook();

      if (rowNumber > worksheet.rowCount) {
        return NextResponse.json(
          { error: "Row does not exist." },
          { status: 404 }
        );
      }

      // Splice out the row
      worksheet.spliceRows(rowNumber, 1);
      await workbook.xlsx.writeFile(EXCEL_FILE_PATH);

      const counts = getTrackCounts(worksheet);
      const records = getRegistrationRecords(worksheet);

      return NextResponse.json({
        success: true,
        message: "Registration successfully removed.",
        counts,
        records,
      });
    } catch (error) {
      console.error("Admin delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete registration record." },
        { status: 500 }
      );
    }
  });
}
