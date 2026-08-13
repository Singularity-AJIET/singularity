import { Request, Response, NextFunction } from 'express';
/**
 * GET /api/claims/report
 * Returns all claims with full participant/staff and team details.
 * Supports optional ?itemType= query param to filter by counter session.
 */
export declare function getClaimsReport(req: Request, res: Response, next: NextFunction): Promise<void>;
