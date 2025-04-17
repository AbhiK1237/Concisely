import { Request, Response } from 'express';
import Newsletter from '../models/Newsletter';
import User from '../models/User';
import Summary from '../models/Summary';
import { openaiService } from '../services/openaiService';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

// Create a new newsletter from summaries
export const createNewsletter = async (req: Request, res: Response) => {
  try {
    const { title, topics, summaryIds } = req.body;
    
    // Get the summaries for the newsletter
    const summaries = await Summary.find({
      _id: { $in: summaryIds },
    });
    
    if (summaries.length === 0) {
      return res.status(400).json(apiResponse.error('No valid summaries found'));
    }
    
    // Combine summaries content
    const combinedContent = summaries.map(s => s.content).join('\n\n');
    
    // Generate newsletter content using OpenAI
    const content = await openaiService.generateNewsletter(combinedContent, topics);
    
    // Create newsletter
    const newsletter = await Newsletter.create({
      title,
      content,
      topics,
      summaries: summaries.map(s => s._id),
    });
    
    res.status(201).json(apiResponse.success(newsletter));
  } catch (error) {
    logger.error(`Error creating newsletter: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Send newsletter to users
export const sendNewsletter = async (req: Request, res: Response) => {
  try {
    const { newsletterId } = req.params;
    
    const newsletter = await Newsletter.findById(newsletterId);
    
    if (!newsletter) {
      return res.status(404).json(apiResponse.error('Newsletter not found'));
    }
    
    // Find users with matching preferences
    const users = await User.find({
      'preferences.topics': { $in: newsletter.topics },
    });
    
    if (users.length === 0) {
      return res.status(400).json(apiResponse.error('No users found with matching preferences'));
    }
    
    // In a real app, you would send emails here
    // For now, just mark as sent
    newsletter.sentTo = users.map(user => user._id);
    newsletter.sentAt = new Date();
    await newsletter.save();
    
    res.json(apiResponse.success({
      newsletter,
      sentToCount: users.length,
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

// Get all newsletters
export const getAllNewsletters = async (req: Request, res: Response) => {
  try {
    const newsletters = await Newsletter.find().sort({ createdAt: -1 });
    res.json(apiResponse.success(newsletters));
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
export const getNewsletterById = async (req: Request, res: Response) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id)
      .populate('summaries')
      .populate('sentTo', 'name email');
    
    if (!newsletter) {
      return res.status(404).json(apiResponse.error('Newsletter not found'));
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

// Delete newsletter
export const deleteNewsletter = async (req: Request, res: Response) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json(apiResponse.error('Newsletter not found'));
    }
    
    await newsletter.remove();
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
