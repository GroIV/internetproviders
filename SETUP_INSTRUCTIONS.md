# Setup Instructions for Internet Provider Analytics

## Prerequisites
- Node.js 18+ and npm
- Git

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pablo305/internetproviders.git
   cd internetproviders
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

   Edit `.env` and add:
   - `MAPBOX_ACCESS_TOKEN` (required for maps)
   - `AI_API_KEY` (optional, for AI features)
   - `DATABASE_URL` (optional, uses in-memory by default)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:5000

## Common Issues

### TypeScript Errors
If you see TypeScript errors about missing types:
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

### Build Issues
To check for issues without running the server:
```bash
npm run typecheck
npm run build
```

### Missing Dependencies
If any dependencies are missing:
```bash
npm install
npm audit fix
```

## Docker Setup (Alternative)

If you prefer using Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
```

Build and run:
```bash
docker build -t internetproviders .
docker run -p 5000:5000 internetproviders
```

## Production Build

For production deployment:
```bash
npm run build
npm start
```

## Features Included

- ✅ Vibrant fiber optic hero animations
- ✅ Three.js 3D globe
- ✅ Blog system with 6 articles
- ✅ Provider comparison
- ✅ Coverage maps
- ✅ AI Assistant UI
- ✅ Authentication pages
- ✅ Admin dashboard
- ✅ Dark mode
- ✅ Responsive design

## Environment Variables

Required:
- `MAPBOX_ACCESS_TOKEN` - For map functionality

Optional:
- `DATABASE_URL` - PostgreSQL connection string
- `AI_API_KEY` - OpenAI/Claude API key
- `SESSION_SECRET` - Express session secret
- `PORT` - Server port (default: 5000)

## Support

For issues or questions, please open an issue on GitHub.