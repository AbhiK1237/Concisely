// src/index.ts
import app from './app';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { initScheduler } from './services/newsletterScheduler';
import { scheduleContentAndNewsletters } from './services/contentScheduler';
import { initializeBraveMCPClient, shutdownBraveMCPClient } from './services/ContentFetcherService';
import { logger } from './utils/logger';
// import { diagnoseArticleFetchingIssue } from './services/ContentFetcherService';
// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;
console.log("PORT from env:", process.env.PORT);

// Connect to database
connectDB();

scheduleContentAndNewsletters();

// Initialize scheduler
initScheduler();
// Initialize Brave MCP Client
initializeBraveMCPClient()
  .then(success => {
    if (success) {
      logger.info('Brave MCP Client initialized successfully');
    } else {
      logger.error('Failed to initialize Brave MCP Client');
    }
  })
  .catch(err => {
    logger.error('Error initializing Brave MCP Client:', err);
  });

// In your main code or a separate script:
// const topic = "artificial intelligence";
// diagnoseArticleFetchingIssue(topic)
//   .then(() => console.log('Diagnosis complete'))
//   .catch(err => console.error('Error running diagnosis:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});