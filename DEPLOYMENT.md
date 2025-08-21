# Deployment Guide

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both the backend (port 3000) and frontend (port 5173) servers.

## Production Deployment

### Option 1: Simple Server Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```
   The server will serve the built frontend files and handle API requests.

### Option 2: Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_TOKEN=your_github_token_here
```

### Option 3: Cloud Deployment (Heroku, Railway, etc.)

1. **Set environment variables** in your cloud platform:
   - `NODE_ENV=production`
   - `PORT` (usually auto-set by platform)
   - `OPENAI_API_KEY`
   - `GITHUB_TOKEN`

2. **Deploy:**
   ```bash
   git push heroku main
   # or for Railway
   railway up
   ```

## Multi-User Setup

For multiple users, consider:

1. **Database Integration:** Replace in-memory storage with a database (PostgreSQL, MongoDB)
2. **User Authentication:** Add user accounts and sessions
3. **Rate Limiting:** Implement API rate limits per user
4. **Load Balancing:** Use multiple server instances behind a load balancer

## Security Considerations

- Keep API keys secure and never commit them to version control
- Implement proper CORS policies for production domains
- Add rate limiting to prevent abuse
- Consider adding authentication for sensitive operations
