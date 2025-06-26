# Internet Provider Analytics - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (optional - will use in-memory storage if not configured)
- Mapbox account (optional - for premium map features)
- OpenAI or Anthropic API key (optional - for AI assistant)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InternetProviderAnalytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration (optional)
   DATABASE_URL=postgresql://user:password@localhost:5432/internetproviders

   # Session Configuration
   SESSION_SECRET=your-secret-key-change-in-production

   # AI Configuration (optional - choose one)
   # For OpenAI
   AI_API_TYPE=openai
   AI_API_KEY=your-openai-api-key

   # For Claude/Anthropic
   # AI_API_TYPE=claude
   # AI_API_KEY=your-anthropic-api-key

   # Mapbox Configuration (optional)
   VITE_MAPBOX_TOKEN=your-mapbox-token

   # Environment
   NODE_ENV=development
   ```

4. **Set up the database** (if using PostgreSQL)
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## Features Configuration

### Database
- If `DATABASE_URL` is not set, the app will use in-memory storage
- Data will be lost on restart when using in-memory storage
- PostgreSQL is recommended for production use

### AI Assistant
- Set `AI_API_TYPE` to either `openai` or `claude`
- Provide the corresponding API key in `AI_API_KEY`
- If not configured, the AI assistant will use fallback responses

### Maps
- The app includes free OpenStreetMap/Leaflet maps by default
- For Mapbox features, set `VITE_MAPBOX_TOKEN`
- Users can toggle between map providers in the Coverage Map page

### Authentication
- User authentication is enabled by default
- Admin users can access `/admin` dashboard
- First user should be made admin via database

## Initial Data

The application automatically imports data from the Excel file in `attached_assets/` on startup.

## Admin Access

To create an admin user:
1. Register a normal user account
2. Update the user in the database to set `isAdmin = true`
3. Or use the database management tool of your choice

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Run with:
   ```bash
   npm run start:prod
   ```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- App will fall back to memory storage if database is unavailable

### Map Not Loading
- Check browser console for errors
- Verify Mapbox token if using Mapbox
- Ensure internet connection for map tiles

### AI Assistant Not Working
- Verify API key is correct
- Check API rate limits
- Fallback responses will be used if AI is unavailable

## Features Status

### ✅ Working Features
- Provider search by ZIP code
- Plan comparison
- Basic recommendations
- Excel data import
- Real geocoding for location detection

### 🚧 In Progress
- Coverage map visualization
- AI Assistant integration
- User authentication
- Real-time updates

### 📋 TODO
- Admin panel for data management
- Email notifications
- Advanced filtering
- API rate limiting
- Performance optimization 