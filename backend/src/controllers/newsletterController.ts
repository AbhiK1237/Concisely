import { Request, Response } from 'express';
import Newsletter from '../models/Newsletter';
import User from '../models/User';
import Summary from '../models/Summary';
import { generateNewsletter } from '../services/openaiService';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
// Import the email service
import { emailService } from '../services/emailService';
interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
}

// Schedule a newsletter for future delivery
export const scheduleNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;

    if (!scheduledDate) {
      res.status(400).json(apiResponse.error('Scheduled date is required'));
      return;
    }

    // Make sure the date is in the future
    const scheduleTime = new Date(scheduledDate);
    if (scheduleTime <= new Date()) {
      res.status(400).json(apiResponse.error('Scheduled date must be in the future'));
      return;
    }

    const newsletter = await Newsletter.findById(id);

    if (!newsletter) {
      res.status(404).json(apiResponse.error('Newsletter not found'));
      return;
    }

    // Update the newsletter with scheduling information
    newsletter.scheduledDate = scheduleTime;
    newsletter.status = 'scheduled';
    await newsletter.save();

    res.json(apiResponse.success(newsletter, 'Newsletter scheduled successfully'));
  } catch (error) {
    logger.error(`Error scheduling newsletter: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Send newsletter to users
export const sendNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { newsletterId } = req.params;

    // First, check if the newsletter exists
    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter) {
      res.status(404).json(apiResponse.error('Newsletter not found'));
      return;
    }

    // Use the emailService to send the newsletter
    const result = await emailService.sendNewsletter(newsletterId);

    if (!result.success) {
      if (result.sentCount === 0 && result.failedCount === 0) {
        res.status(400).json(apiResponse.error('No users found with matching preferences'));
      } else {
        res.status(500).json(apiResponse.error(`Failed to send newsletter: ${result.failedCount} failures`));
      }
      return;
    }

    // Return success response with the result
    res.json(apiResponse.success({
      newsletter,
      sentToCount: result.sentCount,
      failedCount: result.failedCount
    }, 'Newsletter sent successfully'));

  } catch (error) {
    logger.error(`Error sending newsletter: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Also modify the createNewsletter function to set the initial status:
export const createNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, topics, summaryIds } = req.body;

    // Get the summaries for the newsletter
    const summaries = await Summary.find({
      _id: { $in: summaryIds },
    });

    if (summaries.length === 0) {
      res.status(400).json(apiResponse.error('No valid summaries found'));
      return;
    }

    // Combine summaries content
    const combinedContent = summaries.map(s => s.summary).join('\n\n');

    // Generate newsletter content using OpenAI
    const content = await generateNewsletter(combinedContent, topics);

    // Create newsletter
    const newsletter = await Newsletter.create({
      title,
      content,
      topics,
      summaries: summaries.map(s => s._id),
      status: 'draft',  // Set initial status
    });

    res.status(201).json(apiResponse.success(newsletter, 'Newsletter created successfully'));
  } catch (error) {
    logger.error(`Error creating newsletter: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Get all newsletters
export const getAllNewsletters = async (req: Request, res: Response) => {
  try {
    const newsletters = await Newsletter.find().sort({ createdAt: -1 });
    res.json(apiResponse.success(newsletters, 'Newsletters fetched successfully'));
  } catch (error) {
    logger.error(`Error fetching newsletters: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Get newsletter by ID
export const getNewsletterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const newsletter = await Newsletter.findById(req.params.id)
      .populate('summaries')
      .populate('sentTo', 'name email');

    if (!newsletter) {
      res.status(404).json(apiResponse.error('Newsletter not found'));
      return;
    }

    res.json(apiResponse.success(newsletter));
  } catch (error) {
    logger.error(`Error fetching newsletter: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Get the latest newsletter for the current user
export const getLatestNewsletter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get the userId from the authenticated user
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json(apiResponse.error('User not authenticated'));
      return;
    }

    // Find the latest sent newsletter that includes the user's topics
    // First get the user's topics
    const user = await User.findById(userId);

    if (!user || !user.preferences || !user.preferences.topics) {
      res.status(404).json(apiResponse.error('User preferences not found'));
      return;
    }

    const userTopics = user.preferences.topics;

    // Find newsletters that match the user's topics and are in sent status
    // Sort by sentAt date in descending order to get the most recent one
    const newsletter = await Newsletter.findOne({
      topics: { $in: userTopics },
      status: 'sent',
      sentAt: { $ne: null }
    })
      .sort({ sentAt: -1 })
      .populate('summaries');

    if (!newsletter) {
      // If no sent newsletter found, try to find a scheduled one
      const scheduledNewsletter = await Newsletter.findOne({
        topics: { $in: userTopics },
        status: 'scheduled'
      })
        .sort({ scheduledDate: -1 })
        .populate('summaries');

      if (!scheduledNewsletter) {
        res.status(404).json(apiResponse.error('No newsletters found'));
        return;
      }

      res.json(apiResponse.success(scheduledNewsletter));
      return;
    }

    res.json(apiResponse.success(newsletter));
  } catch (error) {
    logger.error(`Error fetching latest newsletter: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Delete newsletter
export const deleteNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      res.status(404).json(apiResponse.error('Newsletter not found'));
      return;
    }

    await Newsletter.findByIdAndDelete(req.params.id);
    res.json(apiResponse.success({}, 'Newsletter removed'));
  } catch (error) {
    logger.error(`Error deleting newsletter: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};
