import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile
router.get('/profile', protect, getUserProfile);

// Update user profile
router.put('/profile', protect, updateUserProfile);

export default router;

/
// src/routes/newsletterRoutes.ts
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