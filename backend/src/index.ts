import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
// import authRoutes from './routes/authRoutes';
// import summaryRoutes from './routes/summaryRoutes';
// import newsletterRoutes from './routes/newsletterRoutes';
// import userRoutes from './routes/userRoutes';
// import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;
console.log("PORT from env:", process.env.PORT);
// Connect to database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/summaries', summaryRoutes);
// app.use('/api/newsletters', newsletterRoutes);
// app.use('/api/users', userRoutes);

// // Error handling middleware
// app.use(errorHandler);

// // Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});