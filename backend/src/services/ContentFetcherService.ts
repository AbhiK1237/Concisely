// src/services/ContentFetcherService.ts
import axios from 'axios';
import Summary from '../models/Summary';
import User from '../models/User';
import { summarizeContent, detectTopics } from './SummaryService';
import { logger } from '../utils/logger';
import { getTranscriptText } from './youtubeService';
import { scrapeArticle } from './websiteService';
import { OpenAI } from 'openai';
import { BraveMCPClient } from './BraveMCPClient';

// Configure with your API keys in environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;


export interface ContentItem {
    title: string;
    url: string;
    snippet: string;
    publishedAt: string;
    sourceType: 'article' | 'youtube' | 'podcast' | 'document';
}
// Initialize OpenAI client configured to use GPT-4o mini
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize BraveMCPClient
let braveMCPClient: BraveMCPClient | null = null;

/**
 * Initialize the Brave MCP client (call this during app startup)
 */
export async function initializeBraveMCPClient() {
    try {
        braveMCPClient = new BraveMCPClient();
        // Connect to the TypeScript Brave MCP server
        await braveMCPClient.connectToServer(process.env.BRAVE_MCP_SERVER_PATH || "./braveMcp/dist/index.js");
        logger.info('Brave MCP Client initialized successfully');
        return true;
    } catch (error) {
        logger.error('Failed to initialize Brave MCP Client:', error);
        return false;
    }
}

export interface ContentItem {
    title: string;
    url: string;
    snippet: string;
    publishedAt: string;
    sourceType: 'article' | 'youtube' | 'podcast' | 'document';
}

// Time interval mapping (in days)
const frequencyIntervals: { [key: string]: number } = {
    'daily': 1,
    'weekly': 7,
    'biweekly': 14,
    'monthly': 30
};

/**
 * Generates multiple search queries for a given topic using GPT-4o mini
 */
async function generateTopicQueries(topic: string): Promise<string[]> {
    try {
        const prompt = `You are a search query generator. For the topic "${topic}", generate 3 different search queries that would help find recent, relevant information. 
            Each query should be specific enough to find distinct aspects of the topic.
            Return only the search queries as a JSON array with no additional text.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-nano", // Use GPT-4o mini
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) return [topic];

        const parsedResponse = JSON.parse(responseText);
        return Array.isArray(parsedResponse.queries) ?
            parsedResponse.queries :
            [topic];
    } catch (error) {
        logger.error(`Error generating queries for topic "${topic}":`, error);
        return [topic]; // Fallback to just using the topic itself
    }
}

/**
 * Filter search results using GPT-4o mini to remove irrelevant or outdated content
 */
async function filterResultsWithAI(items: ContentItem[], topic: string, frequency: string): Promise<ContentItem[]> {
    try {
        if (items.length === 0) return [];

        // Create a JSON string of the items with relevant fields
        const itemsJson = JSON.stringify(items.map(item => ({
            title: item.title,
            snippet: item.snippet,
            publishedAt: item.publishedAt,
            url: item.url,
            sourceType: item.sourceType
        })));

        const prompt = `You are a content curator for the topic "${topic}". 
            Review the following search results and identify which ones are:
            1. Actually relevant to the topic "${topic}"
            2. Contain fresh information (published within the last ${frequencyIntervals[frequency] || 7} days if date is available)
            3. Not duplicative of other results

            Content items: ${itemsJson}

            Return a JSON array of indices (0-based) of items that meet ALL these criteria, with no additional text.
            Example: {"selected_indices": [0, 2, 5]}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-nano", // Use GPT-4o mini
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) return items;

        const parsedResponse = JSON.parse(responseText);
        const selectedIndices = parsedResponse.selected_indices || [];

        if (!Array.isArray(selectedIndices) || selectedIndices.length === 0) {
            return items; // If no selection or error, return all items
        }

        // Filter to only include selected items
        return selectedIndices
            .filter(index => index >= 0 && index < items.length)
            .map(index => items[index]);

    } catch (error) {
        logger.error(`Error filtering results with AI for topic "${topic}":`, error);
        return items; // Return original items if filtering fails
    }
}

/**
 * Parses Brave search results into ContentItem format
 */
/**
 * Parses Brave search results into ContentItem format
 */
function parseBraveSearchResults(rawResults: string): ContentItem[] {
    try {
        // The results appear to be in a structured format with numbered items
        const items: ContentItem[] = [];

        // Regular expression to match numbered items with links and descriptions
        const itemRegex = /\d+\.\s+\*\*\[(.*?)\]\((https?:\/\/[^\s\)]+)\)\*\*\s+-?\s*(.*?)(?=\n\d+\.|\n\n|$)/gs;

        let match;
        while ((match = itemRegex.exec(rawResults)) !== null) {
            const title = match[1]?.trim() || '';
            const url = match[2]?.trim() || '';
            const snippet = match[3]?.trim() || '';

            if (url && title) {
                items.push({
                    title,
                    url,
                    snippet,
                    publishedAt: new Date().toISOString(),
                    sourceType: 'article' as 'article'
                });
            }
        }

        logger.info(`Successfully parsed ${items.length} items from Brave search results`);
        return items;
    } catch (error) {
        logger.error('Error parsing Brave search results:', error);
        return [];
    }
}
/**
 * Fetches relevant web articles using Brave Search MCP
 */
