import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import ExcelJS from "exceljs";
import {
  globalMutex,
  EXCEL_FILE_PATH,
  getOrCreateWorkbook,
  getTrackCounts,
  getRegistrationRecords,
} from "@/lib/trackRegistrations";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/excel
 * Download the current registrations.xlsx file
 */
export async function GET() {
  try {
    await getOrCreateWorkbook();

    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      return NextResponse.json({ error: "Excel file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(EXCEL_FILE_PATH);

    return new NextResponse(fileBuffer, {
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
 * Upload a new .xlsx file to replace/sync registrations
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

      // Verify valid workbook
      const incomingWorkbook = new ExcelJS.Workbook();
      await incomingWorkbook.xlsx.load(buffer as any);

      if (incomingWorkbook.worksheets.length === 0) {
        return NextResponse.json(
          { error: "Uploaded workbook contains no worksheets." },
          { status: 400 }
        );
      }

      // Save directly to EXCEL_FILE_PATH
      fs.writeFileSync(EXCEL_FILE_PATH, buffer);

      // Read back to verify and return updated records
      const { worksheet } = await getOrCreateWorkbook();
      const counts = getTrackCounts(worksheet);
      const records = getRegistrationRecords(worksheet);

      return NextResponse.json({
        success: true,
        message: `Excel file "${file.name}" uploaded and synchronized successfully!`,
        counts,
        records,
      });
    } catch (error) {
      console.error("Excel upload error:", error);
      return NextResponse.json(
        { error: "Failed to process uploaded Excel file. Please ensure it is a valid .xlsx file." },
        { status: 500 }
      );
    }
  });
}
