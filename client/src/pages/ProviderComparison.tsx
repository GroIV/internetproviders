import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSearch } from 'wouter/use-browser-location';
import { useQuery } from '@tanstack/react-query';
import ZipCodeSearch from '@/components/ZipCodeSearch';
import ProviderComparisonTable from '@/components/ProviderComparisonTable';
import { getProvidersByZip } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Add interface for search params
interface SearchParams {
  zip?: string;
  [key: string]: string | undefined;
}

const ProviderComparison = () => {
  const search = useSearch() as unknown as SearchParams;
  const [_, setLocation] = useLocation();
  const [zipCode, setZipCode] = useState<string>(search?.zip || '');
  const [selectedProviderIds, setSelectedProviderIds] = useState<number[]>([]);

  const providersQuery = useQuery({
    queryKey: ['/api/coverage', zipCode],
    queryFn: () => getProvidersByZip(zipCode),
    enabled: zipCode.length === 5,
  });

  // Set the zip code from the URL if available
  useEffect(() => {
    if (search?.zip && search.zip.length === 5) {
      setZipCode(search.zip);
    }
  }, [search?.zip]);

  // Handle ZIP code change
  const handleZipChange = (newZipCode: string) => {
    setZipCode(newZipCode);
    setSelectedProviderIds([]);
    setLocation(`/compare?zip=${newZipCode}`);
  };

  // Handle provider selection change
  const handleProviderChange = (providerIds: number[]) => {
    setSelectedProviderIds(providerIds);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold mb-4">Compare Internet Providers</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          Compare plans, pricing, and features from different internet service providers in your area.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Enter Your ZIP Code</CardTitle>
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

      {zipCode && zipCode.length === 5 && (
        <div className="mb-10">
          {providersQuery.isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2">Loading providers for {zipCode}...</p>
            </div>
          ) : providersQuery.isError ? (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="pt-6">
                <p className="text-center">Error loading providers. Please try again.</p>
              </CardContent>
            </Card>
          ) : providersQuery.data && providersQuery.data.length === 0 ? (
            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <p className="text-center">No providers found for ZIP code {zipCode}. Try a different ZIP code.</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
                <TabsTrigger value="comparison">Compare Plans</TabsTrigger>
                <TabsTrigger value="details">Provider Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comparison">
                <ProviderComparisonTable 
                  zipCode={zipCode}
                  selectedProviderIds={selectedProviderIds}
                  onZipChange={handleZipChange}
                  onProviderChange={handleProviderChange}
                />
              </TabsContent>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {providersQuery.data && providersQuery.data.map(provider => (
                    <Card key={provider.id} className="overflow-hidden">
                      <div className="h-24 p-6 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                        {provider.logo ? (
                          <img 
                            src={provider.logo} 
                            alt={`${provider.name} logo`}
                            className="max-h-full max-w-[80%] object-contain"
                          />
                        ) : (
                          <div className="text-xl font-bold font-display">{provider.name}</div>
                        )}
                      </div>
                      <CardContent className="pt-6">
                        <h3 className="font-bold text-lg mb-2">{provider.name}</h3>
                        <div className="flex justify-between items-center mt-4">
                          {provider.website && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(provider.website, '_blank')}
                            >
                              Visit Website
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleProviderChange(
                              selectedProviderIds.includes(provider.id) 
                                ? selectedProviderIds.filter(id => id !== provider.id)
                                : [...selectedProviderIds, provider.id]
                            )}
                          >
                            {selectedProviderIds.includes(provider.id) ? 'Remove' : 'Add to Compare'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderComparison;