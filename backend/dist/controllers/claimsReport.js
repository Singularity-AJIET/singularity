import { prisma } from '../services/db.js';
/**
 * GET /api/claims/report
 * Returns all claims with full participant/staff and team details.
 * Supports optional ?itemType= query param to filter by counter session.
 */
export async function getClaimsReport(req, res, next) {
    try {
        const { itemType } = req.query;
        const whereFilter = {};
        if (itemType && typeof itemType === 'string') {
            whereFilter.itemType = itemType;
        }
        const claims = await prisma.claim.findMany({
            where: whereFilter,
            include: {
                participant: {
                    include: { team: true }
                },
                staff: true,
                session: true,
            },
            orderBy: { claimedAt: 'desc' }
        });
        const result = claims.map((c) => {
            const isStaff = !!c.staffId;
            const person = isStaff ? c.staff : c.participant;
            return {
                id: c.id,
                personId: person?.id,
                itemType: c.itemType,
                sessionName: c.session?.name ?? c.itemType,
                claimedAt: c.claimedAt.toISOString(),
                isStaff,
                name: person?.name ?? 'Unknown',
                email: person?.email ?? null,
                role: isStaff
                    ? (c.staff?.role ?? 'staff')
                    : (c.participant?.role ?? 'participant'),
                teamName: (!isStaff && c.participant?.team?.teamName) ? c.participant.team.teamName : null,
                teamNumber: (!isStaff && c.participant?.team?.teamNumber) ? c.participant.team.teamNumber : null,
                college: (!isStaff && c.participant?.team?.college) ? c.participant.team.college : null,
            };
        });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