export async function fetchLatestArticles(topic: string, maxResults: number = 5, frequency: string = 'weekly'): Promise<ContentItem[]> {
    try {
        if (!braveMCPClient) {
            logger.error('Brave MCP Client not initialized');
            return [];
        }

        // Generate multiple search queries
        const searchQueries = await generateTopicQueries(topic);
        let allResults: ContentItem[] = [];

        // Request more results than needed to account for filtering
        const requestedResults = Math.min(maxResults * 3, 20); // Requesting more for better filtering

        // Execute each search query using Brave MCP
        for (const query of searchQueries) {
            try {
                // Add time period to the query based on frequency
                const daysInterval = frequencyIntervals[frequency] || 7;
                const timeQuery = `${query} after:${daysInterval}d`;

                // Use the Brave web search tool through MCP
                const searchResults = await braveMCPClient.processQuery(
                    `Search for recent articles about "${timeQuery}"`,
                );

                // Parse the results into ContentItem format
                const items = parseBraveSearchResults(searchResults);
                allResults = [...allResults, ...items];
            } catch (error) {
                logger.error(`Error executing Brave search for query "${query}":`, error);
            }
        }
        logger.info(`Fetched ${allResults.length} articles for topic "${topic}"`);
        // If we have enough results, filter with AI
        if (allResults.length > 0) {
            allResults = await filterResultsWithAI(allResults, topic, frequency);
        }

        logger.info(`Fetched ${allResults.length} filtered articles for topic "${topic}" with frequency ${frequency}`);

        // Return top results after filtering
        return allResults.slice(0, maxResults);
    } catch (error) {
        logger.error(`Error fetching articles for topic "${topic}":`, error);
        return [];
    }
}

/**
 * Fetches relevant YouTube videos based on a topic
 * Uses GPT-4o mini for query generation and filtering
 */
export async function fetchLatestVideos(topic: string, maxResults: number = 5, frequency: string = 'weekly'): Promise<ContentItem[]> {
    try {
        // Determine time range based on frequency
        const daysInterval = frequencyIntervals[frequency] || 7;

        // Calculate the publishedAfter date
        const publishedAfter = new Date();
        publishedAfter.setDate(publishedAfter.getDate() - daysInterval);
        const publishedAfterIso = publishedAfter.toISOString();

        // Request more results than needed for filtering
        const requestedResults = Math.min(maxResults * 3, 10);

        // Generate multiple search queries
        const searchQueries = await generateTopicQueries(topic);
        let allResults: ContentItem[] = [];

        // Execute each search query
        for (const query of searchQueries) {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: YOUTUBE_API_KEY,
                    q: query,
                    part: 'snippet',
                    type: 'video',
                    order: 'date', // Focus on recent videos
                    publishedAfter: publishedAfterIso,
                    maxResults: requestedResults,
                },
            });

            if (response.data.items && response.data.items.length > 0) {
                const videoItems = response.data.items.map((item: any) => ({
                    title: item.snippet.title,
                    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    snippet: item.snippet.description,
                    publishedAt: item.snippet.publishedAt,
                    sourceType: 'youtube',
                }));

                allResults = [...allResults, ...videoItems];
            }
        }

        // If we have enough results, filter with AI
        if (allResults.length > 0) {
            allResults = await filterResultsWithAI(allResults, topic, frequency);
        }

        logger.info(`Fetched ${allResults.length} filtered videos for topic "${topic}" with frequency ${frequency}`);

        // Return top results after filtering
        return allResults.slice(0, maxResults);
    } catch (error) {
        logger.error(`Error fetching YouTube videos for topic "${topic}":`, error);
        return [];
    }
}

/**
 * Combines and sorts results from both article and video searches
 * Ensures a balance between different content types
 */
export async function searchContentByTopic(topic: string, maxResults: number = 3, frequency: string = 'weekly'): Promise<ContentItem[]> {
    const [articles, videos] = await Promise.all([
        fetchLatestArticles(topic, maxResults, frequency),
        fetchLatestVideos(topic, maxResults, frequency),
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
        // Get user's topics and frequency preference
        const user = await User.findById(userId);

        if (!user || !user.preferences.topics || user.preferences.topics.length === 0) {
            return { success: false, message: "No topics found for user" };
        }

        // Get user's frequency preference (default to weekly)
        const frequency = user.preferences.deliveryFrequency || 'weekly';

        const maxItemsPerTopic = Math.ceil(user.preferences.maxItemsPerNewsletter / user.preferences.topics.length);
        const requestItemsPerTopic = maxItemsPerTopic * 2; // Request more to ensure we have enough new content

        const allProcessedItems = [];
        const failedItems = [];

        // Process each topic
        for (const topic of user.preferences.topics) {
            // Search for content on this topic - pass the user's frequency preference
            const contentItems = await searchContentByTopic(topic, requestItemsPerTopic, frequency);

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

/**
 * Shutdown function to clean up resources (call this during app shutdown)
 */
export async function shutdownBraveMCPClient() {
    if (braveMCPClient) {
        try {
            await braveMCPClient.cleanup();
            braveMCPClient = null;
            logger.info('Brave MCP Client shutdown complete');
        } catch (error) {
            logger.error('Error during Brave MCP Client shutdown:', error);
        }
    }
}

