import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { Mutex } from "async-mutex";

export const VALID_TRACKS = [
  "Coastal Intelligence",
  "Supply Chain Intelligence",
  "Industrial Intelligence",
] as const;

export type ValidTrack = (typeof VALID_TRACKS)[number];

export const TRACK_NUMBERS: Record<ValidTrack, string> = {
  "Coastal Intelligence": "01",
  "Supply Chain Intelligence": "02",
  "Industrial Intelligence": "03",
};

export const MAX_SLOTS_PER_TRACK = 12;

export const DATA_DIR = path.join(process.cwd(), "data");
export const EXCEL_FILE_PATH = path.join(DATA_DIR, "registrations.xlsx");
export const LOCKS_FILE_PATH = path.join(DATA_DIR, "track-locks.json");
export const SHEET_NAME = "Registrations";

export const globalMutex = new Mutex();

export interface RegistrationRecord {
  rowNumber: number;
  trackNumber: string;
  teamNo: number | string;
  teamName: string;
  trackName: string;
  leaderName: string;
}

export type TrackLocks = Record<ValidTrack, boolean>;

const DEFAULT_LOCKS: TrackLocks = {
  "Coastal Intelligence": false,
  "Supply Chain Intelligence": false,
  "Industrial Intelligence": false,
};

export function getTrackLocks(): TrackLocks {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LOCKS_FILE_PATH)) {
    fs.writeFileSync(LOCKS_FILE_PATH, JSON.stringify(DEFAULT_LOCKS, null, 2));
    return { ...DEFAULT_LOCKS };
  }
  try {
    const raw = fs.readFileSync(LOCKS_FILE_PATH, "utf-8");
    return { ...DEFAULT_LOCKS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_LOCKS };
  }
}

export function setTrackLock(trackName: ValidTrack, locked: boolean): TrackLocks {
  const current = getTrackLocks();
  current[trackName] = locked;
  fs.writeFileSync(LOCKS_FILE_PATH, JSON.stringify(current, null, 2));
  return current;
}

function applyHeaderStyle(headerRow: ExcelJS.Row) {
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
}

export async function getOrCreateWorkbook(): Promise<{ workbook: ExcelJS.Workbook; worksheet: ExcelJS.Worksheet }> {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const workbook = new ExcelJS.Workbook();
  let worksheet: ExcelJS.Worksheet | undefined;
  let fileLoaded = false;

  if (fs.existsSync(EXCEL_FILE_PATH)) {
    try {
      await workbook.xlsx.readFile(EXCEL_FILE_PATH);
      worksheet = workbook.getWorksheet(SHEET_NAME) || workbook.worksheets[0];
      fileLoaded = true;
    } catch {
      worksheet = undefined;
    }
  }

  // Check if existing file needs header / column upgrade to 5-column layout:
  // [Track Number, Team No, Team Name, Track Name, Leader Name]
  if (fileLoaded && worksheet) {
    const col1Header = String(worksheet.getRow(1).getCell(1).value || "").trim();
    const col2Header = String(worksheet.getRow(1).getCell(2).value || "").trim();

    // If file is using the older 4-column layout without Team No
    if (col1Header === "Track Number" && col2Header !== "Team No") {
      const existingData: Array<{
        trackNumber: string;
        teamNo: number;
        teamName: string;
        trackName: string;
        leaderName: string;
      }> = [];

      let seq = 1;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const c1 = String(row.getCell(1).value || "").trim();
        const c2 = String(row.getCell(2).value || "").trim();
        const c3 = String(row.getCell(3).value || "").trim();
        const c4 = String(row.getCell(4).value || "").trim();
        if (c1 || c2 || c3) {
          existingData.push({
            trackNumber: c1,
            teamNo: seq++,
            teamName: c2,
            trackName: c3,
            leaderName: c4,
          });
        }
      });

      while (workbook.worksheets.length > 0) {
        workbook.removeWorksheet(workbook.worksheets[0].id);
      }

      worksheet = workbook.addWorksheet(SHEET_NAME);
      const headerRow = worksheet.addRow(["Track Number", "Team No", "Team Name", "Track Name", "Leader Name"]);
      applyHeaderStyle(headerRow);
      worksheet.columns = [
        { key: "trackNumber", width: 16 },
        { key: "teamNo", width: 14 },
        { key: "teamName", width: 32 },
        { key: "trackName", width: 36 },
        { key: "leaderName", width: 30 },
      ];

      for (const rec of existingData) {
        const row = worksheet.addRow([rec.trackNumber, rec.teamNo, rec.teamName, rec.trackName, rec.leaderName]);
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
      }

      await workbook.xlsx.writeFile(EXCEL_FILE_PATH);
      return { workbook, worksheet };
    }
  }

  // Create brand new worksheet if none exists
  if (!worksheet) {
    worksheet = workbook.addWorksheet(SHEET_NAME);
    const headerRow = worksheet.addRow(["Track Number", "Team No", "Team Name", "Track Name", "Leader Name"]);
    applyHeaderStyle(headerRow);
    worksheet.columns = [
      { key: "trackNumber", width: 16 },
      { key: "teamNo", width: 14 },
      { key: "teamName", width: 32 },
      { key: "trackName", width: 36 },
      { key: "leaderName", width: 30 },
    ];
    await workbook.xlsx.writeFile(EXCEL_FILE_PATH);
  }

  return { workbook, worksheet };
}

