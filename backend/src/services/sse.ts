 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';

// Store connected SSE clients
const clients: Set<Response> = new Set();

/**
 * Add a new SSE client connection.
 */
export function addClient(res: Response) {
  clients.add(res);
  res.on('close', () => {
    clients.delete(res);
  });
}

/**
 * Broadcast a counter status update to all connected SSE clients.
 */
export function broadcastCounterUpdate(counters: any[]) {
  const data = JSON.stringify(counters);
  for (const client of clients) {
    client.write(`data: ${data}\n\n`);
  }
}
