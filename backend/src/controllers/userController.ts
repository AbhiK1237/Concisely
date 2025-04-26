import { Request, Response } from 'express';
import User from '../models/User';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Define the AuthRequest interface to include user property with proper typing
interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
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