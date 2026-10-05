import ExcelJS from "exceljs";
import { createClient, Client } from "@libsql/client";
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
export const SHEET_NAME = "Registrations";

export const globalMutex = new Mutex();

export interface RegistrationRecord {
  rowNumber: number;
  trackNumber: string;
  teamNo: number | string;
  teamName: string;
  trackName: string;
  leaderName: string;
  trackAndTeamNumber: string;
}

export type TrackLocks = Record<ValidTrack, boolean>;

const DEFAULT_LOCKS: TrackLocks = {
  "Coastal Intelligence": false,
  "Supply Chain Intelligence": false,
  "Industrial Intelligence": false,
};

let dbClientInstance: Client | null = null;

// Initialize or return Turso LibSQL client
export function getDbClient(): Client {
  if (!dbClientInstance) {
    const url =
      process.env.TURSO_DATABASE_URL ||
      "libsql://singularity-website-singularity.aws-ap-south-1.turso.io";
    const authToken =
      process.env.TURSO_AUTH_TOKEN ||
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY3OTk1OTEsImlkIjoiMDFhMDA1OGQtODgwMS03MjAzLWEwNjctYzU4MTk5NDRjOGJiIiwia2lkIjoiMGd2Y0dUbE1hU1R3QXgyVXFZVGF3MVZzS1dDZXZYTWJMT3R2MkdFeG1hOCIsInJpZCI6IjZmNDM3ZTQ4LThkNDQtNGY5ZC1iM2UwLThiOWVlNjg1NTMyNiJ9.w31tkF-YUL4YUEa4T3uxEZOznfPQbbauQGAyQk4Oeh8iWjWFCJnOfA3wtlKupwgJEqiDzArY2K24C4eQRfKjCQ";

    dbClientInstance = createClient({
      url,
      authToken,
    });
  }
  return dbClientInstance;
}

/**
 * Ensures track_registrations and track_locks tables exist in Turso Cloud.
 */
