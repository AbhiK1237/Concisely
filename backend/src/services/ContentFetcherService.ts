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
 * Fetches relevant web articles using Google Custom Search API
 * Prioritizes relevance over recency
 */
export async function fetchLatestArticles(topic: string, maxResults: number = 5): Promise<ContentItem[]> {
    try {
        // Request more results than needed to account for filtering out duplicates
        const requestedResults = Math.min(maxResults * 2, 10); // API limit is 10

        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_SEARCH_ENGINE_ID,
                q: topic,
                num: requestedResults,
                // Removed dateRestrict and sort parameters to prioritize relevance
            },
        });

        if (!response.data.items || response.data.items.length === 0) {
            logger.info(`No results found for topic: ${topic}`);
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
        logger.error(`Error fetching articles for topic "${topic}":`, error);
        return [];
    }
}

/**
 * Fetches relevant YouTube videos based on a topic
 * Prioritizes relevance over recency
 */
export async function fetchLatestVideos(topic: string, maxResults: number = 5): Promise<ContentItem[]> {
    try {
        // Request more results than needed to account for filtering out duplicates
        const requestedResults = Math.min(maxResults * 2, 10); // API limit is usually 50, but we'll use 10

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: YOUTUBE_API_KEY,
                q: topic,
                part: 'snippet',
                type: 'video',
                order: 'relevance', // Changed from 'date' to 'relevance'
                maxResults: requestedResults,
                // Removed publishedAfter to avoid time restriction
            },
        });

        if (!response.data.items || response.data.items.length === 0) {
            logger.info(`No YouTube videos found for topic: ${topic}`);
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
        logger.error(`Error fetching YouTube videos for topic "${topic}":`, error);
        return [];
    }
}

/**
 * Combines and sorts results from both article and video searches
 * Ensures a balance between different content types
 */
export async function searchContentByTopic(topic: string, maxResults: number = 3): Promise<ContentItem[]> {
    const [articles, videos] = await Promise.all([
        fetchLatestArticles(topic, maxResults),
        fetchLatestVideos(topic, maxResults),
    ]);

    logger.info(`Found ${articles.length} articles and ${videos.length} videos for topic "${topic}"`);

    // Ensure balance between content types
    const result: ContentItem[] = [];

    // Calculate how many of each type to include
    const halfMax = Math.ceil(maxResults / 2);

    // Take up to half the results from articles
    if (articles.length > 0) {
        result.push(...articles.slice(0, halfMax));
    }

    // Take up to half the results from videos
    if (videos.length > 0) {
        result.push(...videos.slice(0, halfMax));
    }

    // If we don't have enough items, fill with whatever is available
    if (result.length < maxResults) {
        const remainingArticles = articles.slice(halfMax);
        const remainingVideos = videos.slice(halfMax);
        const remaining = [...remainingArticles, ...remainingVideos];

        // Sort remaining by date and add enough to reach maxResults
        remaining.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        result.push(...remaining.slice(0, maxResults - result.length));
    }

    // Final sort by date if needed
    result.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return result.slice(0, maxResults);
}

/**
 * Get previously processed URLs for a user
 */
async function getPreviouslyProcessedUrls(userId: string): Promise<string[]> {
    try {
        // Find all summaries that belong to this user
        const summaries = await Summary.find(
            { userId: userId },
            { sourceUrl: 1, _id: 0 }
        );

        // Extract just the URLs
        return summaries.map(summary => summary.sourceUrl);
    } catch (error) {
        logger.error(`Error getting previously processed URLs for user ${userId}:`, error);
        return [];
    }
}

/**
 * Filter out content items that have already been processed for this user
 */
async function filterNewContent(
    userId: string,
    contentItems: ContentItem[],
    maxItems: number
): Promise<ContentItem[]> {
    try {
        const processedUrls = await getPreviouslyProcessedUrls(userId);

        // Filter out items that have already been processed
        const newItems = contentItems.filter(item => !processedUrls.includes(item.url));

        logger.info(`Found ${newItems.length} new items out of ${contentItems.length} total items for user ${userId}`);

        // Return up to maxItems
        return newItems.slice(0, maxItems);
    } catch (error) {
        logger.error(`Error filtering new content for user ${userId}:`, error);
        return contentItems.slice(0, maxItems); // Fallback to original behavior
    }
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
        // Check if we already have a summary for this URL and user
        const existingSummary = await Summary.findOne({
            sourceUrl: item.url,
            userId: userId
        });

        if (existingSummary) {
            logger.info(`Summary for ${item.url} already exists for user ${userId}`);
            return { success: true, summary: existingSummary };
        }

        // Check if the summary exists for another user
        const otherUserSummary = await Summary.findOne({ sourceUrl: item.url });
        if (otherUserSummary) {
            // Create a copy for this user
            const newSummary = new Summary({
                userId,
                title: otherUserSummary.title,
                originalContent: otherUserSummary.originalContent,
                summary: otherUserSummary.summary,
                sourceUrl: otherUserSummary.sourceUrl,
                sourceType: otherUserSummary.sourceType,
                topics: otherUserSummary.topics,
                ratings: { helpful: 0, not_helpful: 0 }
            });

            const savedSummary = await newSummary.save();

            // Add to user's saved summaries
            await User.findByIdAndUpdate(
                userId,
                { $push: { savedSummaries: savedSummary._id } },
                { new: true }
            );

            return { success: true, summary: savedSummary };
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
        const requestItemsPerTopic = maxItemsPerTopic * 2; // Request more to ensure we have enough new content

        const allProcessedItems = [];
        const failedItems = [];

        // Process each topic
        for (const topic of user.preferences.topics) {
            // Search for content on this topic
            const contentItems = await searchContentByTopic(topic, requestItemsPerTopic);

            // Filter out content that's already been processed for this user
            const newContentItems = await filterNewContent(userId, contentItems, maxItemsPerTopic);

            if (newContentItems.length === 0) {
                logger.info(`No new content found for topic "${topic}"`);
                continue;
            }

            // Process each content item
            for (const item of newContentItems) {
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
                message: "No new content found to process. Try again later or add more topics of interest.",
                failedItems
            };
        }

        return {
            success: true,
            message: `Successfully processed ${allProcessedItems.length} new items`,
            summaries: allProcessedItems,
            failedItems: failedItems.length > 0 ? failedItems : undefined
        };
    } catch (error) {
        logger.error('Error in fetchAndProcessContentForUser:', error);
        return { success: false, message: "Error processing content" };
    }
}