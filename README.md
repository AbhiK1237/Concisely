# Concisely

Concisely is an AI-powered content summarization platform that helps users save time by generating concise summaries of various content types including articles, YouTube videos, podcasts, and documents.

![Concisely Logo](./frontend/public/logo.png)

## Features

- **Multi-source Summarization**: Generate summaries from different content types:
  - Articles/Web pages
  - YouTube videos
  - Podcasts
  - Documents (PDF, DOC, etc.)

- **User Management**: Secure authentication system with protected routes

- **Summary Management**:
  - Save summaries for future reference
  - Rate summaries as helpful or not helpful
  - Browse summaries by topic

- **Weekly Digests**: Receive curated weekly newsletters based on topics of interest

## Project Structure

The project is divided into two main parts:

### Frontend
- Built with React 19, TypeScript, and Vite
- Utilizes Tailwind CSS for styling with Shadcn UI components
- Responsive design for all devices

### Backend
- Node.js with Express.js
- MongoDB for data storage
- AI integrations with Gemini API for summarization

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance
- API key for Gemini (for AI summarization)

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
- `GET /api/users/saved` - Get saved summaries
- `POST /api/users/save/:summaryId` - Save a summary
- `DELETE /api/users/unsave/:summaryId` - Unsave a summary

## Technologies Used

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Gemini AI API
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
- Shadcn UI for the beautiful component library
- Gemini API for powering our AI summarization
