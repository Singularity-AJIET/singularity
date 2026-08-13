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
        let participant = await prisma.participant.findUnique({
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
