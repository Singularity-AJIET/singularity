 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/db.js';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import { Readable } from 'stream';

// Standardized mapping function to return snake_case fields to the client
export function formatParticipant(p: any) {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    role: p.role,
    team_id: p.teamId,
    is_reported: p.isReported,
    reported_at: p.reportedAt ? p.reportedAt.toISOString() : null,
    team_name: p.team ? p.team.teamName : null,
    team_number: p.team ? p.team.teamNumber : null,
    college: p.team ? p.team.college : null
  };
}

/**
 * GET /api/participants
 * Fetches a list of participants filtered by search query, is_reported status, and role.
 */
export async function getParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, is_reported, isReported, role, team_id, teamId } = req.query;
    
    const where: any = {};
    
    if (search) {
      const searchStr = String(search);
      where.OR = [
        { name: { contains: searchStr } },
        { email: { contains: searchStr } }
      ];
    }
    
    const reportedParam = isReported !== undefined ? isReported : is_reported;
    if (reportedParam !== undefined) {
      where.isReported = reportedParam === 'true' || reportedParam === '1';
    }
    
    if (role) {
      where.role = String(role);
    }
    
    const teamIdParam = teamId !== undefined ? teamId : team_id;
    if (teamIdParam !== undefined) {
      where.teamId = parseInt(String(teamIdParam), 10);
    }
    
    const participants = await prisma.participant.findMany({
      where,
      include: { team: true },
      orderBy: { name: 'asc' }
    });
    
    res.json(participants.map(formatParticipant));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/participants/import
 * Accepts multipart CSV or Excel file and parses/imports participants.
 */
export async function importParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ detail: 'No file uploaded' });
      return;
    }

    let rows: any[] = [];
    const buffer = req.file.buffer;
    const filename = req.file.originalname.toLowerCase();

    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      // Parse Excel
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = xlsx.utils.sheet_to_json(sheet);
    } else {
      // Parse CSV
      const results: any[] = [];
      const stream = Readable.from(buffer);
      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            rows = results;
            resolve();
          })
          .on('error', (err) => reject(err));
      });
    }

    const importedParticipants: any[] = [];

    for (const row of rows) {
      // Flexible key normalization to support headers of various casing
      const name = row.name || row.Name || row.participant_name || row.Participant_Name || '';
      const email = row.email || row.Email || row.participant_email || row.Participant_Email || '';
      const phone = row.phone || row.Phone || row.phone_number || row.Phone_Number || row.telephone || null;
      
      const teamName = row.team_name || row.teamName || row.TeamName || row.Team_Name || row.team || '';
      const teamNumber = row.team_number || row.teamNumber || row.TeamNumber || row.Team_Number || row.team_no || null;
      const college = row.college || row.College || row.university || row.institution || '';
      const role = row.role || row.Role || 'participant';

      if (!name || !email) {
        // Skip invalid rows
        console.warn('Skipping participant row due to missing name or email:', row);
        continue;
      }

      const roleLower = String(role).trim().toLowerCase();
      const isStaffRole = ['hod', 'faculty', 'volunteer'].includes(roleLower);

      if (isStaffRole) {
        // Resolve or Create EventStaff (no team mapping needed for staff)
        let staff = await prisma.eventStaff.findUnique({
          where: { email: String(email).trim().toLowerCase() }
        });

        if (!staff) {
          staff = await prisma.eventStaff.create({
            data: {
              name: String(name).trim(),
              email: String(email).trim().toLowerCase(),
              phone: phone ? String(phone).trim() : null,
              role: roleLower,
              isReported: false,
              reportedAt: null
            }
          });
        }
        importedParticipants.push(staff);
      } else {
        // 1. Resolve or Create Team (only if teamName and college are present)
        let teamId: number | null = null;
        if (teamName && college) {
          let team = await prisma.team.findFirst({
            where: {
              teamName: String(teamName).trim(),
              college: String(college).trim()
            }
          });

          if (!team) {
            team = await prisma.team.create({
              data: {
                teamName: String(teamName).trim(),
                teamNumber: teamNumber ? String(teamNumber).trim() : null,
                college: String(college).trim()
              }
            });
          }
          teamId = team.id;
        }

        // 2. Resolve or Create Participant
        let participant = await prisma.participant.findUnique({
          where: { email: String(email).trim().toLowerCase() }
        });

        if (!participant) {
          participant = await prisma.participant.create({
            data: {
              name: String(name).trim(),
              email: String(email).trim().toLowerCase(),
              phone: phone ? String(phone).trim() : null,
              role: String(role).trim(),
              teamId,
              isReported: false,
              reportedAt: null
            }
          });
        }

        importedParticipants.push(participant);
      }
    }

    res.status(201).json(importedParticipants.map(formatParticipant));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/participants/:id
 * Fetches detailed profile lookup including team info, teammates (same team_id), and claims logs.
 */
