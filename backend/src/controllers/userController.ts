import { Request, Response } from 'express';
import User from '../models/User';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(apiResponse.success(users));
  } catch (error) {
    logger.error(`Error fetching users: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Update user preferences
export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const { topics, frequency, format } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json(apiResponse.error('User not found'));
    }
    
    user.preferences = {
      topics: topics || user.preferences.topics,
      frequency: frequency || user.preferences.frequency,
      format: format || user.preferences.format,
    };
    
    const updatedUser = await user.save();
    
    res.json(apiResponse.success({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      preferences: updatedUser.preferences,
    }));
  } catch (error) {
    logger.error(`Error updating preferences: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Delete user account
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json(apiResponse.error('User not found'));
    }
    
    await user.remove();
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