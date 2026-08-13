import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/scan/batch
 * Process a batch of offline scanner logs.
 * Returns status result list for each item in the batch.
 */
export declare function syncBatchScans(req: Request, res: Response, next: NextFunction): Promise<void>;