export async function getParticipantDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const part = await prisma.participant.findUnique({
      where: { id },
      include: {
        team: true,
        claims: true
      }
    });

    if (!part) {
      // Look up in EventStaff instead
      const staff = await prisma.eventStaff.findUnique({
        where: { id },
        include: {
          claims: true
        }
      });

      if (!staff) {
        res.status(404).json({ detail: 'Participant or staff member not found' });
        return;
      }

      res.json({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        is_reported: staff.isReported,
        reported_at: staff.reportedAt ? staff.reportedAt.toISOString() : null,
        team: null,
        teammates: [],
        claims: staff.claims.map(c => ({
          id: c.id,
          participant_id: c.participantId,
          staff_id: c.staffId,
          item_type: c.itemType,
          claimed_at: c.claimedAt.toISOString()
        }))
      });
      return;
    }

    // Query teammates if participant belongs to a team
    let teammates: any[] = [];
    if (part.teamId) {
      teammates = await prisma.participant.findMany({
        where: {
          teamId: part.teamId,
          id: { not: part.id }
        }
      });
    }

    // Format output in snake_case to preserve exact parity with Python schemas
    res.json({
      id: part.id,
      name: part.name,
      email: part.email,
      phone: part.phone,
      role: part.role,
      is_reported: part.isReported,
      reported_at: part.reportedAt ? part.reportedAt.toISOString() : null,
      team: part.team ? {
        id: part.team.id,
        team_name: part.team.teamName,
        team_number: part.team.teamNumber,
        college: part.team.college
      } : null,
      teammates: teammates.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        is_reported: t.isReported,
        reported_at: t.reportedAt ? t.reportedAt.toISOString() : null
      })),
      claims: part.claims.map(c => ({
        id: c.id,
        participant_id: c.participantId,
        item_type: c.itemType,
        claimed_at: c.claimedAt.toISOString()
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/staff
 * Fetches the list of all staff members (HODs, Faculty, Volunteers) optionally filtered by search or role.
 */
export async function getStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, role, is_reported, isReported } = req.query;

    const where: any = {};

    if (search) {
      const searchStr = String(search);
      where.OR = [
        { name: { contains: searchStr } },
        { email: { contains: searchStr } }
      ];
    }

    if (role) {
      where.role = String(role);
    }

    const reportedParam = isReported !== undefined ? isReported : is_reported;
    if (reportedParam !== undefined) {
      where.isReported = reportedParam === 'true' || reportedParam === '1';
    }

    const staff = await prisma.eventStaff.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json(staff.map(formatParticipant));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/participants/clear
 * Wipes all teams, participants, staff, and claims, and resets counter doors.
 */
export async function clearEventData(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('Admin triggered database reset: Wiping event transaction tables...');
    
    // Wipe claims first due to foreign keys
    await prisma.claim.deleteMany({});
    
    // Wipe participants & staff
    await prisma.participant.deleteMany({});
    await prisma.eventStaff.deleteMany({});
    
    // Wipe teams
    await prisma.team.deleteMany({});
    
    // Reset counter session states
    await prisma.counterSession.updateMany({
      data: {
        isOpen: false,
        openedAt: null,
        closedAt: null
      }
    });

    res.json({
      success: true,
      message: "All participant, team, staff, and claim data has been successfully wiped and counters have been reset."
    });
  } catch (err) {
    next(err);
  }
}

