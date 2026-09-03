import { Request, Response, NextFunction } from 'express';
/**
 * GET /api/countdown
 * Public endpoint returning current countdown state.
 */
export declare function getCountdownState(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/countdown/display
 * Admin endpoint: Enables display of the countdown on the public site (in idle state).
 */
export declare function updateCountdownDisplay(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/countdown/start
 * Admin endpoint: Starts the live countdown animation.
 * Requires display to be enabled first.
 */
export declare function triggerCountdownStart(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/countdown/remove
 * Admin endpoint: Removes/hides the countdown animation completely from public frontend.
 */
export declare function removeCountdown(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/countdown/reset
 * Admin endpoint: Resets countdown to idle state (isStarted: false).
 */
export declare function resetCountdown(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/countdown/events
 * Real-time SSE stream pushing countdown changes immediately to connected clients.
 */
export declare function countdownEvents(req: Request, res: Response): Promise<void>;
