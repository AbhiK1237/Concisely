import { YoutubeTranscript } from 'youtube-transcript';
const TranscriptAPI: any = require('youtube-transcript-api');
import axios from 'axios';

// Function to extract video ID from YouTube URL
export const getVideoId = (url: string): string => {
  if (!url || typeof url !== 'string') {
    throw new Error(`Invalid YouTube URL: ${url}`);
  }

  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);

  if (!match || !match[7] || match[7].length !== 11) {
    throw new Error(`Unable to extract video ID from URL: ${url}`);
  }

  return match[7];
};

// Get video info using YouTube oEmbed API
export const getVideoInfo = async (videoUrl: string) => {
  try {
    const videoId = getVideoId(videoUrl);

    // Get basic info via oEmbed
    const oembedResponse = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);

    return {
      id: videoId,
      title: oembedResponse.data.title,
      author: oembedResponse.data.author_name,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw new Error('Failed to get video information');
  }
};

// Get transcript using youtube-transcript library
export const getTranscript = async (videoUrl: string,): Promise<Array<{ text: string, duration: number, offset: number }>> => {
  try {
    const videoId = getVideoId(videoUrl);
    console.log('Fetching transcript for video ID:', videoId); // Debug log

    const transcript = await TranscriptAPI.getTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }

    console.log('Transcript fetched successfully, segments:', transcript.length); // Debug log
    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to get video transcript: ${error.message}`);
    } else {
      throw new Error('Failed to get video transcript: Unknown error');
    }
  }
};

// Get transcript as plain text
export const getTranscriptText = async (videoUrl: string): Promise<string> => {
  try {
    const transcript = await getTranscript(videoUrl);
    const text = transcript.map(item => item.text).join(' ');

    if (!text) {
      throw new Error('Transcript is empty');
    }

    console.log('Transcript text length:', text.length); // Debug log
    return text;
  } catch (error) {
    console.error('Error fetching transcript text:', error);

    if (error instanceof Error) {
      throw error; // Pass through the detailed error from getTranscript
    } else {
      throw new Error('Failed to get video transcript text');
    }
  }
};