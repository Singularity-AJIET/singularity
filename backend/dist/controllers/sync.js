import { prisma } from '../services/db.js';
import { verifyToken, generateDevPrivateKey } from '../utils/crypto.js';
import { Prisma } from '@prisma/client';
// Lazily load or generate signing key
let cachedSigningKey = null;
function getSigningKey() {
    if (cachedSigningKey)
        return cachedSigningKey;
    const key = process.env.EVENT_SIGNING_KEY;
    if (key && key.trim().length === 64) {
        cachedSigningKey = key.trim();
        return cachedSigningKey;
    }
    const tempKey = generateDevPrivateKey();
    cachedSigningKey = tempKey;
    return cachedSigningKey;
}
/**
 * POST /api/scan/batch
 * Process a batch of offline scanner logs.
 * Returns status result list for each item in the batch.
 */
export async function syncBatchScans(req, res, next) {
    try {
        const items = req.body;
        if (!Array.isArray(items)) {
            res.status(400).json({ detail: "Payload must be an array of scan items." });
            return;
        }
        const signingKey = getSigningKey();
        const results = [];
        for (const item of items) {
            const scanId = item.scanId || item.scan_id || null;
            const tokenOrId = item.token || item.participantId || item.participant_id;
            const itemType = item.itemType || item.item_type;
            const scannedAtStr = item.scannedAt || item.scanned_at;
            const scannedAt = scannedAtStr ? new Date(scannedAtStr) : new Date();
            if (!tokenOrId || !itemType) {
                results.push({
                    scan_id: scanId,
                    status: "ERROR",
                    message: "Missing participant identity or item type."
                });
                continue;
            }
            // 1. Resolve participant ID
            let resolvedParticipantId = '';
            if (tokenOrId.startsWith('SNG1.')) {
                // Cryptographic token
                const verified = await verifyToken(tokenOrId, signingKey);
                if (!verified) {
                    results.push({
                        scan_id: scanId,
                        status: "ERROR",
                        message: "Invalid or expired cryptographic token."
                    });
                    continue;
                }
                resolvedParticipantId = verified.p;
            }
            else {
                // Raw participant UUID
                resolvedParticipantId = tokenOrId;
            }
            // 2. Verify participant or staff exists in DB
            let claimantName = '';
            let isStaff = false;
            const participant = await prisma.participant.findUnique({
                where: { id: resolvedParticipantId }
            });
            if (participant) {
                claimantName = participant.name;
            }
            else {
                const staff = await prisma.eventStaff.findUnique({
                    where: { id: resolvedParticipantId }
                });
                if (!staff) {
                    results.push({
                        scan_id: scanId,
                        status: "ERROR",
                        message: `Claimant with ID '${resolvedParticipantId}' does not exist.`
                    });
                    continue;
                }
                claimantName = staff.name;
                isStaff = true;
            }
            // 3. Verify counter session exists
            const session = await prisma.counterSession.findUnique({
                where: { id: itemType }
            });
            if (!session) {
                results.push({
                    scan_id: scanId,
                    status: "ERROR",
                    message: `Counter session '${itemType}' does not exist.`
                });
                continue;
            }
            // 4. Idempotency Check: search by scanId or unique compound fields
            let existingClaim = null;
            if (scanId) {
                existingClaim = await prisma.claim.findFirst({
                    where: { scanId: String(scanId) }
                });
            }
            if (!existingClaim) {
                existingClaim = await prisma.claim.findFirst({
                    where: isStaff
                        ? { staffId: resolvedParticipantId, itemType: itemType }
                        : { participantId: resolvedParticipantId, itemType: itemType }
                });
            }
            if (existingClaim) {
                results.push({
                    scan_id: scanId,
                    status: "ALREADY_CLAIMED",
                    message: "Already claimed.",
                    claimed_at: existingClaim.claimedAt.toISOString()
                });
                continue;
            }
            // 5. Try inserting the claim
            try {
                const claimData = {
                    itemType: itemType,
                    scanId: scanId ? String(scanId) : null,
                    claimedAt: scannedAt
                };
                if (isStaff) {
                    claimData.staffId = resolvedParticipantId;
                }
                else {
                    claimData.participantId = resolvedParticipantId;
                }
                const newClaim = await prisma.claim.create({
                    data: claimData
                });
                results.push({
                    scan_id: scanId,
                    status: "OK",
                    participant_name: claimantName,
                    claimed_at: newClaim.claimedAt.toISOString()
                });
            }
            catch (err) {
                const isUnique = (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') ||
                    err?.code === 'P2002' ||
                    err?.code === 'SQLITE_CONSTRAINT' ||
                    err?.message?.includes('UNIQUE constraint failed');
                if (isUnique) {
                    // Double-check race condition duplicate
                    const raceClaim = await prisma.claim.findFirst({
                        where: isStaff
                            ? { staffId: resolvedParticipantId, itemType: itemType }
                            : { participantId: resolvedParticipantId, itemType: itemType }
                    });
                    results.push({
                        scan_id: scanId,
                        status: "ALREADY_CLAIMED",
                        message: "Already claimed.",
                        claimed_at: raceClaim ? raceClaim.claimedAt.toISOString() : new Date().toISOString()
                    });
                }
                else {
                    results.push({
                        scan_id: scanId,
                        status: "ERROR",
                        message: err instanceof Error ? err.message : "Database write failed."
                    });
                }
            }
        }
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}
