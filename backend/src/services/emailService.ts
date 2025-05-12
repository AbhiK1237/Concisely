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

  // Generate topic badges HTML
  const topicBadges = newsletter.topics.map((topic: string, index: number) => {
    // Create a different color for each badge based on index
    const colors = [
      { bg: '#f0ebfe', text: '#7c3aed', border: '#d8b4fe' }, // purple
      { bg: '#e1f0ff', text: '#3b82f6', border: '#bfdbfe' }, // blue
      { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' }, // indigo
      { bg: '#fce7f3', text: '#db2777', border: '#fbcfe8' }, // pink
      { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' }  // green/teal
    ];
    const colorIndex = index % colors.length;
    const color = colors[colorIndex];

    return `<span style="display: inline-block; padding: 4px 12px; margin: 0 6px 6px 0; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border};">${topic}</span>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${newsletter.title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 100%;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        
        .wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
        }
        
        .container {
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          margin: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        
        .header {
          background: linear-gradient(to right, #f5f3ff, #ede9fe, #faf5ff);
          padding: 30px 30px 25px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .title {
          color: #4f46e5;
          font-weight: 700;
          font-size: 24px;
          margin: 0 0 16px 0;
        }
        
        .topics {
          margin-bottom: 10px;
        }
        
        .topics-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .content-wrapper {
          padding: 30px;
          background-color: #ffffff;
        }
        
        .content h2 {
          color: #4f46e5;
          font-weight: 600;
          font-size: 20px;
          margin-top: 28px;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .content h3 {
          color: #7c3aed;
          font-weight: 600;
          font-size: 18px;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        
        .content ul, .content ol {
          margin-left: 10px;
          padding-left: 15px;
        }
        
        .content li {
          margin-bottom: 8px;
        }
        
        .content hr {
          border: 0;
          height: 1px;
          background: #e5e7eb;
          margin: 25px 0;
        }
        
        .content blockquote {
          border-left: 3px solid #8b5cf6;
          padding: 12px 20px;
          background-color: #f5f3ff;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
          color: #6b7280;
        }
        
        .content strong, .content b {
          font-weight: 600;
        }
        
        .content em, .content i {
          font-style: italic;
        }
        
        .content p {
          margin: 16px 0;
          color: #4b5563;
        }
        
        .content a {
          color: #6366f1;
          text-decoration: none;
          border-bottom: 1px solid #c7d2fe;
          padding-bottom: 1px;
          transition: border-color 0.2s ease;
        }
        
        .content a:hover {
          border-color: #6366f1;
        }
        
        .footer {
          background: linear-gradient(to right, #eef2ff, #ede9fe, #faf5ff);
          padding: 25px 30px;
          font-size: 13px;
          color: #6b7280;
          border-top: 1px solid #f3f4f6;
          text-align: center;
        }
        
        .footer p {
          margin: 8px 0;
        }
        
        .footer a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }
        
        .button {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(to right, #8b5cf6, #6366f1);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          margin-top: 8px;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
        }
        
        @media only screen and (max-width: 600px) {
          .header, .content-wrapper, .footer {
            padding: 20px;
          }
          
          .container {
            margin: 10px;
            border-radius: 12px;
          }
          
          .title {
            font-size: 22px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 class="title">${newsletter.title}</h1>
            <div class="topics">
              <span class="topics-label">Topics:</span>
              <div>${topicBadges}</div>
            </div>
          </div>
          
          <div class="content-wrapper">
            <div class="content">
              ${htmlContent}
            </div>
          </div>
          
          <div class="footer">
            <p>You received this newsletter because you subscribed to these topics.</p>
            <p>
              <a href="{{unsubscribe_link}}">Unsubscribe</a> &nbsp;•&nbsp; 
              <a href="{{preferences_link}}">Update preferences</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Concisely</p>
          </div>
        </div>
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
  sendNewsletterToUser,
  sendEmail,
  sendNewsletter,
  testConnection,
};