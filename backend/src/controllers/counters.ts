 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/db.js';
import { addClient, broadcastCounterUpdate } from '../services/sse.js';

// Standardized mapping function for Counter Sessions
export function formatCounterSession(session: any) {
  return {
    id: session.id,
    name: session.name,
    is_open: session.isOpen,
    opened_at: session.openedAt ? session.openedAt.toISOString() : null,
    closed_at: session.closedAt ? session.closedAt.toISOString() : null
  };
}

/**
 * GET /api/counters
 * Returns the status of all event counter sessions.
 */
export async function getCounters(req: Request, res: Response, next: NextFunction) {
  try {
    const sessions = await prisma.counterSession.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(sessions.map(formatCounterSession));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/counters
 * Creates a new counter session if it doesn't already exist.
 */
export async function createCounter(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      res.status(400).json({ detail: "Fields 'id' and 'name' are required." });
      return;
    }

    const existing = await prisma.counterSession.findUnique({
      where: { id }
    });

    if (existing) {
      res.status(400).json({ detail: `Counter session with ID '${id}' already exists` });
      return;
    }

    const session = await prisma.counterSession.create({
      data: {
        id,
        name,
        isOpen: false,
        openedAt: null,
        closedAt: null
      }
    });

    res.status(201).json(formatCounterSession(session));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/counters/:sessionId/toggle
 * Flips the isOpen state of a counter session and sets/clears appropriate timestamps.
 */
export async function toggleCounter(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;

    const session = await prisma.counterSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      res.status(404).json({ detail: `Counter session with ID '${sessionId}' not found` });
      return;
    }

    let data: any = {};
    if (session.isOpen) {
      // Close counter
      data = {
        isOpen: false,
        closedAt: new Date()
      };
    } else {
      // Open counter: Close all other active counters first
      await prisma.counterSession.updateMany({
        where: {
          isOpen: true,
          id: { not: sessionId }
        },
        data: {
          isOpen: false,
          closedAt: new Date()
        }
      });

      data = {
        isOpen: true,
        openedAt: new Date(),
        closedAt: null
      };
    }

    const updated = await prisma.counterSession.update({
      where: { id: sessionId },
      data
    });

    // Broadcast updated counter list to all SSE clients (scanner pages)
    const allSessions = await prisma.counterSession.findMany({ orderBy: { id: 'asc' } });
    broadcastCounterUpdate(allSessions.map(formatCounterSession));

    res.json(formatCounterSession(updated));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/counters/events
 * SSE stream — pushes counter status changes in real-time to connected scanner clients.
 */
export async function counterEvents(req: Request, res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send current state immediately on connect
  const sessions = await prisma.counterSession.findMany({ orderBy: { id: 'asc' } });
  res.write(`data: ${JSON.stringify(sessions.map(formatCounterSession))}\n\n`);

  // Keep-alive heartbeat every 30s to prevent proxy/tunnel timeouts
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  addClient(res);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
}
