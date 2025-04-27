// src/routes/summaryRoutes.ts
import express from 'express';
import {
  createYouTubeSummary,
  createWebsiteSummary,
  createPdfSummary,
  createPodcastSummary,
  getUserSummaries,
  getSummaryById,
  deleteSummary,
  rateSummary
} from '../controllers/summaryController';
import { protect } from '../middleware/auth';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Protect all routes
router.use(protect);

// Create summaries - MUST be BEFORE /:id route
router.post('/youtube', createYouTubeSummary);
router.post('/article', createWebsiteSummary);
router.post('/document', upload.single('document'), createPdfSummary);
router.post('/podcast', createPodcastSummary);
router.post("/:id/rate", rateSummary)
// Get all summaries for a user
router.get('/', getUserSummaries);

// Get/delete a specific summary - MUST be LAST
router.route('/:id')
  .get(getSummaryById)
  .delete(deleteSummary);

export default router;