import { NextRequest, NextResponse } from "next/server";
import {
  globalMutex,
  generateExcelBuffer,
  syncFromExcelBuffer,
} from "@/lib/trackRegistrations";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/excel
 * Dynamically generates and downloads the registrations .xlsx file from Turso Cloud in-memory.
 * Zero hard drive writes — 100% cloud & serverless compatible!
 */
export async function GET() {
  try {
    const fileBuffer = await generateExcelBuffer();

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="singularity_track_registrations.xlsx"',
      },
    });

  } catch (error) {
    console.error("Excel download error:", error);
    return NextResponse.json(
      { error: "Failed to download Excel file" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/excel
 * Upload a new .xlsx file to replace/sync registrations directly into Turso Cloud.
 */
export async function POST(req: NextRequest) {
  return await globalMutex.runExclusive(async () => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No Excel file uploaded in form data." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { counts, records } = await syncFromExcelBuffer(buffer);

      return NextResponse.json({
        success: true,
        message: `Excel file "${file.name}" uploaded and synchronized successfully!`,
        counts,
        records,
      });
    } catch (error) {
      console.error("Excel upload error:", error);
      return NextResponse.json(
        {
          error:
            "Failed to process uploaded Excel file. Please ensure it is a valid .xlsx file.",
        },
        { status: 500 }
      );
    }
  });
}
