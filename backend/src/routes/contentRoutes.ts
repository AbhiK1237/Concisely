import express from 'express';
import { protect } from '../middleware/auth';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { triggerContentAndNewsletterForUser } from '../services/contentScheduler';
import { fetchAndProcessContentForUser } from '../services/ContentFetcherService';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
const router = express.Router();
interface AuthRequest extends Request {
    user?: {
        _id: mongoose.Types.ObjectId;
        preferences?: {
            topics: string[];
        };
    };
}
router.post('/fetch', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json(apiResponse.error('User not authenticated'));
            return;
        }
        const userId = req.user._id;

        // Check if user has topics configured
        if (!req.user.preferences?.topics || req.user.preferences.topics.length === 0) {
            res.status(400).json(apiResponse.error('Please configure your topics of interest first'));
            return;
        }

        // Trigger content fetching
        const result = await fetchAndProcessContentForUser(userId.toString());

        if (result.success) {
            res.json(apiResponse.success(result.data, 'Content fetched successfully'));

            return;
        } else {
            res.status(400).json(apiResponse.error(result.message));
            return;
        }
    } catch (error) {
        logger.error('Error in manual content fetch:', error);
        if (error instanceof Error) {
            res.status(500).json(apiResponse.error(error.message));
            return;
        } else {
            res.status(500).json(apiResponse.error('Server error while fetching content'));
            return;
        }
    }
});

router.post('/newsletter', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json(apiResponse.error('User not authenticated'));
            return;
        }
        const userId = req.user._id;

        // Check if user has topics configured
        if (!req.user.preferences?.topics || req.user.preferences.topics.length === 0) {
            res.status(400).json(apiResponse.error('Please configure your topics of interest first'));
            return
        }

        // Trigger content fetching and newsletter generation
        const result = await triggerContentAndNewsletterForUser(userId.toString());

        if (result.success) {
            res.json(apiResponse.success(result.message, 'Content fetched and newsletter generated'));
            return;
        } else {
            res.status(400).json(apiResponse.error(result.message));
            return;
        }
    } catch (error) {
        logger.error('Error generating newsletter:', error);
        if (error instanceof Error) {
            res.status(500).json(apiResponse.error(error.message));
            return
        } else {
            res.status(500).json(apiResponse.error('Server error while generating newsletter'));
            return;
        }
    }
});

export default router;
