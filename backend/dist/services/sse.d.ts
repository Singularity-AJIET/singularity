import { Response } from 'express';
/**
 * Add a new SSE client connection.
 */
export declare function addClient(res: Response): void;
/**
 * Broadcast a counter status update to all connected SSE clients.
 */
export declare function broadcastCounterUpdate(counters: any[]): void;
/**
 * Add a new SSE client connection for countdown updates.
 */
export declare function addCountdownClient(res: Response): void;
/**
 * Broadcast countdown status update to all connected clients.
 */
export declare function broadcastCountdownUpdate(state: any): void;
