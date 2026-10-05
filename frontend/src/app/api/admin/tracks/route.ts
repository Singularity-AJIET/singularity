import { NextRequest, NextResponse } from "next/server";
import {
  VALID_TRACKS,
  ValidTrack,
  MAX_SLOTS_PER_TRACK,
  globalMutex,
  getTrackCounts,
  getTrackLocks,
  setTrackLock,
  getRegistrationRecords,
  deleteRegistrationRecord,
  deleteAllRegistrationRecords,
  getAllowMultipleSelections,
  setAllowMultipleSelections,
  getDisplayTrackSelection,
  setDisplayTrackSelection,
} from "@/lib/trackRegistrations";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/tracks
 * Returns tracks status, counts, manual lock states, settings, and list of registered teams from Turso Cloud
 */
export async function GET() {
  try {
    const counts = await getTrackCounts();
    const lockedTracks = await getTrackLocks();
    const records = await getRegistrationRecords();
    const allowMultipleSelections = await getAllowMultipleSelections();
    const displayTrackSelection = await getDisplayTrackSelection();

    return NextResponse.json({
      success: true,
      maxSlots: MAX_SLOTS_PER_TRACK,
      counts,
      lockedTracks,
      allowMultipleSelections,
      displayTrackSelection,
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
 * OR toggle selection mode: { allowMultipleSelections: boolean }
 * OR toggle display mode: { displayTrackSelection: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 0. Check if toggling displayTrackSelection (Make /trackSelection visible or hidden)
    if (body && typeof body.displayTrackSelection === "boolean") {
      const updatedDisplay = await setDisplayTrackSelection(body.displayTrackSelection);
      return NextResponse.json({
        success: true,
        displayTrackSelection: updatedDisplay,
        message: updatedDisplay
          ? "Display Enabled: /trackSelection is now LIVE and visible to participants."
          : "Display Disabled: /trackSelection is now HIDDEN from participants.",
      });
    }

    // 1. Check if toggling allowMultipleSelections (Testing mode vs Single-selection mode)
    if (body && typeof body.allowMultipleSelections === "boolean") {
      const updatedSetting = await setAllowMultipleSelections(body.allowMultipleSelections);
      return NextResponse.json({
        success: true,
        allowMultipleSelections: updatedSetting,
        message: updatedSetting
          ? "Test Mode Enabled: Users can now select tracks multiple times."
          : "Strict Mode Enabled: Each user can only select one track.",
      });
    }

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

    const updatedLocks = await setTrackLock(track as ValidTrack, locked);

    return NextResponse.json({
      success: true,
      message: `Track "${track}" is now ${locked ? "LOCKED" : "OPEN"}.`,
      lockedTracks: updatedLocks,
    });
  } catch (error) {
    console.error("Admin track update error:", error);
    return NextResponse.json(
      { error: "Failed to update track settings." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tracks
 * Delete a registration row: ?rowNumber=1
 */
export async function DELETE(req: NextRequest) {
  return await globalMutex.runExclusive(async () => {
    try {
      const { searchParams } = new URL(req.url);
      const deleteAll = searchParams.get("all") === "true";

      if (deleteAll) {
        const { counts, records } = await deleteAllRegistrationRecords();
        return NextResponse.json({
          success: true,
          message: "All registration records deleted successfully.",
          counts,
          records,
        });
      }

      const rowNumberStr = searchParams.get("rowNumber");
      const rowNumber = rowNumberStr ? parseInt(rowNumberStr, 10) : NaN;

      if (isNaN(rowNumber)) {
        return NextResponse.json(
          { error: "Valid rowNumber or all=true is required." },
          { status: 400 }
        );
      }

      const { counts, records } = await deleteRegistrationRecord(rowNumber);

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
