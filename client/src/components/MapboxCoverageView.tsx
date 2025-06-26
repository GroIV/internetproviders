import { useEffect, useRef, useState } from 'react';
import { Provider } from '@/lib/providers';

// Note: To use this component, you need to:
// 1. Install mapbox-gl: npm install mapbox-gl @types/mapbox-gl
// 2. Add your Mapbox token to environment variables
// 3. Import Mapbox CSS in your main CSS file: @import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxCoverageViewProps {
  zipCode?: string;
  providers?: Provider[];
  className?: string;
  mapboxToken?: string;
}

interface ZipCodeLocation {
  zipCode: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

const MapboxCoverageView = ({ 
  zipCode, 
  providers, 
  className = '',
  mapboxToken 
}: MapboxCoverageViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Dynamic import to avoid issues if mapbox-gl is not installed
    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5795, 39.8283], // Center of USA
        zoom: 3
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        map.current?.remove();
      };
    }).catch(err => {
      console.error('Failed to load Mapbox:', err);
    });
  }, [mapboxToken]);

  // Update map when ZIP code changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !zipCode || zipCode.length !== 5) return;

    fetchAndDisplayZipCode(zipCode);
  }, [zipCode, mapLoaded]);

  const fetchAndDisplayZipCode = async (zip: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/zipcode/${zip}/boundary`);
      const data = await response.json();

      if (data.center) {
        // Fly to the ZIP code location
        map.current.flyTo({
          center: [data.center.lng, data.center.lat],
          zoom: 12,
          duration: 2000
        });

        // Add providers as layers
        if (providers && providers.length > 0) {
          addProviderLayers(data.center, providers);
        }
      }
    } catch (error) {
      console.error('Error fetching ZIP code data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProviderLayers = async (center: { lat: number; lng: number }, providerList: Provider[]) => {
    const mapboxgl = await import('mapbox-gl');
    
    // Remove existing provider layers
    const existingLayers = map.current.getStyle().layers.filter((layer: any) => 
      layer.id.startsWith('provider-')
    );
    existingLayers.forEach((layer: any) => {
      map.current.removeLayer(layer.id);
      map.current.removeSource(layer.id);
    });

    // Add new provider layers
    providerList.forEach((provider, index) => {
      const color = getProviderColor(index);
      const radius = 5 + (index * 2); // Varying radius in km

      // Add circle source
      map.current.addSource(`provider-${provider.id}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [center.lng, center.lat]
          },
          properties: {
            name: provider.name
          }
        }
      });

      // Add circle layer
      map.current.addLayer({
        id: `provider-${provider.id}-circle`,
        type: 'circle',
        source: `provider-${provider.id}`,
        paint: {
          'circle-radius': {
            stops: [
              [0, 0],
              [20, metersToPixelsAtMaxZoom(radius * 1000, center.lat)]
            ],
            base: 2
          },
          'circle-color': color,
          'circle-opacity': 0.3,
          'circle-stroke-color': color,
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.8
        }
      });

      // Add popup
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      map.current.on('mouseenter', `provider-${provider.id}-circle`, (e: any) => {
        map.current.getCanvas().style.cursor = 'pointer';
        popup.setLngLat(e.lngLat)
          .setHTML(`<h3 class="font-bold">${provider.name}</h3><p>Coverage Area</p>`)
          .addTo(map.current);
      });

      map.current.on('mouseleave', `provider-${provider.id}-circle`, () => {
        map.current.getCanvas().style.cursor = '';
        popup.remove();
      });
    });
  };

  const metersToPixelsAtMaxZoom = (meters: number, latitude: number) => {
    return meters / 0.075 / Math.cos(latitude * Math.PI / 180);
  };

  const getProviderColor = (index: number): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#48DBFB', '#1DD1A1', '#F368E0'
    ];
    return colors[index % colors.length];
  };

  if (!mapboxToken) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-6">
          <p className="text-lg font-medium mb-2">Mapbox Token Required</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Add VITE_MAPBOX_TOKEN to your environment variables to use Mapbox
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 z-[1000] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm">Loading map data...</p>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Legend */}
      {providers && providers.length > 0 && zipCode && (
        <div className="absolute bottom-4 right-4 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg z-[1000] max-w-xs">
          <h4 className="font-bold text-sm mb-2">Available Providers</h4>
          <div className="space-y-1">
            {providers.map((provider, index) => (
              <div key={provider.id} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getProviderColor(index) }}
                />
                <span className="text-xs">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxCoverageView; 