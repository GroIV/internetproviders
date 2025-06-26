import { useState, useEffect } from 'react';
import { useSearch } from 'wouter/use-browser-location';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ZipCodeSearch from '@/components/ZipCodeSearch';
import CoverageMapView from '@/components/CoverageMapView';
import MapboxCoverageView from '@/components/MapboxCoverageView';
import { getProvidersByZip } from '@/lib/providers';
import { MAPBOX_TOKEN } from '@/config/mapbox';

// Add interface for search params
interface SearchParams {
  zip?: string;
  [key: string]: string | undefined;
}

const CoverageMap = () => {
  const search = useSearch() as unknown as SearchParams;
  const [zipCode, setZipCode] = useState<string>(search?.zip || '');
  const [useMapbox, setUseMapbox] = useState(false);

  // Fetch providers for the ZIP code
  const { data: providers, isLoading } = useQuery({
    queryKey: ['/api/coverage', zipCode],
    queryFn: () => getProvidersByZip(zipCode),
    enabled: zipCode.length === 5,
  });

  const handleZipChange = (newZipCode: string) => {
    setZipCode(newZipCode);
  };

  // Calculate coverage statistics
  const coverageStats = {
    totalProviders: providers?.length || 0,
    fiberProviders: providers?.filter(p => 
      p.name.toLowerCase().includes('fiber') || 
      p.name.toLowerCase().includes('fios')
    ).length || 0,
    cableProviders: providers?.filter(p => 
      p.name.toLowerCase().includes('spectrum') || 
      p.name.toLowerCase().includes('xfinity') ||
      p.name.toLowerCase().includes('cox') ||
      p.name.toLowerCase().includes('optimum')
    ).length || 0,
    dslProviders: providers?.filter(p => 
      p.name.toLowerCase().includes('at&t') || 
      p.name.toLowerCase().includes('centurylink') ||
      p.name.toLowerCase().includes('frontier') ||
      p.name.toLowerCase().includes('windstream')
    ).length || 0,
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Internet Coverage Map</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          View internet provider coverage areas and check availability in your location.
        </p>
      </div>
      
      <div className="max-w-xl mx-auto mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Enter Your ZIP Code</CardTitle>
            <CardDescription>
              Check which providers serve your area and view coverage details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ZipCodeSearch 
              fullWidth 
              onSearch={handleZipChange} 
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[500px] overflow-hidden">
            <div className="absolute top-2 left-2 z-[1000]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseMapbox(!useMapbox)}
                className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
              >
                {useMapbox ? 'Switch to OpenStreetMap' : 'Switch to Mapbox'}
              </Button>
            </div>
            {useMapbox ? (
              <MapboxCoverageView 
                zipCode={zipCode} 
                providers={providers}
                className="h-full"
                mapboxToken={MAPBOX_TOKEN}
              />
            ) : (
              <CoverageMapView 
                zipCode={zipCode} 
                providers={providers}
                className="h-full"
              />
            )}
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Coverage Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!zipCode ? (
                <p className="text-neutral-600 dark:text-neutral-400">
                  Enter a ZIP code to see provider coverage details
                </p>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Showing coverage information for <span className="font-medium">{zipCode}</span>
                  </p>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Coverage Statistics:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Providers</p>
                        <p className="font-medium text-lg">{coverageStats.totalProviders}</p>
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Fiber Coverage</p>
                        <p className="font-medium text-lg">{coverageStats.fiberProviders}</p>
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Cable Coverage</p>
                        <p className="font-medium text-lg">{coverageStats.cableProviders}</p>
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">DSL Coverage</p>
                        <p className="font-medium text-lg">{coverageStats.dslProviders}</p>
                      </div>
                    </div>
                  </div>

                  {providers && providers.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="font-medium">Available Providers:</p>
                      <div className="space-y-1">
                        {providers.map(provider => (
                          <div key={provider.id} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                            <span className="text-sm font-medium">{provider.name}</span>
                            {provider.website && (
                              <a 
                                href={provider.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Visit →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoverageMap;