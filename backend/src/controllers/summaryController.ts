import { Request, Response } from 'express';
import Summary from '../models/Summary';
import { openaiService } from '../services/openaiService';
import { youtubeService } from '../services/youtubeService';
import { websiteService } from '../services/websiteService';
import { pdfService } from '../services/pdfService';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

// Create a summary from a YouTube video
export const createYouTubeSummary = async (req: Request, res: Response) => {
  try {
    const { videoUrl, title } = req.body;
    
    // Get the transcript from YouTube
    const transcript = await youtubeService.getTranscript(videoUrl);
    
    // Generate summary using OpenAI
    const summary = await openaiService.generateSummary(transcript);
    
    // Save the summary
    const newSummary = await Summary.create({
      title: title || 'YouTube Summary',
      content: summary,
      sourceUrl: videoUrl,
      sourceType: 'youtube',
      user: req.user._id,
      topics: req.body.topics || [],
    });
    
    res.status(201).json(apiResponse.success(newSummary));
  } catch (error) {
    logger.error(`Error creating YouTube summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Create a summary from a website
export const createWebsiteSummary = async (req: Request, res: Response) => {
  try {
    const { websiteUrl, title } = req.body;
    
    // Get the content from the website
    const content = await websiteService.getContent(websiteUrl);
    
    // Generate summary using OpenAI
    const summary = await openaiService.generateSummary(content);
    
    // Save the summary
    const newSummary = await Summary.create({
      title: title || 'Website Summary',
      content: summary,
      sourceUrl: websiteUrl,
      sourceType: 'website',
      user: req.user._id,
      topics: req.body.topics || [],
    });
    
    res.status(201).json(apiResponse.success(newSummary));
  } catch (error) {
    logger.error(`Error creating website summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Create a summary from a PDF
export const createPdfSummary = async (req: Request, res: Response) => {
  try {
    const { pdfFile, title } = req.body;
    
    // Extract text from PDF
    const content = await pdfService.extractText(pdfFile);
    
    // Generate summary using OpenAI
    const summary = await openaiService.generateSummary(content);
    
    // Save the summary
    const newSummary = await Summary.create({
      title: title || 'PDF Summary',
      content: summary,
      sourceType: 'pdf',
      user: req.user._id,
      topics: req.body.topics || [],
    });
    
    res.status(201).json(apiResponse.success(newSummary));
  } catch (error) {
    logger.error(`Error creating PDF summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Create a summary from a podcast
export const createPodcastSummary = async (req: Request, res: Response) => {
  try {
    const { podcastUrl, title } = req.body;
    
    // Get transcript from podcast (this would typically involve audio processing)
    const transcript = await youtubeService.getTranscript(podcastUrl); // Using YouTube service as placeholder
    
    // Generate summary using OpenAI
    const summary = await openaiService.generateSummary(transcript);
    
    // Save the summary
    const newSummary = await Summary.create({
      title: title || 'Podcast Summary',
      content: summary,
      sourceUrl: podcastUrl,
      sourceType: 'podcast',
      user: req.user._id,
      topics: req.body.topics || [],
    });
    
    res.status(201).json(apiResponse.success(newSummary));
  } catch (error) {
    logger.error(`Error creating podcast summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Get all summaries for a user
export const getUserSummaries = async (req: Request, res: Response) => {
  try {
    const summaries = await Summary.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(apiResponse.success(summaries));
  } catch (error) {
    logger.error(`Error fetching user summaries: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Get a single summary by ID
export const getSummaryById = async (req: Request, res: Response) => {
  try {
    const summary = await Summary.findById(req.params.id);
    
    if (!summary) {
      return res.status(404).json(apiResponse.error('Summary not found'));
    }
    
    // Check if the summary belongs to the logged in user
    if (summary.user.toString() !== req.user._id.toString()) {
      return res.status(401).json(apiResponse.error('Not authorized'));
    }
    
    res.json(apiResponse.success(summary));
  } catch (error) {
    logger.error(`Error fetching summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};

// Delete a summary
export const deleteSummary = async (req: Request, res: Response) => {
  try {
    const summary = await Summary.findById(req.params.id);
    
    if (!summary) {
      return res.status(404).json(apiResponse.error('Summary not found'));
    }
    
    // Check if the summary belongs to the logged in user
    if (summary.user.toString() !== req.user._id.toString()) {
      return res.status(401).json(apiResponse.error('Not authorized'));
    }
    
    await summary.remove();
    res.json(apiResponse.success({}, 'Summary removed'));
  } catch (error) {
    logger.error(`Error deleting summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};
