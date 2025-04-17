import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Generate JWT token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id as string),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.preferences = req.body.preferences || user.preferences;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      preferences: updatedUser.preferences,
      token: generateToken(updatedUser._id as string),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};