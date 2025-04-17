import express from 'express';
import {
  createNewsletter,
  sendNewsletter,
  getAllNewsletters,
  getNewsletterById,
  deleteNewsletter,
} from '../controllers/newsletterController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Create a new newsletter
router.post('/', createNewsletter);

// Send a newsletter
router.post('/:newsletterId/send', sendNewsletter);

// Get all newsletters
router.get('/', getAllNewsletters);

// Get/delete a specific newsletter
router.route('/:id')
  .get(getNewsletterById)
  .delete(deleteNewsletter);

export default router;

// src/routes/userRoutes.ts
import express from 'express';
import {
  getUsers,
  updateUserPreferences,
  deleteUser,
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all users (admin only)
router.get('/', getUsers);

// Update user preferences
router.put('/preferences', updateUserPreferences);

// Delete user account
router.delete('/', deleteUser);

export default router;