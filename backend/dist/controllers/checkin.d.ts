import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/participants/:id/report
 * Records participant check-in, generates signed Ed25519 access token, and dispatches email pass.
 */
export declare function reportParticipant(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/checkin/bulk-staff
 * Generates signed Ed25519 access tokens and dispatches email passes for all pending staff.
 */
export declare function bulkReportStaff(req: Request, res: Response, next: NextFunction): Promise<void>;
