import { Router } from 'express';
import multer from 'multer';
import { getParticipants, importParticipants, getParticipantDetail, getStaff, clearEventData } from '../controllers/participants.js';
import { reportParticipant } from '../controllers/checkin.js';
import { getCounters, createCounter, toggleCounter, counterEvents } from '../controllers/counters.js';
import { executeClaim } from '../controllers/claims.js';
import { getClaimsReport } from '../controllers/claimsReport.js';
import { syncBatchScans } from '../controllers/sync.js';
import { registerAdmin, loginAdmin, getMe, listAdmins, updateAdminPassword, deleteAdmin } from '../controllers/admin.js';
import { requireAdminAuth } from '../middlewares/auth.js';
const router = Router();
const upload = multer(); // Store file in memory buffer for parser processing
// Start time for status uptime check
const startTime = new Date();
/**
 * Health / Uptime check
 */
router.get('/status', (req, res) => {
    const uptime = (Date.now() - startTime.getTime()) / 1000;
    res.json({
        status: 'healthy',
        version: '1.1.0',
        uptime,
        timestamp: new Date().toISOString()
    });
});
// Participant Routes
router.get('/participants', getParticipants);
router.post('/participants/import', upload.single('file'), importParticipants);
router.get('/participants/:id', getParticipantDetail);
router.post('/participants/:id/report', reportParticipant);
router.get('/staff', getStaff);
router.post('/participants/clear', requireAdminAuth, clearEventData);
// Counter Routes
router.get('/counters', getCounters);
router.get('/counters/events', counterEvents); // SSE stream for real-time scanner updates
router.post('/counters', createCounter);
router.post('/counters/:sessionId/toggle', toggleCounter);
// Claim Routes
router.post('/claims', executeClaim);
router.get('/claims/report', requireAdminAuth, getClaimsReport);
// Offline Replay Sync Route
router.post('/scan/batch', syncBatchScans);
// Admin Authentication Routes
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);
router.get('/admin/me', requireAdminAuth, getMe);
router.get('/admin', requireAdminAuth, listAdmins);
router.put('/admin/:id/password', requireAdminAuth, updateAdminPassword);
router.delete('/admin/:id', requireAdminAuth, deleteAdmin);
export default router;
