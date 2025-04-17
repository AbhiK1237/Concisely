import { scrapeArticle } from '../services/websiteService';

// Test function
async function testScraper() {
  try {
    // Test with a few different websites
    const urls = [
      "https://www.scraperapi.com/blog/cheerio-vs-puppeteer/",
      'https://www.philschmid.de/mcp-introduction',
      // Add other test URLs here
    ];
    
    for (const url of urls) {
      console.log(`\nTesting scraper on: ${url}`);
      console.time('Scrape time');
      
      const result = await scrapeArticle(url);
      
      console.timeEnd('Scrape time');
      console.log('Title:', result.title);
      console.log('Content preview:', result.content.substring(0, 150) + '...');
      console.log('Content length:', result.content.length, 'characters');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testScraper();