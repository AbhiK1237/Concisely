# Concisely

Concisely is an AI-powered content summarization and newsletter platform that helps users stay informed by generating concise summaries of various content types and delivering personalized newsletters based on topics of interest.

![Concisely Logo](./frontend/public/logo.png)

## Features

- **Multi-source Summarization**: Generate summaries from different content types:
  - Articles/Web pages
  - YouTube videos
  - Podcasts
  - Documents (PDF)

- **Smart Content Discovery**: Automatically find and summarize relevant content based on your topics of interest

- **Personalized Newsletters**: 
  - Receive curated newsletters based on your preferred topics
  - Schedule delivery frequency (daily, weekly, monthly)
  - Beautiful markdown-to-HTML formatting for better readability

- **User Management**: 
  - Secure authentication system with protected routes
  - Customizable topic preferences
  - Delivery frequency settings

- **Summary Management**:
  - Save summaries for future reference
  - Rate summaries as helpful or not helpful
  - Browse summaries by topic

## Project Structure

The project is divided into two main parts:

### Frontend
- Built with React 19 and TypeScript
- Vite for fast development and building
- Tailwind CSS with shadcn/ui-inspired components
- Responsive design for all devices
- Showdown for markdown-to-HTML conversion

### Backend
- Node.js with Express.js and TypeScript
- MongoDB for data storage
- Multi-AI integration:
  - Gemini API for summarization
  - OpenAI for content analysis and topic detection
- Brave Search API through Model Context Protocol (MCP) for content discovery
- Puppeteer for web scraping
- Nodemailer for email delivery

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance
- API keys for:
  - Gemini (for AI summarization)
  - OpenAI (for topic detection)
  - Brave Search (for content discovery)
- Email service credentials (for newsletter delivery)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/concisely.git
   cd concisely
   ```

2. Setup backend:
   ```bash
   cd backend
   npm install
   # Create a .env file with the following variables:
   # PORT=5001
   # MONGODB_URI=your_mongodb_uri
   # JWT_SECRET=your_jwt_secret
   # GEMINI_API_KEY=your_gemini_api_key
   # OPENAI_API_KEY=your_openai_api_key
   # BRAVE_API_KEY=your_brave_api_key
   # YOUTUBE_API_KEY=your_youtube_api_key
   # EMAIL_HOST=your_email_host
   # EMAIL_PORT=your_email_port
   # EMAIL_USER=your_email_user
   # EMAIL_PASSWORD=your_email_password
   # EMAIL_SECURE=true_or_false
   npm run dev
   ```

3. Setup frontend:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user

### Summaries
- `POST /api/summaries/article` - Create a summary from an article URL
- `POST /api/summaries/youtube` - Create a summary from a YouTube video
- `POST /api/summaries/podcast` - Create a summary from a podcast
- `POST /api/summaries/document` - Create a summary from an uploaded document
- `GET /api/summaries` - Get all summaries for a user
- `GET /api/summaries/:id` - Get a specific summary
- `DELETE /api/summaries/:id` - Delete a summary
- `POST /api/summaries/:id/rate` - Rate a summary

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/saved-summaries` - Get saved summaries
- `POST /api/users/saved-summaries/:summaryId` - Save a summary
- `DELETE /api/users/saved-summaries/:summaryId` - Unsave a summary

### Content & Newsletters
- `POST /api/content/fetch` - Fetch content based on user preferences
- `POST /api/content/newsletter` - Generate a newsletter
- `GET /api/newsletters` - Get all newsletters
- `GET /api/newsletters/:id` - Get a specific newsletter
- `GET /api/newsletters/latest` - Get the latest newsletter
- `POST /api/newsletters/:id/schedule` - Schedule a newsletter
- `POST /api/newsletters/:newsletterId/send` - Send a newsletter

## Technologies Used

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-inspired components
- React Router
- Axios
- Showdown (markdown conversion)

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Gemini AI API
- OpenAI API
- Brave Search API with MCP
- Puppeteer (for web scraping)
- Nodemailer (for email delivery)
- Sendgrid for sending and managing emails
- Cron jobs (for scheduling)
- Multer (for file uploads)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Shadcn UI for the beautiful component patterns
- Gemini and OpenAI for powering our AI capabilities
- Brave Search for content discovery