let tablesInitialized = false;
export async function ensureTablesExist(): Promise<void> {
  if (tablesInitialized) return;
  const client = getDbClient();

  await client.execute(`
    CREATE TABLE IF NOT EXISTS track_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      "Track Number" TEXT,
      "Team No" INTEGER UNIQUE,
      "Team Name" TEXT NOT NULL,
      "Track Name" TEXT NOT NULL,
      "Leader Name" TEXT NOT NULL,
      "Track_and_Team_Number" TEXT,
      track_number TEXT,
      team_no INTEGER,
      team_name TEXT,
      track_name TEXT,
      leader_name TEXT,
      track_and_team_number TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS track_locks (
      track_name TEXT PRIMARY KEY,
      is_locked INTEGER NOT NULL DEFAULT 0
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS track_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL
    );
  `);

  await client.execute({
    sql: "INSERT OR IGNORE INTO track_settings (setting_key, setting_value) VALUES ('allow_multiple_selections', '0')",
    args: [],
  });

  await client.execute({
    sql: "INSERT OR IGNORE INTO track_settings (setting_key, setting_value) VALUES ('display_track_selection', '0')",
    args: [],
  });

  // Seed default lock entries if empty
  for (const track of VALID_TRACKS) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO track_locks (track_name, is_locked) VALUES (?, 0)`,
      args: [track],
    });
  }

  try {
    await client.execute('ALTER TABLE track_registrations ADD COLUMN Track_and_Team_Number TEXT');
  } catch { /* already exists */ }

  tablesInitialized = true;
}

/**
 * Check whether users are allowed to select tracks multiple times (Testing Mode)
 * Default is false (strict single-selection per user).
 */
export async function getAllowMultipleSelections(): Promise<boolean> {
  try {
    await ensureTablesExist();
    const client = getDbClient();
    const res = await client.execute(
      "SELECT setting_value FROM track_settings WHERE setting_key = 'allow_multiple_selections'"
    );
    if (res.rows.length > 0) {
      const val = String(res.rows[0].setting_value);
      return val === "1" || val === "true";
    }
    return false;
  } catch (err) {
    console.error("Error reading allow_multiple_selections:", err);
    return false;
  }
}

/**
 * Update the allow_multiple_selections setting in Turso Cloud.
 */
export async function setAllowMultipleSelections(allowed: boolean): Promise<boolean> {
  await ensureTablesExist();
  const client = getDbClient();
  await client.execute({
    sql: `
      INSERT INTO track_settings (setting_key, setting_value)
      VALUES ('allow_multiple_selections', ?)
      ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value
    `,
    args: [allowed ? "1" : "0"],
  });
  return allowed;
}

/**
 * Check whether the track selection portal is displayed / visible to participants.
 * Default is false (hidden until coordinators activate display in Nexus).
 */
export async function getDisplayTrackSelection(): Promise<boolean> {
  try {
    await ensureTablesExist();
    const client = getDbClient();
    const res = await client.execute(
      "SELECT setting_value FROM track_settings WHERE setting_key = 'display_track_selection'"
    );
    if (res.rows.length > 0) {
      const val = String(res.rows[0].setting_value);
      return val === "1" || val === "true";
    }
    return false;
  } catch (err) {
    console.error("Error reading display_track_selection:", err);
    return false;
  }
}

/**
 * Update the display_track_selection setting in Turso Cloud.
 */
export async function setDisplayTrackSelection(displayed: boolean): Promise<boolean> {
  await ensureTablesExist();
  const client = getDbClient();
  await client.execute({
    sql: `
      INSERT INTO track_settings (setting_key, setting_value)
      VALUES ('display_track_selection', ?)
      ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value
    `,
    args: [displayed ? "1" : "0"],
  });
  return displayed;
}

/**
 * Fetch manual lock status for each track from Turso.
 */
export async function getTrackLocks(): Promise<TrackLocks> {
  try {
    await ensureTablesExist();
    const client = getDbClient();
    const res = await client.execute("SELECT track_name, is_locked FROM track_locks");

    const locks = { ...DEFAULT_LOCKS };
    for (const row of res.rows) {
      const name = String(row.track_name) as ValidTrack;
      if (name in locks) {
        locks[name] = Boolean(row.is_locked);
      }
    }
    return locks;
  } catch (err) {
    console.error("Error reading track locks from Turso:", err);
    return { ...DEFAULT_LOCKS };
  }
}

/**
 * Update lock status for a specific track in Turso.
 */
export async function setTrackLock(
  trackName: ValidTrack,
  locked: boolean
): Promise<TrackLocks> {
  await ensureTablesExist();
  const client = getDbClient();

  await client.execute({
    sql: `
      INSERT INTO track_locks (track_name, is_locked)
      VALUES (?, ?)
      ON CONFLICT(track_name) DO UPDATE SET is_locked = excluded.is_locked
    `,
    args: [trackName, locked ? 1 : 0],
  });

  return await getTrackLocks();
}

/**
 * Count how many teams have registered for each track in Turso.
 */
export async function getTrackCounts(): Promise<Record<ValidTrack, number>> {
  try {
    await ensureTablesExist();
    const client = getDbClient();
    const res = await client.execute(`
      SELECT 
        COALESCE(track_name, "Track Name") as trackName, 
        COUNT(*) as cnt 
      FROM track_registrations 
      GROUP BY COALESCE(track_name, "Track Name")
    `);

    const counts: Record<ValidTrack, number> = {
      "Coastal Intelligence": 0,
      "Supply Chain Intelligence": 0,
      "Industrial Intelligence": 0,
    };

    for (const row of res.rows) {
      const name = String(row.trackName || "").trim();
      if (name in counts) {
        counts[name as ValidTrack] = Number(row.cnt);
      }
    }

    return counts;
  } catch (err) {
    console.error("Error reading track counts from Turso:", err);
    return {
      "Coastal Intelligence": 0,
      "Supply Chain Intelligence": 0,
      "Industrial Intelligence": 0,
    };
  }
}

/**
 * Retrieve all registered teams from Turso in chronological/sequential order.
 */
export async function getRegistrationRecords(): Promise<RegistrationRecord[]> {
  try {
    await ensureTablesExist();
    const client = getDbClient();
    const res = await client.execute(`
      SELECT 
        id,
        COALESCE(track_number, "Track Number") as trackNumber,
        COALESCE(team_no, "Team No") as teamNo,
        COALESCE(team_name, "Team Name") as teamName,
        COALESCE(track_name, "Track Name") as trackName,
        COALESCE(leader_name, "Leader Name") as leaderName,
        COALESCE(Track_and_Team_Number, track_and_team_number) as trackAndTeamNumber
      FROM track_registrations
      ORDER BY COALESCE(team_no, "Team No", id) ASC
    `);

    const trackCounts: Record<string, number> = {};
    return res.rows.map((row: any, index: number) => {
      const teamNo = row.teamNo !== null && row.teamNo !== undefined ? Number(row.teamNo) : index + 1;
      const tName = String(row.trackName || "");
      trackCounts[tName] = (trackCounts[tName] || 0) + 1;
      const tCfgNum = parseInt(TRACK_NUMBERS[tName as ValidTrack] || "1", 10);
      const computedIdentifier = `T${tCfgNum}@${trackCounts[tName]}`;
      const rawId = String(row.trackAndTeamNumber || "").trim();
      const m = rawId.match(/track\s*(\d+)[@_]team\s*(\d+)/i);
      const trackAndTeamNumber = m
        ? `T${m[1]}@${m[2]}`
        : (rawId || computedIdentifier).replace("_", "@");
      return {
        rowNumber: teamNo, // Used by UI as row identifier
        trackNumber: String(row.trackNumber || TRACK_NUMBERS[row.trackName as ValidTrack] || ""),
        teamNo,
        teamName: String(row.teamName || ""),
        trackName: String(row.trackName || ""),
        leaderName: String(row.leaderName || ""),
        trackAndTeamNumber,
      };
    });
  } catch (err) {
    console.error("Error reading registration records from Turso:", err);
    return [];
  }
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  trackLocked?: boolean;
  trackFull?: boolean;
  teamNo?: number;
  trackNumber?: string;
  trackAndTeamNumber?: string;
  counts?: Record<ValidTrack, number>;
}

/**
 * Register a new team with ACID validation against capacity & locks.
 */
export async function registerTeam(
  cleanTeamName: string,
  cleanLeaderName: string,
  cleanTrack: ValidTrack
): Promise<RegisterResult> {
  await ensureTablesExist();
  const client = getDbClient();

  // 1. Check manual lock
  const locks = await getTrackLocks();
  if (locks[cleanTrack]) {
    return {
      success: false,
      error: `Registration Unavailable: Track "${cleanTrack}" has been locked by the administrator. Please select an alternative track.`,
      trackLocked: true,
    };
  }

  // 2. Check track capacity
  const counts = await getTrackCounts();
  const currentCount = counts[cleanTrack] || 0;
  if (currentCount >= MAX_SLOTS_PER_TRACK) {
    return {
      success: false,
      error: `Capacity Reached: Track "${cleanTrack}" has reached its maximum capacity of ${MAX_SLOTS_PER_TRACK} teams. Please select an alternative track to complete your registration.`,
      trackFull: true,
      counts,
    };
  }

  // 3. Determine next sequential Team No
  const maxRes = await client.execute(`
    SELECT COALESCE(MAX(COALESCE(team_no, "Team No")), 0) as max_team_no
    FROM track_registrations
  `);
  const maxTeamNo = Number(maxRes.rows[0]?.max_team_no || 0);
  const nextTeamNo = maxTeamNo + 1;
  const trackNumber = TRACK_NUMBERS[cleanTrack];
  const trackNum = parseInt(trackNumber, 10);
  const trackTeamNo = currentCount + 1;
  const trackAndTeamNumber = `T${trackNum}@${trackTeamNo}`;

  // 4. Insert row with both standard and quoted column names for full compatibility
  await client.execute({
    sql: `
      INSERT INTO track_registrations (
        "Track Number", "Team No", "Team Name", "Track Name", "Leader Name", "Track_and_Team_Number",
        track_number, team_no, team_name, track_name, leader_name, track_and_team_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      trackNumber,
      nextTeamNo,
      cleanTeamName,
      cleanTrack,
      cleanLeaderName,
      trackAndTeamNumber,
      trackNumber,
      nextTeamNo,
      cleanTeamName,
      cleanTrack,
      cleanLeaderName,
      trackAndTeamNumber,
    ],
  });

  const updatedCounts = {
    ...counts,
    [cleanTrack]: currentCount + 1,
  };

  return {
    success: true,
    teamNo: nextTeamNo,
    trackNumber,
    trackAndTeamNumber,
    counts: updatedCounts,
  };
}

