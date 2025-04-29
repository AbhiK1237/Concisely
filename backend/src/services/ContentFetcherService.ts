// src/services/ContentFetcherService.ts
import axios from 'axios';
import Summary from '../models/Summary';
import User from '../models/User';
import { summarizeContent, detectTopics } from './SummaryService';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { getTranscriptText } from './youtubeService';
import { scrapeArticle } from './websiteService';
// Configure with your API keys in environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export interface ContentItem {
    title: string;
    url: string;
    snippet: string;
    publishedAt: string;
    sourceType: 'article' | 'youtube' | 'podcast' | 'document';
}

/**
 * Fetches latest web articles using Google Custom Search API
 */
export async function fetchLatestArticles(topic: string, maxResults: number = 5): Promise<ContentItem[]> {
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_SEARCH_ENGINE_ID,
                q: topic,
                dateRestrict: 'w1', // Last week
                sort: 'date', // Sort by date
                num: maxResults,
            },
        });

        if (!response.data.items || response.data.items.length === 0) {
            return [];
        }

        return response.data.items.map((item: any) => ({
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            publishedAt: item.pagemap?.metatags?.[0]?.['article:published_time'] || new Date().toISOString(),
            sourceType: 'article',
        }));
    } catch (error) {
        logger.error('Error fetching articles:', error);
        return [];
    }
}

/**
 * Fetches latest YouTube videos using YouTube Data API
 */
export async function fetchLatestVideos(topic: string, maxResults: number = 5): Promise<ContentItem[]> {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: YOUTUBE_API_KEY,
                q: topic,
                part: 'snippet',
                type: 'video',
                order: 'date', // Sort by date
                maxResults: maxResults,
                publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last week
            },
        });

        if (!response.data.items || response.data.items.length === 0) {
            return [];
        }

        return response.data.items.map((item: any) => ({
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            snippet: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            sourceType: 'youtube',
        }));
    } catch (error) {
        logger.error('Error fetching YouTube videos:', error);
        return [];
    }
}

/**
 * Combines and sorts results from both article and video searches
 */
export async function searchContentByTopic(topic: string, maxResults: number = 3): Promise<ContentItem[]> {
    const [articles, videos] = await Promise.all([
        fetchLatestArticles(topic, maxResults),
        fetchLatestVideos(topic, maxResults),
    ]);

    // Combine and sort by published date
    const allContent = [...articles, ...videos].sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Return top results
    return allContent.slice(0, maxResults);
}

/**
 * Extracts full content from URL (article or video transcript)
 */
export async function extractContentFromUrl(url: string, sourceType: string): Promise<string> {
    if (sourceType === 'article') {
        try {
            const response = await scrapeArticle(url);

            return response.content;
        } catch (error) {
            logger.error('Error extracting article content:', error);
            // Fallback to using the URL directly if content extraction fails
            return `Content from: ${url}`;
        }
    } else if (sourceType === 'youtube') {
        try {

            const response = await getTranscriptText(url);
            return response;
        } catch (error) {
            logger.error('Error extracting video transcript:', error);
            // Fallback to using the URL directly if transcript extraction fails
            return `Video content from: ${url}`;
        }
    }

    return `Content from: ${url}`;
}

/**
 * Process a single content item and create a summary
 */
export async function processContentItem(
    userId: string,
    item: ContentItem
): Promise<{ success: boolean; summary: any }> {
    try {
        // Check if we already have a summary for this URL to avoid duplicates
        const existingSummary = await Summary.findOne({ sourceUrl: item.url });
        if (existingSummary) {
            // If it exists but user doesn't have it, add it to their saved summaries
            const user = await User.findById(userId);
            if (user && !user.savedSummaries.includes(existingSummary._id as mongoose.Types.ObjectId)) {
                user.savedSummaries.push(existingSummary._id as mongoose.Types.ObjectId);
                await user.save();
            }
            return { success: true, summary: existingSummary };
        }

        // Extract content from URL
        const originalContent = await extractContentFromUrl(item.url, item.sourceType);

        if (!originalContent || originalContent.length < 50) {
            logger.warn(`Insufficient content from ${item.url}`);
            return { success: false, summary: null };
        }

        // Generate summary
        const summaryText = await summarizeContent(originalContent);

        // Detect topics in the content
        const detectedTopics = await detectTopics(originalContent);

        // Create summary in database
        const newSummary = new Summary({
            userId,
            title: item.title,
            originalContent: originalContent.substring(0, 10000), // Limit size if needed
            summary: summaryText,
            sourceUrl: item.url,
            sourceType: item.sourceType,
            topics: detectedTopics,
            ratings: { helpful: 0, not_helpful: 0 }
        });

        const savedSummary = await newSummary.save();

        // Add summary to user's saved summaries
        await User.findByIdAndUpdate(
            userId,
            { $push: { savedSummaries: savedSummary._id } },
            { new: true }
        );

        return { success: true, summary: savedSummary };
    } catch (error) {
        logger.error(`Error processing content item ${item.url}:`, error);
        return { success: false, summary: null };
    }
}

/**
 * Main function to fetch and process content for a user based on their topics
 */
export async function fetchAndProcessContentForUser(userId: string): Promise<any> {
    try {
        // Get user's topics
        const user = await User.findById(userId);

        if (!user || !user.preferences.topics || user.preferences.topics.length === 0) {
            return { success: false, message: "No topics found for user" };
        }

        const maxItemsPerTopic = Math.ceil(user.preferences.maxItemsPerNewsletter / user.preferences.topics.length);

        const allProcessedItems = [];
        const failedItems = [];

        // Process each topic
        for (const topic of user.preferences.topics) {
            // Search for content on this topic
            const contentItems = await searchContentByTopic(topic, maxItemsPerTopic);

            // Process each content item
            for (const item of contentItems) {
                const result = await processContentItem(userId, item);
                if (result.success) {
                    allProcessedItems.push(result.summary);
                } else {
                    failedItems.push(item.url);
                }
            }
        }

        if (allProcessedItems.length === 0) {
            return {
                success: false,
                message: "No new content could be processed",
                failedItems
            };
        }

        return {
            success: true,
            message: `Successfully processed ${allProcessedItems.length} items`,
            summaries: allProcessedItems,
            failedItems: failedItems.length > 0 ? failedItems : undefined
        };
    } catch (error) {
        logger.error('Error in fetchAndProcessContentForUser:', error);
        return { success: false, message: "Error processing content" };
    }
}