import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';

// Import security middleware
import { globalLimiter } from './middleware/rateLimiter.js';
import { securityHeaders } from './middleware/security.js';

// Import routes
import authRoutes from './routes/auth.js';
import classRoutes from './routes/classes.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();

// ==========================================
// 1. SECURITY MIDDLEWARE (CYBERSECURITY LAYERS)
// ==========================================

// Layer 1: Helmet - Set secure HTTP headers
app.use(helmet());
app.use(securityHeaders);

// Layer 2: CORS - Allow all for development
const corsOptions = {
  origin: true, // Allow all origins in Dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Layer 3: Payload Size Limits & Parsing
app.use(express.json({ limit: '10kb' })); // Prevents large payload DOS attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Layer 4: Cookie Parser (for secure JWT cookies)
app.use(cookieParser());

// Layer 5: HPP - Prevent HTTP Parameter Pollution
app.use(hpp());

// Layer 6: Global Rate Limiting
app.use(globalLimiter);

// ==========================================
// 2. ROUTES
// ==========================================

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is healthy and secure' });
});

// Auth Routes (Supabase + OTP + reCAPTCHA)
app.use('/api/auth', authRoutes);

// Classes / Study Rooms Routes (Protected)
app.use('/api/classes', classRoutes);

// AI Chatbot Routes
app.use('/api/ai', aiRoutes);

// ==========================================
// 3. ERROR HANDLING
// ==========================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('ERROR 💥:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SECURE SERVER] Running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