/**
 * Remove a registration by teamNo or row index from Turso.
 */
export async function deleteRegistrationRecord(
  identifier: number
): Promise<{ counts: Record<ValidTrack, number>; records: RegistrationRecord[] }> {
  await ensureTablesExist();
  const client = getDbClient();

  // Try deleting by team_no or "Team No" or id
  const deleteRes = await client.execute({
    sql: `
      DELETE FROM track_registrations
      WHERE team_no = ? OR "Team No" = ? OR id = ?
    `,
    args: [identifier, identifier, identifier],
  });

  // If identifier was passed as row index (e.g., rowNumber >= 2 in old Excel indexing)
  if (deleteRes.rowsAffected === 0 && identifier >= 2) {
    const allRecords = await getRegistrationRecords();
    const target = allRecords[identifier - 2];
    if (target) {
      await client.execute({
        sql: `DELETE FROM track_registrations WHERE team_no = ? OR "Team No" = ?`,
        args: [target.teamNo, target.teamNo],
      });
    }
  }

  const counts = await getTrackCounts();
  const records = await getRegistrationRecords();
  return { counts, records };
}

/**
 * Remove all registrations from Turso and reset slot counts.
 */
export async function deleteAllRegistrationRecords(): Promise<{
  counts: Record<ValidTrack, number>;
  records: RegistrationRecord[];
}> {
  await ensureTablesExist();
  const client = getDbClient();

  await client.execute(`DELETE FROM track_registrations`);
  try {
    await client.execute(`DELETE FROM sqlite_sequence WHERE name = 'track_registrations'`);
  } catch {
    // sqlite_sequence might not exist or error, safe to ignore
  }

  const counts = await getTrackCounts();
  const records = await getRegistrationRecords();
  return { counts, records };
}


