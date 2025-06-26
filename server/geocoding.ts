import fetch from 'node-fetch';

interface GeocodingResult {
  zipCode?: string;
  city?: string;
  state?: string;
  error?: string;
}

/**
 * Convert latitude/longitude to ZIP code using a geocoding service
 * This implementation uses the free Nominatim API from OpenStreetMap
 * For production, consider using Google Maps API or similar paid service
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
  try {
    // Using Nominatim API (free, but has rate limits)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'InternetProviderAnalytics/1.0' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    if (data.address) {
      return {
        zipCode: data.address.postcode,
        city: data.address.city || data.address.town || data.address.village,
        state: data.address.state
      };
    }
    
    return { error: 'No address found for coordinates' };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { error: 'Failed to geocode coordinates' };
  }
}

/**
 * Alternative implementation using US Census Geocoding API (US only, but free)
 */
export async function reverseGeocodeUSCensus(lat: number, lon: number): Promise<GeocodingResult> {
  try {
    const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Census API error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    if (data.result && data.result.geographies && data.result.geographies['2020 Census Blocks']) {
      const block = data.result.geographies['2020 Census Blocks'][0];
      if (block && block.BASENAME) {
        // Extract ZIP from block data if available
        // Note: Census API doesn't always return ZIP directly
        return {
          state: block.STATE,
          error: 'ZIP code not available from Census API'
        };
      }
    }
    
    return { error: 'No data found for coordinates' };
  } catch (error) {
    console.error('Census geocoding error:', error);
    return { error: 'Failed to geocode coordinates' };
  }
}

/**
 * Get ZIP code from coordinates using available services
 */
export async function getZipFromCoordinates(lat: number, lon: number): Promise<string | null> {
  // Try Nominatim first
  const result = await reverseGeocode(lat, lon);
  
  if (result.zipCode) {
    return result.zipCode;
  }
  
  // If Nominatim fails, you could try other services here
  // For now, return null if no ZIP found
  return null;
} 