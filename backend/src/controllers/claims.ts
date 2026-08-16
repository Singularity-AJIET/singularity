 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/db.js';
import { Prisma } from '@prisma/client';
import { verifyToken, getSigningKey } from '../utils/crypto.js';

/**
 * POST /api/claims
 * Executes a claim scan for a participant and a counter session.
 * Handles closed sessions, double claims, and record creation.
 */
export async function executeClaim(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.token || req.body.qr_payload;
    const itemType = req.body.itemType || req.body.item_type;
    const scanId = req.body.scanId || req.body.scan_id || null;
    let participantId = req.body.participantId || req.body.participant_id;

    if (token) {
      const signingKey = getSigningKey();
      const payload = await verifyToken(token, signingKey);
      if (!payload) {
        res.status(400).json({ detail: "Invalid or expired cryptographic QR pass." });
        return;
      }
      participantId = payload.p;
    }

    if (!participantId || !itemType) {
      res.status(400).json({ detail: "Fields 'participantId' (or 'token') and 'itemType' are required." });
      return;
    }

    // Step A: Fetch CounterSession and verify it exists and is open
    const session = await prisma.counterSession.findUnique({
      where: { id: itemType }
    });

    if (!session) {
      res.status(404).json({ detail: `Counter session '${itemType}' does not exist.` });
      return;
    }

    if (!session.isOpen) {
      res.status(200).json({
        status: "CLOSED",
        message: "Counter session is currently closed."
      });
      return;
    }

    // Verify participant or staff exists
    let claimantName = "";
    let isStaff = false;
    let teamName: string | null = null;
    let teamNumber: string | null = null;
    let college: string | null = null;
    let email: string | null = null;
    let role: string = "Participant";

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: { team: true }
    });

    if (participant) {
      claimantName = participant.name;
      email = participant.email;
      role = participant.role || "Participant";
      if (participant.team) {
        teamName = participant.team.teamName;
        teamNumber = participant.team.teamNumber;
        college = participant.team.college;
      }
    } else {
      const staff = await prisma.eventStaff.findUnique({
        where: { id: participantId }
      });
      if (!staff) {
        res.status(404).json({ detail: "Participant or staff member does not exist." });
        return;
      }
      claimantName = staff.name;
      email = staff.email;
      role = staff.role ? `Staff (${staff.role.toUpperCase()})` : "Staff";
      isStaff = true;
    }

    // Step B: Attempt to insert a new Claim in DB
    try {
      const claimData: any = {
        itemType,
        scanId: scanId ? String(scanId) : null,
        claimedAt: new Date()
      };
      
      if (isStaff) {
        claimData.staffId = participantId;
      } else {
        claimData.participantId = participantId;
      }

      const claim = await prisma.claim.create({
        data: claimData
      });

      // Step C: On success, return OK with full details
      res.status(200).json({
        status: "OK",
        participantName: claimantName,
        email,
        role,
        isStaff,
        teamName,
        teamNumber,
        college,
        claimedAt: claim.claimedAt.toISOString()
      });
    } catch (err: unknown) {
      const isUniqueConstraint =
        (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') ||
        (err as any)?.code === 'P2002' ||
        (err as any)?.code === 'SQLITE_CONSTRAINT' ||
        (err as any)?.message?.includes('UNIQUE constraint failed');

      if (isUniqueConstraint) {
        const existingClaim = await prisma.claim.findFirst({
          where: isStaff
            ? { staffId: participantId, itemType }
            : { participantId, itemType }
        });
        
        res.status(200).json({
          status: "ALREADY_CLAIMED",
          message: "Double claim blocked.",
          participantName: claimantName,
          email,
          role,
          isStaff,
          teamName,
          teamNumber,
          college,
          claimedAt: existingClaim ? existingClaim.claimedAt.toISOString() : new Date().toISOString()
        });
        return;
      }
      // Re-throw unexpected errors
      throw err;
    }
  } catch (err) {
    next(err);
  }
}
