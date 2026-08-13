import { Response } from 'express';
/**
 * Add a new SSE client connection.
 */
export declare function addClient(res: Response): void;
/**
 * Broadcast a counter status update to all connected SSE clients.
 */
export declare function broadcastCounterUpdate(counters: any[]): void;
