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
} from '../controllers/summaryController';
import { protect } from '../middleware/auth';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Protect all routes
router.use(protect);

// Create summaries - MUST be BEFORE /:id route
router.post('/youtube', createYouTubeSummary);
router.post('/website', createWebsiteSummary);
router.post('/pdf', upload.single('pdfFile'), createPdfSummary);
router.post('/podcast', createPodcastSummary);

// Get all summaries for a user
router.get('/', getUserSummaries);

// Get/delete a specific summary - MUST be LAST
router.route('/:id')
  .get(getSummaryById)
  .delete(deleteSummary);

export default router;