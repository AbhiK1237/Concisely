import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';

// Function to extract video ID from YouTube URL
export const getVideoId = (url: string): string => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : url;
};

// Get video info using YouTube oEmbed API (more reliable than ytdl-core)
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
      // Note: oEmbed doesn't provide duration, would need another API for that
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw new Error('Failed to get video information');
  }
};

// Get transcript using youtube-transcript library
export const getTranscript = async (videoUrl: string): Promise<Array<{text: string, duration: number, offset: number}>> => {
  try {
    const videoId = getVideoId(videoUrl);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error('Failed to get video transcript');
  }
};

// Get transcript as plain text
export const getTranscriptText = async (videoUrl: string): Promise<string> => {
  try {
    const transcript = await getTranscript(videoUrl);
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript text:', error);
    throw new Error('Failed to get video transcript text');
  }
};