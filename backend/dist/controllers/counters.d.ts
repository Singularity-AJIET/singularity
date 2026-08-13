import { Request, Response, NextFunction } from 'express';
export declare function formatCounterSession(session: any): {
    id: any;
    name: any;
    is_open: any;
    opened_at: any;
    closed_at: any;
};
/**
 * GET /api/counters
 * Returns the status of all event counter sessions.
 */
export declare function getCounters(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/counters
 * Creates a new counter session if it doesn't already exist.
 */
export declare function createCounter(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/counters/:sessionId/toggle
 * Flips the isOpen state of a counter session and sets/clears appropriate timestamps.
 */
export declare function toggleCounter(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/counters/events
 * SSE stream — pushes counter status changes in real-time to connected scanner clients.
 */
export declare function counterEvents(req: Request, res: Response): Promise<void>;
