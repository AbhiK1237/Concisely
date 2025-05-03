import axios from 'axios';
import showdown from 'showdown';

const API_URL = 'http://localhost:5001/api';

// Initialize markdown converter with similar settings to the backend
const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
    literalMidWordAsterisks: true,
    parseImgDimensions: true,
    simpleLineBreaks: true
});

interface Newsletter {
    _id: string;
    title: string;
    content: string;
    topics: string[];
    summaries: string[];
    status: string;
    scheduledDate: string;
    sentAt?: string;
}

// Pre-process content similar to backend emailService
const preprocessContent = (content: string): string => {
    // Ensure \n is properly handled for line breaks
    let processed = content.replace(/\\n/g, '\n');

    // Handle standalone asterisks that aren't intended for markdown
    processed = processed.replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>');

    // Fix any inconsistent whitespace
    processed = processed.replace(/\n\s+\n/g, '\n\n');

    return processed;
};

export const newsletterDisplayService = {
    // Fetch the latest newsletter
    async getLatestNewsletter(token: string): Promise<Newsletter | null> {
        try {
            const response = await axios.get(`${API_URL}/newsletters/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch latest newsletter:', error);
            return null;
        }
    },

    // Fetch a specific newsletter by ID
    async getNewsletterById(newsletterId: string, token: string): Promise<Newsletter | null> {
        try {
            const response = await axios.get(`${API_URL}/newsletters/${newsletterId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data.data;
        } catch (error) {
            console.error(`Failed to fetch newsletter ${newsletterId}:`, error);
            return null;
        }
    },

    // Convert newsletter markdown content to HTML
    formatNewsletterContent(newsletter: Newsletter): string {
        if (!newsletter || !newsletter.content) return '';

        // Preprocess the content similar to the backend
        const preprocessed = preprocessContent(newsletter.content);

        // Convert to HTML
        return converter.makeHtml(preprocessed);
    },

    // Generate a preview version of the newsletter (shorter)
    generatePreview(newsletter: Newsletter): string {
        if (!newsletter || !newsletter.content) return '';

        // Get first few paragraphs
        const paragraphs = newsletter.content.split('\n\n');
        const previewParagraphs = paragraphs.slice(0, 3);

        // Add ellipsis if there's more content
        if (paragraphs.length > 3) {
            previewParagraphs.push('...');
        }

        return previewParagraphs.join('\n\n');
    }
};
