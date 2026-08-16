import { prisma } from '../services/db.js';
import { signToken, getSigningKey } from '../utils/crypto.js';
import { sendEmailPass } from '../services/email.js';
/**
 * POST /api/participants/:id/report
 * Records participant check-in, generates signed Ed25519 access token, and dispatches email pass.
 */
export async function reportParticipant(req, res, next) {
    try {
        const { id } = req.params;
        const participant = await prisma.participant.findUnique({
            where: { id },
            include: { team: true }
        });
        let isStaff = false;
        let staffMember = null;
        if (!participant) {
            staffMember = await prisma.eventStaff.findUnique({
                where: { id }
            });
            if (!staffMember) {
                res.status(404).json({ detail: 'Participant or staff member not found' });
                return;
            }
            isStaff = true;
        }
        const signingKey = getSigningKey();
        // Expiry default to 7 days from now (in seconds)
        const tokenLifetimeSeconds = parseInt(process.env.TOKEN_EXPIRY_SECONDS || '604800', 10);
        const expiry = Math.floor(Date.now() / 1000) + tokenLifetimeSeconds;
        const targetId = isStaff ? staffMember.id : participant.id;
        const targetName = isStaff ? staffMember.name : participant.name;
        const targetEmail = isStaff ? staffMember.email : participant.email;
        const targetTeamId = isStaff ? null : participant.teamId;
        const targetIsReported = isStaff ? staffMember.isReported : participant.isReported;
        // Generate token
        const token = await signToken({
            p: targetId,
            t: targetTeamId,
            n: targetName,
            e: expiry
        }, signingKey);
        if (targetIsReported) {
            // Dispatch email pass asynchronously (don't await so API is fast)
            sendEmailPass(targetEmail, targetName, token).catch(err => {
                console.error('Async email retry failed:', err);
            });
            res.json({
                success: true,
                message: `${isStaff ? 'Staff member' : 'Participant'} has already reported`,
                qr_payload: token
            });
            return;
        }
        // Set check-in status
        if (isStaff) {
            await prisma.eventStaff.update({
                where: { id: targetId },
                data: {
                    isReported: true,
                    reportedAt: new Date()
                }
            });
        }
        else {
            await prisma.participant.update({
                where: { id: targetId },
                data: {
                    isReported: true,
                    reportedAt: new Date()
                }
            });
        }
        // Dispatch email pass asynchronously
        sendEmailPass(targetEmail, targetName, token).catch(err => {
            console.error('Async email dispatch failed:', err);
        });
        res.json({
            success: true,
            message: `${isStaff ? 'Staff member' : 'Participant'} check-in recorded successfully`,
            qr_payload: token
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/checkin/bulk-staff
 * Generates signed Ed25519 access tokens and dispatches email passes for all pending staff.
 */
export async function bulkReportStaff(req, res, next) {
    try {
        const pendingStaff = await prisma.eventStaff.findMany({
            where: { isReported: false }
        });
        if (pendingStaff.length === 0) {
            res.json({ success: true, count: 0, message: 'No pending staff found to process.' });
            return;
        }
        const signingKey = getSigningKey();
        const tokenLifetimeSeconds = parseInt(process.env.TOKEN_EXPIRY_SECONDS || '604800', 10);
        const expiry = Math.floor(Date.now() / 1000) + tokenLifetimeSeconds;
        const now = new Date();
        let sentCount = 0;
        for (const staff of pendingStaff) {
            const token = await signToken({
                p: staff.id,
                t: null, // staff have no team
                n: staff.name,
                e: expiry
            }, signingKey);
            await prisma.eventStaff.update({
                where: { id: staff.id },
                data: {
                    isReported: true,
                    reportedAt: now
                }
            });
            sendEmailPass(staff.email, staff.name, token).catch(err => {
                console.error(`Async email dispatch failed for staff ${staff.email}:`, err);
            });
            sentCount++;
        }
        res.json({
            success: true,
            count: sentCount,
            message: `Successfully generated and sent ${sentCount} QR passes for staff.`
        });
    }
    catch (err) {
        next(err);
    }
}
