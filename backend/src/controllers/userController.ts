import { Request, Response } from 'express';
import User from '../models/User';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import Summary from '../models/Summary';

// Define the AuthRequest interface to include user property with proper typing
interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
  params: {
    id?: string;
    summaryId?: string;
  };
  body: any;
}

// Get all users (for admin route)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(apiResponse.success(users));
  } catch (error) {
    logger.error(`Error getting users: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Update user preferences
export const updateUserPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { preferences } = req.body;
    const { topics, deliveryFrequency, summaryLength, maxItemsPerNewsletter } = preferences || {};
    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json(apiResponse.error('User not found'));
      return;
    }
    // Update using the exact field names from the schema
    user.preferences = {
      topics: topics || user.preferences.topics,
      deliveryFrequency: deliveryFrequency || user.preferences.deliveryFrequency,
      summaryLength: summaryLength || user.preferences.summaryLength,
      maxItemsPerNewsletter: maxItemsPerNewsletter || user.preferences.maxItemsPerNewsletter
    };
    const updatedUser = await user.save();

    // Convert to a plain object without password
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      preferences: updatedUser.preferences,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    // Send response without returning it
    res.json(apiResponse.success(userResponse, 'Preferences updated'));
  } catch (error) {
    logger.error(`Error updating user preferences: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Delete user account
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json(apiResponse.error('User not found'));
      return;
    }
    await User.findByIdAndDelete(req.user._id);
    res.json(apiResponse.success({}, 'User removed'));
  } catch (error) {
    logger.error(`Error deleting user: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

export const getSavedSummaries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    // Find the user and populate their saved summaries
    const user = await User.findById(req.user._id).populate('savedSummaries');

    if (!user) {
      res.status(404).json(apiResponse.error('User not found'));
      return;
    }

    res.json(apiResponse.success(user.savedSummaries || []));
  } catch (error) {
    logger.error(`Error fetching saved summaries: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Save a summary
export const saveSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { summaryId } = req.params;

    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    // Verify the summary exists
    const summary = await Summary.findById(summaryId);
    if (!summary) {
      res.status(404).json(apiResponse.error('Summary not found'));
      return;
    }

    // Add to user's saved summaries if not already saved
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json(apiResponse.error('User not found'));
      return;
    }

    // Initialize savedSummaries array if it doesn't exist
    if (!user.savedSummaries) {
      user.savedSummaries = [];
    }

    // Check if already saved
    const savedIndex = user.savedSummaries.findIndex(
      (id) => id.toString() === summaryId
    );

    if (savedIndex !== -1) {
      res.json(apiResponse.success({ alreadySaved: true }, 'Summary already saved'));
      return;
    }

    // Add the summary ID to savedSummaries
    if (summaryId) {
      user.savedSummaries.push(new mongoose.Types.ObjectId(summaryId));
    } else {
      res.status(400).json(apiResponse.error('Invalid summary ID'));
      return;
    }
    await user.save();

    res.json(apiResponse.success({ saved: true }, 'Summary saved successfully'));
  } catch (error) {
    logger.error(`Error saving summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Unsave a summary
export const unsaveSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { summaryId } = req.params;

    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json(apiResponse.error('User not found'));
      return;
    }

    // Remove the summary from savedSummaries
    if (user.savedSummaries) {
      user.savedSummaries = user.savedSummaries.filter(
        (id) => id.toString() !== summaryId
      );
      await user.save();
    }

    res.json(apiResponse.success({ removed: true }, 'Summary removed from saved items'));
  } catch (error) {
    logger.error(`Error unsaving summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};