// src/services/SummaryService.ts
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import '../utils/loadEnv';

dotenv.config();

// Initialize OpenAI client configured to use Gemini API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate a summary of the provided content
export async function summarizeContent(content: string, maxLength: string = 'medium'): Promise<string> {
  try {
    // Define summary length in tokens based on preference
    const maxTokens = {
      'short': 150,
      'medium': 300,
      'long': 500
    }[maxLength] || 300;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that creates concise summaries of content. 
                   Summarize the provided content in approximately ${maxTokens} tokens. 
                   Focus on the key points, main arguments, and important details.`
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.3
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error in summarizeContent:', error);
    throw new Error('Failed to summarize content');
  }
}


export async function detectTopics(content: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that analyzes content and identifies the key topics.
                   Return exactly 3-5 topic tags as a JSON array of strings. The topics should be
                   single words or short phrases.`
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });

    const responseText = completion.choices[0].message.content?.trim() || '';

    // Extract JSON array from response
    const match = responseText.match(/\[.*?\]/s);
    if (match) {
      return JSON.parse(match[0]);
    }

    return [];
  } catch (error) {
    console.error('Error in detectTopics:', error);
    return [];
  }
}