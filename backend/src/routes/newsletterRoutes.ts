import express from 'express';
import {
  createNewsletter,
  sendNewsletter,
  getAllNewsletters,
  getNewsletterById,
  deleteNewsletter,
  scheduleNewsletter,
  getLatestNewsletter, // Add this import
} from '../controllers/newsletterController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Create a new newsletter
router.post('/', createNewsletter);

// Send a newsletter
router.post('/:newsletterId/send', sendNewsletter);

// Schedule a newsletter
router.post('/:id/schedule', scheduleNewsletter);

// Get all newsletters
router.get('/', getAllNewsletters);

// Get latest newsletter
router.get('/latest', getLatestNewsletter); // Add this new route

// Get/delete a specific newsletter
router.route('/:id')
  .get(getNewsletterById)
  .delete(deleteNewsletter);

export default router;