export function getTrackCounts(worksheet: ExcelJS.Worksheet): Record<ValidTrack, number> {
  const counts: Record<ValidTrack, number> = {
    "Coastal Intelligence": 0,
    "Supply Chain Intelligence": 0,
    "Industrial Intelligence": 0,
  };

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const col4Val = String(row.getCell(4).value || "").trim();
    if (col4Val in counts) {
      counts[col4Val as ValidTrack] += 1;
      return;
    }
    const col3Val = String(row.getCell(3).value || "").trim();
    if (col3Val in counts) {
      counts[col3Val as ValidTrack] += 1;
      return;
    }
    const col1Val = String(row.getCell(1).value || "").trim();
    if (col1Val === "01") counts["Coastal Intelligence"] += 1;
    else if (col1Val === "02") counts["Supply Chain Intelligence"] += 1;
    else if (col1Val === "03") counts["Industrial Intelligence"] += 1;
  });

  return counts;
}

export function getRegistrationRecords(worksheet: ExcelJS.Worksheet): RegistrationRecord[] {
  const records: RegistrationRecord[] = [];
  const col2Header = String(worksheet.getRow(1).getCell(2).value || "").trim().toLowerCase();
  const hasTeamNoCol = col2Header.includes("team no") || col2Header === "team no";

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    if (hasTeamNoCol) {
      const col1 = String(row.getCell(1).value || "").trim();
      const col2 = row.getCell(2).value !== null && row.getCell(2).value !== undefined ? String(row.getCell(2).value).trim() : String(rowNumber - 1);
      const col3 = String(row.getCell(3).value || "").trim();
      const col4 = String(row.getCell(4).value || "").trim();
      const col5 = String(row.getCell(5).value || "").trim();

      if (col1 || col3 || col4) {
        records.push({
          rowNumber,
          trackNumber: col1,
          teamNo: col2 || String(rowNumber - 1),
          teamName: col3,
          trackName: col4,
          leaderName: col5,
        });
      }
    } else {
      const col1 = String(row.getCell(1).value || "").trim();
      const col2 = String(row.getCell(2).value || "").trim();
      const col3 = String(row.getCell(3).value || "").trim();
      const col4 = String(row.getCell(4).value || "").trim();

      if (col1 || col2 || col3) {
        records.push({
          rowNumber,
          trackNumber: col1,
          teamNo: rowNumber - 1,
          teamName: col2,
          trackName: col3,
          leaderName: col4,
        });
      }
    }
  });

  return records;
}
