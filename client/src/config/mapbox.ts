// Mapbox configuration
// IMPORTANT: Set VITE_MAPBOX_TOKEN in your .env file
// Get your token from: https://www.mapbox.com/
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Validate token exists
if (!MAPBOX_TOKEN && import.meta.env.MODE === 'production') {
  console.error('Mapbox token is required in production. Please set VITE_MAPBOX_TOKEN in your environment.');
} 