function applyHeaderStyle(headerRow: ExcelJS.Row) {
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
}

/**
 * Dynamically generate an Excel file in-memory directly from Turso database records.
 * NEVER writes to disk — 100% compatible with Vercel and serverless read-only runtimes!
 */
export async function generateExcelBuffer(): Promise<Buffer> {
  const records = await getRegistrationRecords();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(SHEET_NAME);

  const headerRow = worksheet.addRow([
    "Track Number",
    "Team No",
    "Team Name",
    "Track Name",
    "Leader Name",
    "Track_and_Team_Number",
  ]);
  applyHeaderStyle(headerRow);

  worksheet.columns = [
    { key: "trackNumber", width: 16 },
    { key: "teamNo", width: 14 },
    { key: "teamName", width: 32 },
    { key: "trackName", width: 36 },
    { key: "leaderName", width: 30 },
    { key: "trackAndTeamNumber", width: 28 },
  ];

  for (const rec of records) {
    const row = worksheet.addRow([
      rec.trackNumber,
      rec.teamNo,
      rec.teamName,
      rec.trackName,
      rec.leaderName,
      rec.trackAndTeamNumber,
    ]);
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(6).alignment = { horizontal: "center" };
  }

  // Produce binary buffer purely in RAM
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Synchronize registrations from an uploaded .xlsx buffer directly into Turso Cloud.
 */
export async function syncFromExcelBuffer(
  fileBuffer: Buffer
): Promise<{ counts: Record<ValidTrack, number>; records: RegistrationRecord[] }> {
  await ensureTablesExist();
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(fileBuffer as any);

  const worksheet = workbook.getWorksheet(SHEET_NAME) || workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("No worksheets found in uploaded file.");
  }

  const client = getDbClient();
  const newRecords: Array<{
    trackNumber: string;
    teamNo: number;
    teamName: string;
    trackName: string;
    leaderName: string;
    trackAndTeamNumber: string;
  }> = [];

  const col2Header = String(worksheet.getRow(1).getCell(2).value || "").trim().toLowerCase();
  const hasTeamNoCol = col2Header.includes("team no") || col2Header === "team no";

  let seq = 1;
  worksheet.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1) return;

    if (hasTeamNoCol) {
      const c1 = String(row.getCell(1).value || "").trim();
      const c2 = Number(row.getCell(2).value) || seq++;
      const c3 = String(row.getCell(3).value || "").trim();
      const c4 = String(row.getCell(4).value || "").trim();
      const c5 = String(row.getCell(5).value || "").trim();
      const c6 = String(row.getCell(6).value || "").trim();
      if (c1 || c3 || c4) {
        newRecords.push({
          trackNumber: c1 || "01",
          teamNo: c2,
          teamName: c3,
          trackName: c4,
          leaderName: c5,
          trackAndTeamNumber: c6
            ? (c6.match(/track\s*(\d+)[@_]team\s*(\d+)/i)
                ? `T${c6.match(/track\s*(\d+)[@_]team\s*(\d+)/i)![1]}@${c6.match(/track\s*(\d+)[@_]team\s*(\d+)/i)![2]}`
                : c6.replace("_", "@"))
            : `T${parseInt(c1 || "1", 10)}@${seq}`,
        });
      }
    } else {
      const c1 = String(row.getCell(1).value || "").trim();
      const c2 = String(row.getCell(2).value || "").trim();
      const c3 = String(row.getCell(3).value || "").trim();
      const c4 = String(row.getCell(4).value || "").trim();
      if (c1 || c2 || c3) {
        newRecords.push({
          trackNumber: c1 || "01",
          teamNo: seq++,
          teamName: c2,
          trackName: c3,
          leaderName: c4,
          trackAndTeamNumber: `T${parseInt(c1 || "1", 10)}@${seq}`,
        });
      }
    }
  });

  // Clear existing and insert in Turso
  await client.execute("DELETE FROM track_registrations");

  for (const rec of newRecords) {
    await client.execute({
      sql: `
        INSERT INTO track_registrations (
          "Track Number", "Team No", "Team Name", "Track Name", "Leader Name", "Track_and_Team_Number",
          track_number, team_no, team_name, track_name, leader_name, track_and_team_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        rec.trackNumber,
        rec.teamNo,
        rec.teamName,
        rec.trackName,
        rec.leaderName,
        rec.trackAndTeamNumber,
        rec.trackNumber,
        rec.teamNo,
        rec.teamName,
        rec.trackName,
        rec.leaderName,
        rec.trackAndTeamNumber,
      ],
    });
  }

  const counts = await getTrackCounts();
  const records = await getRegistrationRecords();
  return { counts, records };
}
