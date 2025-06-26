import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Provider } from '@/lib/providers';

// Fix for default markers in React Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CoverageMapViewProps {
  zipCode?: string;
  providers?: Provider[];
  className?: string;
}

interface ZipCodeLocation {
  zipCode: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

const CoverageMapView = ({ zipCode, providers, className = '' }: CoverageMapViewProps) => {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([39.8283, -98.5795]); // Center of USA
  const [zipLocation, setZipLocation] = useState<ZipCodeLocation | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch ZIP code coordinates when zipCode changes
  useEffect(() => {
    if (zipCode && zipCode.length === 5) {
      fetchZipCodeLocation(zipCode);
    }
  }, [zipCode]);

  const fetchZipCodeLocation = async (zip: string) => {
    setLoading(true);
    try {
      // Using Nominatim API to get coordinates for ZIP code
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=USA&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'InternetProviderAnalytics/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        const newLocation: ZipCodeLocation = {
          zipCode: zip,
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon),
          city: location.display_name?.split(',')[0],
          state: location.display_name?.split(',')[1]?.trim()
        };
        
        setZipLocation(newLocation);
        setMapCenter([newLocation.lat, newLocation.lng]);
      }
    } catch (error) {
      console.error('Error fetching ZIP code location:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate provider colors
  const getProviderColor = (index: number): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#48DBFB', '#1DD1A1', '#F368E0'
    ];
    return colors[index % colors.length];
  };

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
      
      <MapContainer
        center={mapCenter}
        zoom={zipLocation ? 12 : 4}
        className="h-full w-full"
        style={{ minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {zipLocation && (
          <>
            {/* Main marker for ZIP code location */}
            <Marker position={[zipLocation.lat, zipLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">{zipLocation.zipCode}</h3>
                  {zipLocation.city && <p>{zipLocation.city}, {zipLocation.state}</p>}
                  {providers && providers.length > 0 && (
                    <p className="mt-2 text-sm">{providers.length} providers available</p>
                  )}
                </div>
              </Popup>
            </Marker>
            
            {/* Coverage circles for each provider */}
            {providers && providers.map((provider, index) => (
              <Circle
                key={provider.id}
                center={[zipLocation.lat, zipLocation.lng]}
                radius={5000 + (index * 1000)} // Varying radius for visibility
                pathOptions={{
                  fillColor: getProviderColor(index),
                  fillOpacity: 0.2,
                  color: getProviderColor(index),
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h4 className="font-bold">{provider.name}</h4>
                    <p className="text-sm">Coverage Area</p>
                  </div>
                </Popup>
              </Circle>
            ))}
          </>
        )}
      </MapContainer>
      
      {/* Legend */}
      {providers && providers.length > 0 && zipLocation && (
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

export default CoverageMapView; 