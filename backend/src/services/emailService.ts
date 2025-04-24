//emailservice.ts

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import Newsletter from '../models/Newsletter';
import User from '../models/User';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Import a markdown converter library - you'll need to install this
import showdown from 'showdown';

dotenv.config();

// Initialize markdown converter with specific extensions
const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
    literalMidWordAsterisks: true, // Handle asterisks within words
    parseImgDimensions: true,
    simpleLineBreaks: true // Convert \n to <br>
});

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify connection configuration
transporter.verify((error) => {
    if (error) {
        logger.error('Email service error:', error);
    } else {
        logger.info('Email service is ready to send messages');
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

// Helper function to send emails
const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        const mailOptions = {
            from: options.from || process.env.EMAIL_FROM || 'noreply@yourdomain.com',
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error(`Error sending email: ${error}`);
        return false;
    }
};

// Pre-process LLM-generated content to fix common issues
const preprocessLLMContent = (content: string): string => {
    // Ensure \n is properly handled for line breaks
    let processed = content.replace(/\\n/g, '\n');

    // Handle standalone asterisks that aren't intended for markdown
    processed = processed.replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>');

    // Fix any inconsistent whitespace
    processed = processed.replace(/\n\s+\n/g, '\n\n');

    return processed;
};

// Format newsletter content into HTML email
const formatNewsletterEmail = (newsletter: any): string => {
    // Pre-process and convert markdown content to HTML
    const preprocessed = preprocessLLMContent(newsletter.content);
    const htmlContent = converter.makeHtml(preprocessed);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${newsletter.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #444;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        h2 {
          color: #555;
          margin-top: 25px;
        }
        h3 {
          color: #666;
        }
        .topics {
          margin-bottom: 15px;
          color: #666;
          font-style: italic;
        }
        .content {
          margin-top: 20px;
        }
        .content ul, .content ol {
          margin-left: 20px;
          padding-left: 15px;
        }
        .content li {
          margin-bottom: 5px;
        }
        .content hr {
          border: 0;
          height: 1px;
          background: #ddd;
          margin: 25px 0;
        }
        .content blockquote {
          border-left: 3px solid #ddd;
          padding-left: 10px;
          color: #666;
          margin-left: 0;
        }
        .content strong, .content b {
          font-weight: bold;
        }
        .content em, .content i {
          font-style: italic;
        }
        .content p {
          margin: 15px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <h1>${newsletter.title}</h1>
      <div class="topics">Topics: ${newsletter.topics.join(', ')}</div>
      <div class="content">
        ${htmlContent}
      </div>
      <div class="footer">
        <p>You received this newsletter because you subscribed to these topics.</p>
        <p><a href="{{unsubscribe_link}}">Unsubscribe</a> | <a href="{{preferences_link}}">Update preferences</a></p>
      </div>
    </body>
    </html>
  `;
};

// Send a newsletter to a specific user
const sendNewsletterToUser = async (
    user: any,
    newsletter: any
): Promise<boolean> => {
    try {
        const emailHtml = formatNewsletterEmail(newsletter);

        // Replace placeholder links with actual unsubscribe/preferences URLs
        const personalizedHtml = emailHtml
            .replace('{{unsubscribe_link}}', `${process.env.APP_URL}/unsubscribe/${user._id}`)
            .replace('{{preferences_link}}', `${process.env.APP_URL}/preferences/${user._id}`);

        const emailOptions = {
            to: user.email,
            subject: newsletter.title,
            html: personalizedHtml,
        };

        return await sendEmail(emailOptions);
    } catch (error) {
        logger.error(`Error sending newsletter to user ${user._id}: ${error}`);
        return false;
    }
};

// Send a newsletter to multiple users
const sendNewsletter = async (
    newsletterId: string
): Promise<{ success: boolean; sentCount: number; failedCount: number }> => {
    try {
        const newsletter = await Newsletter.findById(newsletterId);

        if (!newsletter) {
            logger.error(`Newsletter not found: ${newsletterId}`);
            return { success: false, sentCount: 0, failedCount: 0 };
        }

        // Find users with matching preferences
        const users = await User.find({
            'preferences.topics': { $in: newsletter.topics },
        });

        if (users.length === 0) {
            logger.warn(`No users found for newsletter: ${newsletterId}`);
            return { success: false, sentCount: 0, failedCount: 0 };
        }

        let sentCount = 0;
        let failedCount = 0;

        // Send emails to each user
        for (const user of users) {
            const success = await sendNewsletterToUser(user, newsletter);
            if (success) {
                sentCount++;
            } else {
                failedCount++;
            }
        }

        // Update the newsletter in the database
        newsletter.sentTo = users.map(user => user._id as mongoose.Types.ObjectId);
        newsletter.sentAt = new Date();
        newsletter.status = sentCount > 0 ? 'sent' : 'failed';
        await newsletter.save();

        logger.info(`Newsletter ${newsletterId} sent to ${sentCount} users (${failedCount} failed)`);

        return {
            success: sentCount > 0,
            sentCount,
            failedCount
        };
    } catch (error) {
        logger.error(`Error sending newsletter ${newsletterId}: ${error}`);
        return { success: false, sentCount: 0, failedCount: 0 };
    }
};

// Test email connection
const testConnection = async (): Promise<boolean> => {
    try {
        await transporter.verify();
        return true;
    } catch (error) {
        logger.error(`Email connection test failed: ${error}`);
        return false;
    }
};

export const emailService = {
    sendEmail,
    sendNewsletter,
    testConnection,
};