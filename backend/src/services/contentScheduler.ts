// src/scheduler/ContentScheduler.ts
import cron from 'node-cron';
import User from '../models/User';
import Summary from '../models/Summary';
import Newsletter from '../models/Newsletter';
import { fetchAndProcessContentForUser } from './ContentFetcherService';
import { generateNewsletter } from '../services/openaiService';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Schedule content fetching and newsletter generation based on user preferences
 */
export function scheduleContentAndNewsletters() {
  // Schedule daily task (runs at 3 AM)
  cron.schedule('0 3 * * *', async () => {
    await processFrequencyGroup('daily');
  });

  // Schedule weekly task (runs at 4 AM on Mondays)
  cron.schedule('0 4 * * 1', async () => {
    await processFrequencyGroup('weekly');
  });

  // Schedule monthly task (runs at 5 AM on the 1st of each month)
  cron.schedule('0 5 1 * *', async () => {
    await processFrequencyGroup('monthly');
  });

  logger.info('Content fetching and newsletter generation scheduled successfully');
}

/**
 * Process users by frequency, fetch content, and generate newsletters
 */
async function processFrequencyGroup(frequency: string) {
  try {
    logger.info(`Processing ${frequency} content updates and newsletters...`);

    // Find all users with the given frequency preference
    const users = await User.find({
      'preferences.deliveryFrequency': frequency,
      'preferences.topics': { $exists: true, $not: { $size: 0 } }
    });

    logger.info(`Found ${users.length} users with ${frequency} frequency`);

    // Process users individually
    for (const user of users as Array<{ _id: string }>) {
      try {
        await processUserContent(user._id.toString(), frequency);
      } catch (userError) {
        logger.error(`Error processing user ${user._id}:`, userError);
      }
    }

    logger.info(`Completed ${frequency} content updates and newsletters`);
  } catch (error) {
    logger.error(`Error in processFrequencyGroup (${frequency}):`, error);
  }
}

/**
 * Process content for a single user and generate a newsletter
 */
async function processUserContent(userId: string, frequency: string) {
  try {
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`User ${userId} not found`);
      return;
    }

    logger.info(`Processing content for user ${userId} (${user.email})`);

    // Fetch and process content based on user's topics
    const contentResult = await fetchAndProcessContentForUser(userId);

    if (!contentResult.success || !contentResult.summaries || contentResult.summaries.length === 0) {
      logger.warn(`No new content found for user ${userId}: ${contentResult.message}`);
      return;
    }

    // Get the summary IDs
    const summaryIds = contentResult.summaries.map((summary: any) => summary._id);

    // Generate newsletter title based on frequency and date
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const title = `Your ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Update - ${formattedDate}`;

    // Generate newsletter content
    const summaries = await Summary.find({ _id: { $in: summaryIds } });
    const combinedContent = summaries.map(s => s.summary).join('\n\n');
    const topics = user.preferences.topics;

    // Generate newsletter content using OpenAI
    const content = await generateNewsletter(combinedContent, topics);

    // Create newsletter
    const newsletter = await Newsletter.create({
      title,
      content,
      topics,
      summaries: summaryIds,
      status: 'scheduled',
      scheduledDate: new Date(), // Schedule for immediate delivery
    });

    logger.info(`Created newsletter ${newsletter._id} for user ${userId}`);

    // Send newsletter immediately
    const sendResult = await emailService.sendNewsletterToUser(newsletter, user);

    if (sendResult) {
      logger.info(`Successfully sent newsletter to user ${userId}`);

      // Update newsletter status
      newsletter.status = 'sent';
      newsletter.sentAt = new Date();
      newsletter.sentTo = [user._id as mongoose.Types.ObjectId];
      await newsletter.save();
    } else {
      logger.error(`Failed to send newsletter to user ${userId}:`);
    }
  } catch (error) {
    logger.error(`Error processing content for user ${userId}:`, error);
  }
}

// Function to manually trigger content fetching and newsletter generation for a user
export async function triggerContentAndNewsletterForUser(userId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Get user's delivery frequency
    const frequency = user.preferences.deliveryFrequency || 'weekly';

    // Process content and generate newsletter
    await processUserContent(userId, frequency);

    return { success: true, message: "Content fetched and newsletter generated successfully" };
  } catch (error) {
    logger.error(`Error in triggerContentAndNewsletterForUser:`, error);
    return { success: false, message: "Failed to process content and generate newsletter" };
  }
}