# Map Integration Guide

This application now includes interactive map functionality to visualize internet provider coverage areas.

## 🗺️ Map Features

### Leaflet Integration (Default)
The application uses **Leaflet** as the default mapping solution because:
- ✅ Free and open-source
- ✅ No API key required
- ✅ Works out of the box
- ✅ Good performance
- ✅ Mobile-friendly

### Features Implemented:
1. **Interactive Coverage Map**
   - Shows ZIP code location with a marker
   - Displays coverage circles for each provider
   - Different colors for each provider
   - Interactive popups with provider information

2. **Coverage Statistics**
   - Total providers count
   - Fiber, Cable, and DSL provider breakdown
   - List of available providers with website links

3. **Geocoding Integration**
   - Converts coordinates to ZIP codes
   - Uses OpenStreetMap's Nominatim API (free)
   - No API key required

## 🚀 How to Use

1. **Navigate to Coverage Map**
   - Click on "Coverage Map" in the navigation
   - Or go directly to `/coverage`

2. **Search for Coverage**
   - Enter a 5-digit ZIP code
   - Click "Find Providers" or use current location
   - Map will zoom to the ZIP code area
   - Coverage circles show provider availability

3. **Interact with the Map**
   - Click on markers for more information
   - Hover over coverage areas to see provider names
   - Use zoom controls to explore the area
   - View provider list in the sidebar

## 🔧 Technical Details

### Components Created:
- `CoverageMapView.tsx` - Leaflet-based map component
- `MapboxCoverageView.tsx` - Alternative Mapbox implementation (requires API key)

### API Endpoints:
- `GET /api/zipcode/:zipCode/boundary` - Get ZIP code geographic data
- `POST /api/geocode/reverse` - Convert lat/lng to ZIP code

### Styling:
- Custom CSS for Leaflet components
- Dark mode support
- Responsive design

## 🎨 Customization

### Change Provider Colors:
Edit the `getProviderColor` function in `CoverageMapView.tsx`:
```typescript
const getProviderColor = (index: number): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', // Add your colors
  ];
  return colors[index % colors.length];
};
```

### Adjust Coverage Radius:
Modify the radius calculation in the Circle component:
```typescript
radius={5000 + (index * 1000)} // Base radius + increment
```

## 🗺️ Using Mapbox (Optional)

For advanced features like satellite imagery and custom styles:

1. **Get a Mapbox Token**
   - Sign up at [mapbox.com](https://www.mapbox.com/)
   - Create a public access token

2. **Install Mapbox GL**
   ```bash
   npm install mapbox-gl @types/mapbox-gl
   ```

3. **Add Token to Environment**
   ```env
   VITE_MAPBOX_TOKEN=your-mapbox-public-token
   ```

4. **Switch to Mapbox Component**
   Replace `CoverageMapView` with `MapboxCoverageView` in `CoverageMap.tsx`

## 🐛 Troubleshooting

### Map Not Loading:
- Check browser console for errors
- Ensure you have internet connection (for map tiles)
- Try refreshing the page

### Geocoding Not Working:
- OpenStreetMap has rate limits (1 request/second)
- Consider implementing caching for ZIP code locations
- For production, use a paid geocoding service

### Performance Issues:
- Limit the number of coverage circles displayed
- Implement clustering for multiple locations
- Use simplified geometries for large areas

## 🚀 Future Enhancements

1. **Real Coverage Data**
   - Import actual coverage boundaries from GIS data
   - Show street-level coverage accuracy
   - Display network technology (5G, Fiber, etc.)

2. **Advanced Features**
   - Heat maps for speed/pricing
   - Coverage comparison overlays
   - Historical coverage changes
   - User-reported coverage validation

3. **Mobile Optimization**
   - Touch-friendly controls
   - Offline map caching
   - GPS accuracy indicators 