# Mapbox Integration Setup

Your Mapbox token has been successfully integrated into the application!

## 🗺️ How to Use Mapbox Maps

1. **Navigate to the Coverage Map**
   - Go to http://localhost:5000/coverage
   - Enter a ZIP code (e.g., 90210)

2. **Switch Between Map Providers**
   - Click the "Switch to Mapbox" button in the top-left corner of the map
   - You can switch back to OpenStreetMap anytime

## 🎨 Mapbox Features

When using Mapbox, you get:
- **Better Performance**: Faster tile loading and smoother interactions
- **Satellite View**: Can be enabled by changing the style in `MapboxCoverageView.tsx`
- **Custom Styling**: Ability to create custom map styles
- **3D Buildings**: Can be enabled for better visualization
- **More Zoom Levels**: Better detail at all zoom levels

## 🔧 Configuration

Your Mapbox token is stored in:
- `client/src/config/mapbox.ts`

To change map styles, edit `MapboxCoverageView.tsx`:
```typescript
style: 'mapbox://styles/mapbox/light-v11', // Current style
// Other options:
// 'mapbox://styles/mapbox/dark-v11'
// 'mapbox://styles/mapbox/streets-v12'
// 'mapbox://styles/mapbox/satellite-streets-v12'
```

## 🚀 Advanced Features

To enable additional Mapbox features:

### 1. Satellite View
Change the style in `MapboxCoverageView.tsx`:
```typescript
style: 'mapbox://styles/mapbox/satellite-streets-v12',
```

### 2. 3D Buildings
Add after map initialization:
```typescript
map.current.on('load', () => {
  map.current.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-opacity': 0.6
    }
  });
});
```

### 3. Custom Controls
Add more controls:
```typescript
// Fullscreen control
map.current.addControl(new mapboxgl.FullscreenControl());

// Scale control
map.current.addControl(new mapboxgl.ScaleControl());

// Geolocate control
map.current.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}));
```

## 📊 Usage Limits

Your Mapbox account includes:
- 50,000 free map loads per month
- 50,000 free geocoding requests per month

For production use, monitor your usage at:
https://account.mapbox.com/

## 🔒 Security

For production:
1. Restrict your token to specific domains
2. Use URL restrictions in Mapbox account settings
3. Consider using a server-side proxy for sensitive operations

## 🐛 Troubleshooting

If the map doesn't load:
1. Check browser console for errors
2. Verify the token is correct
3. Ensure you have internet connection
4. Check if the token has proper scopes

Your map is now ready to use with both Leaflet (free) and Mapbox (premium features)! 