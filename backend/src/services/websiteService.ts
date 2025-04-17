import puppeteer from 'puppeteer';

export const scrapeArticle = async (url: string): Promise<{ title: string; content: string }> => {
  let browser = null;
  
  try {
    // Launch a headless browser
    browser = await puppeteer.launch({
      headless: true, // Use the headless mode
    });
    
    // Open a new page
    const page = await browser.newPage();
    
    // Navigate to the URL
    await page.goto(url, { 
      waitUntil: 'networkidle2', // Wait until the network is idle
      timeout: 30000 // 30 seconds timeout
    });
    
    // Extract the title and content
    const result = await page.evaluate(() => {
      // Remove unwanted elements
      const elementsToRemove = document.querySelectorAll(
        'script, style, nav, footer, header, aside, .ads, .comments'
      );
      elementsToRemove.forEach(el => el.remove());
      
      // Get the title
      const title = document.querySelector('title')?.textContent?.trim() || 
                    document.querySelector('h1')?.textContent?.trim() || '';
      
      // Get the main content
      let content = '';
      
      // Try to find the main content container
      const article = document.querySelector('article');
      if (article) {
        content = article.textContent?.trim() || '';
      } else {
        // Fallback to looking for paragraphs in the main content area
        const main = document.querySelector('main');
        if (main) {
          const paragraphs = main.querySelectorAll('p');
          content = Array.from(paragraphs)
            .map(p => p.textContent)
            .filter(text => text)
            .join('\n\n');
        } else {
          // Last resort, just grab all paragraphs
          const paragraphs = document.querySelectorAll('p');
          content = Array.from(paragraphs)
            .map(p => p.textContent)
            .filter(text => text)
            .join('\n\n');
        }
      }
      
      return {
        title: title,
        content: content.trim(),
      };
    });
    
    return result;
  } catch (error) {
    console.error('Error scraping article:', error);
    throw new Error('Failed to scrape article content');
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
};