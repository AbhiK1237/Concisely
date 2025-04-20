// src/routes/userRoutes.ts
// src/routes/userRoutes.ts
import express, { Router } from 'express';
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