# GPT Codex Setup Guide

## Quick Start for Codex Environment

Since GPT Codex environments have no internet access, run this setup script first:

```bash
./codex-setup.sh
```

This will:
- Create necessary directories
- Generate type definition stubs
- Create a minimal working environment
- Set up configuration files

## What the Script Does

1. **Creates Type Definitions** - Stubs for @types/node and vite/client
2. **Sets Up Environment** - Creates .env with default values
3. **Builds Offline Server** - Creates a minimal Express server that works without dependencies
4. **Configures TypeScript** - Ensures tsconfig.json is properly set up

## Running Without Dependencies

After setup, you can:

```bash
# Start minimal server (port 5000)
./start-offline.sh

# Or run directly
node dist/server.js
```

This provides a basic server with health check endpoint at `/api/health`.

## Full Installation (Requires Internet)

For complete functionality, run these commands in an environment with internet:

```bash
# Install all dependencies
npm install

# Run development server
npm run dev

# Or build for production
npm run build
npm start
```

## Docker Alternative

If Docker is available:

```bash
# Development with hot-reload
docker-compose up dev

# Production build
docker-compose up prod
```

## Features Available in Offline Mode

- ✅ Basic Express server
- ✅ Health check endpoint
- ✅ Static file serving
- ✅ TypeScript configuration

## Features Requiring Dependencies

- ❌ React UI
- ❌ Three.js animations
- ❌ Database connectivity
- ❌ Authentication
- ❌ Map functionality
- ❌ AI integration

## Troubleshooting

### TypeScript Errors
The setup script creates minimal type stubs. For full types, you need:
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

### Missing Modules
All npm packages must be installed with internet access. The offline mode only provides a minimal server.

### Port Issues
Default port is 5000. Change in .env if needed:
```
PORT=3000
```

## Development Workflow

1. Use the offline setup for basic structure inspection
2. Install dependencies in an environment with internet
3. Commit node_modules to a branch if needed for isolated environments
4. Or use Docker images with pre-installed dependencies

## Contact

For issues, check the GitHub repository: https://github.com/Pablo305/internetproviders