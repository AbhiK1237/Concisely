// src/index.ts
import app from './app';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { initScheduler } from './services/newsletterScheduler';
import { scheduleContentAndNewsletters } from './services/contentScheduler';



// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;
console.log("PORT from env:", process.env.PORT);

// Connect to database
connectDB();

scheduleContentAndNewsletters();

// Initialize scheduler
initScheduler();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});