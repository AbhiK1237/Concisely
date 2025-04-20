// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import summaryRoutes from './routes/summaryRoutes';
import userRoutes from './routes/userRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/newsletters', newsletterRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;