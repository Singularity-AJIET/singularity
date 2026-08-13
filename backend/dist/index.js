import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
// Load environment variables
dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
// Configure CORS for next.js admin interface & network IP / tunnel access
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Mount routes under /api
app.use('/api', apiRouter);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server error encountered:', err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        detail: err.message || 'Internal Server Error'
    });
});
// Start listening
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`Event Pass Tracker Node.js/TS Backend    `);
    console.log(`Server listening on port ${PORT}          `);
    console.log(`API base url: http://localhost:${PORT}/api`);
    console.log(`=========================================`);
});
