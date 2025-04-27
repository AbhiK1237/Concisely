// src/routes/userRoutes.ts
// src/routes/userRoutes.ts
import express, { Router } from 'express';
import {
    getUsers,
    updateUserPreferences,
    deleteUser,
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { getSavedSummaries, saveSummary, unsaveSummary } from '../controllers/userController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all users (admin only)
router.get('/', getUsers);

// Update user preferences
router.put('/preferences', updateUserPreferences);

// Delete user account
router.delete('/', deleteUser);
router.get('/saved-summaries', getSavedSummaries);
router.post('/saved-summaries/:summaryId', saveSummary);
router.delete('/saved-summaries/:summaryId', unsaveSummary);

export default router;