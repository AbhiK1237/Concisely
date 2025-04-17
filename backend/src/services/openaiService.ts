import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateSummary = async (
  content: string,
  type: string,
  length: string = 'medium'
): Promise<string> => {
  try {
    let prompt: string;
    let contentLength: number;
    
    switch (length) {
      case 'short':
        contentLength = 150;
        break;
      case 'long':
        contentLength = 500;
        break;
      default: // medium
        contentLength = 300;
        break;
    }
    
    switch (type) {
      case 'youtube':
        prompt = `Summarize this YouTube video transcript in approximately ${contentLength} words:\n\n${content}`;
        break;
      case 'podcast':
        prompt = `Summarize this podcast transcript in approximately ${contentLength} words:\n\n${content}`;
        break;
      case 'document':
        prompt = `Summarize this document in approximately ${contentLength} words:\n\n${content}`;
        break;
      default: // article
        prompt = `Summarize this article in approximately ${contentLength} words:\n\n${content}`;
        break;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
};

export const extractTopics = async (content: string): Promise<string[]> => {
  try {
    const prompt = `Extract 2-5 main topics or categories from the following content. Return only a comma-separated list of topics, with no additional text:\n\n${content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const topicsString = completion.choices[0].message.content || '';
    return topicsString.split(',').map(topic => topic.trim());
  } catch (error) {
    console.error('Error extracting topics:', error);
    throw new Error('Failed to extract topics');
  }
};