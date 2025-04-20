import cron from 'node-cron';
import Newsletter from '../models/Newsletter';
import { logger } from '../utils/logger';
import { emailService } from './emailService';

export const initScheduler = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            logger.info('Checking for newsletters to send...');

            const now = new Date();

            // Find newsletters that are scheduled and due to be sent
            const newslettersToSend = await Newsletter.find({
                status: 'scheduled',
                scheduledDate: { $lte: now }
            });

            logger.info(`Found ${newslettersToSend.length} newsletters to send`);

            for (const newsletter of newslettersToSend) {
                try {
                    // Ensure newsletter has the correct type
                    const newsletterId = (newsletter._id as string);
                    
                    // Use the email service to send the newsletter
                    const result = await emailService.sendNewsletter(newsletterId);

                    logger.info(`Newsletter ${newsletter._id} sending result:`, result);

                    if (!result.success) {
                        logger.warn(`Failed to send newsletter ${newsletter._id}`);
                    }
                } catch (error) {
                    logger.error(`Error processing newsletter ${newsletter._id}: ${error}`);
                    newsletter.status = 'failed';
                    await newsletter.save();
                }
            }
        } catch (error) {
            logger.error(`Scheduler error: ${error}`);
        }
    });

    logger.info('Newsletter scheduler initialized');
};

// Add a function to manually trigger sending of a specific newsletter
export const triggerNewsletterSend = async (newsletterId: string) => {
    try {
        const newsletter = await Newsletter.findById(newsletterId);

        if (!newsletter) {
            logger.error(`Newsletter not found: ${newsletterId}`);
            throw new Error('Newsletter not found');
        }

        const result = await emailService.sendNewsletter(newsletterId);
        return result;
    } catch (error) {
        logger.error(`Error triggering newsletter send: ${error}`);
        throw error;
    }
};

export const newsletterScheduler = {
    initScheduler,
    triggerNewsletterSend
};