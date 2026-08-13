import { Request, Response, NextFunction } from 'express';
export declare function formatParticipant(p: any): {
    id: any;
    name: any;
    email: any;
    phone: any;
    role: any;
    team_id: any;
    is_reported: any;
    reported_at: any;
    team_name: any;
    team_number: any;
    college: any;
};
/**
 * GET /api/participants
 * Fetches a list of participants filtered by search query, is_reported status, and role.
 */
export declare function getParticipants(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/participants/import
 * Accepts multipart CSV or Excel file and parses/imports participants.
 */
export declare function importParticipants(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/participants/:id
 * Fetches detailed profile lookup including team info, teammates (same team_id), and claims logs.
 */
export declare function getParticipantDetail(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/staff
 * Fetches the list of all staff members (HODs, Faculty, Volunteers) optionally filtered by search or role.
 */
export declare function getStaff(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/participants/clear
 * Wipes all teams, participants, staff, and claims, and resets counter doors.
 */
export declare function clearEventData(req: Request, res: Response, next: NextFunction): Promise<void>;
