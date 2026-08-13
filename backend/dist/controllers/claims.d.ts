import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/claims
 * Executes a claim scan for a participant and a counter session.
 * Handles closed sessions, double claims, and record creation.
 */
export declare function executeClaim(req: Request, res: Response, next: NextFunction): Promise<void>;
