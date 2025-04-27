import { Request, Response } from 'express';
import Summary from '../models/Summary';
import { generateSummary, extractTopics } from '../services/openaiService';
import { getTranscriptText, getVideoInfo } from '../services/youtubeService';
import { scrapeArticle } from '../services/websiteService';
import { extractTextFromPdf } from '../services/pdfService';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { promises } from 'dns';

interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
}

// Create a summary from a YouTube video
export const createYouTubeSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    const { title } = await getVideoInfo(url);
    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    // Get the transcript from YouTube
    const transcript = await getTranscriptText(url);

    // Generate summary using OpenAI
    const summary = await generateSummary(transcript, "youtube", "long");

    // Save the summary
    const newSummary = await Summary.create({
      title: title || 'YouTube Summary',
      summary: summary,
      originalContent: transcript,
      sourceUrl: url,
      sourceType: 'youtube',
      userId: req.user._id,
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
export const createWebsiteSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    // Get the content from the website
    const result = await scrapeArticle(url);

    // Generate summary using OpenAI
    const summary = await generateSummary(result.content, "article", "long");

    // Save the summary
    const newSummary = await Summary.create({
      title: result.title || 'Website Summary',
      summary: summary,
      originalContent: result.content,
      sourceUrl: url,
      sourceType: 'article', // Changed from 'website' to match enum in model
      userId: req.user._id,
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
export const createPdfSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    const document = req.file?.path; // Get the path from multer

    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    if (!document) {
      res.status(400).json(apiResponse.error('PDF file is required'));
      return;
    }

    // Extract text from PDF (your existing code works here since now pdfFile is a path)
    const content = await extractTextFromPdf(document);

    // Generate summary using OpenAI
    const summary = await generateSummary(content, "document", "long");

    // Save the summary
    const newSummary = await Summary.create({
      title: title || 'PDF Summary',
      summary: summary,
      originalContent: content,
      sourceUrl: req.file?.originalname || 'local-pdf-upload',
      sourceType: 'document', // Changed from 'pdf' to match enum in model
      userId: req.user._id,
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
export const createPodcastSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { podcastUrl, title } = req.body;

    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    // Get transcript from podcast (this would typically involve audio processing)
    const transcript = await getTranscriptText(podcastUrl); // Using YouTube service as placeholder

    // Generate summary using OpenAI
    const summary = await generateSummary(transcript, "podcast", "long");

    // Save the summary
    const newSummary = await Summary.create({
      title: title || 'Podcast Summary',
      summary: summary,
      originalContent: transcript,
      sourceUrl: podcastUrl,
      sourceType: 'podcast',
      userId: req.user._id,
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
export const getUserSummaries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    const summaries = await Summary.find({ userId: req.user._id }).sort({ createdAt: -1 });
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
export const getSummaryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    const summary = await Summary.findById(req.params.id);

    if (!summary) {
      res.status(404).json(apiResponse.error('Summary not found'));
      return;
    }

    // Check if the summary belongs to the logged in user
    if (summary.userId.toString() !== req.user._id.toString()) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
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
export const deleteSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    const summary = await Summary.findById(req.params.id);

    if (!summary) {
      res.status(404).json(apiResponse.error('Summary not found'));
      return;

    }

    // Check if the summary belongs to the logged in user
    if (summary.userId.toString() !== req.user._id.toString()) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;

    }

    await Summary.deleteOne({ _id: summary._id }); // Updated from summary.remove()
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


// Add this to the existing summaryController.js

// Rate a summary
export const rateSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!req.user) {
      res.status(401).json(apiResponse.error('Not authorized'));
      return;
    }

    // Valid ratings
    const validRatings = ['helpful', 'not_helpful'];
    if (!validRatings.includes(rating)) {
      res.status(400).json(apiResponse.error('Invalid rating value'));
      return;
    }

    // Find the summary
    const summary = await Summary.findById(id);
    if (!summary) {
      res.status(404).json(apiResponse.error('Summary not found'));
      return;
    }

    // Initialize ratings if they don't exist
    if (!summary.ratings) {
      summary.ratings = {
        helpful: 0,
        not_helpful: 0
      };
    }

    // Increment the appropriate rating counter
    summary.ratings[rating as 'helpful' | 'not_helpful']++;
    await summary.save();

    res.json(apiResponse.success(summary, 'Rating submitted successfully'));
  } catch (error) {
    logger.error(`Error rating summary: ${error}`);
    if (error instanceof Error) {
      res.status(500).json(apiResponse.error(error.message));
    } else {
      res.status(500).json(apiResponse.error('An unknown error occurred'));
    }
  }
};
