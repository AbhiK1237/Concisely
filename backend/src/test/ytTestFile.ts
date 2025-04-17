import { getVideoInfo, getTranscript, getTranscriptText } from '../services/youtubeService';

async function test() {
  try {
    // Use a public YouTube video URL
    const videoUrl = 'https://www.youtube.com/watch?v=-P1qZo0plEg';
    
    // Test getVideoInfo
    const info = await getVideoInfo(videoUrl);
    console.log('Video Info:', info);
    
    // Test getTranscript
    const transcript = await getTranscript(videoUrl);
    console.log('Transcript (first 2 entries):', transcript.slice(0, 2));
    
    // Test getTranscriptText
    const transcriptText = await getTranscriptText(videoUrl);
    console.log('Transcript text (first 100 chars):', transcriptText.substring(0, 100));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();