import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import '../utils/loadEnv';

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
        contentLength = 200;
        break;
      case 'long':
        contentLength = 700;
        break;
      default: // medium
        contentLength = 400;
        break;
    }

    switch (type) {
      case 'youtube':
        prompt = `You're a helpful Teaching/explainer assistant.your job is to analyse the transcript,find out what kind of topic it is and Summarize the following YouTube video transcript in about ${contentLength} words.If the transcript is in some other langugage than english, make sure you understand it properly and give the response in english. Make the summary simple, clear, and easy for anyone to understand while covering all the points.If there are any formulas important rules,techiques make sure you cover them all. Focus on the main points, explain technical terms if any, and write in a friendly, engaging tone.\n\nTranscript:\n${content}`;
        break;
      case 'podcast':
        prompt = `Act as a friendly and concise assistant. Summarize this podcast transcript in around ${contentLength} words. Make the explanation easy to follow, simplify complex ideas, and ensure a natural, conversational tone that matches the style of a podcast listener summary.\n\nTranscript:\n${content}`;
        break;
      case 'document':
        prompt = `Please summarize this document clearly and simply in approximately ${contentLength} words. Ensure the key ideas are captured and explained in an easy-to-understand manner. Use a professional but accessible tone, avoiding jargon unless necessary, and provide a friendly summary suitable for someone unfamiliar with the content.\n\nDocument:\n${content}`;
        break;
      default: // article
        prompt = `Summarize the following article in around ${contentLength} words. Make it easy to read, friendly in tone, and highlight the key takeaways in a way that's engaging and approachable for a general audience. Avoid complex terms unless you explain them.\n\nArticle:\n${content}`;
        break;
    }


    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: "You are a transcript summarizer assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,  // Controls randomness: lower is more deterministic
      // max_tokens: 500
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
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const topicsString = completion.choices[0].message.content || '';
    return topicsString.split(',').map(topic => topic.trim());
  } catch (error) {
    console.error('Error extracting topics:', error);
    throw new Error('Failed to extract topics');
  }
};
export const generateNewsletter = async (
  combinedContent: string,
  topics: string[]
): Promise<string> => {
  try {
    const topicsText = topics.join(", ");
    const prompt = `Create a well-structured newsletter based on the following summaries. The newsletter should focus on these topics: ${topicsText}.\n\nContent to include:\n${combinedContent}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // or whichever model you prefer to be consistent
      messages: [
        { role: "system", content: "You are a professional newsletter editor." },
        { role: "user", content: prompt }
      ],
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating newsletter:', error);
    throw new Error('Failed to generate newsletter');
  }
};

