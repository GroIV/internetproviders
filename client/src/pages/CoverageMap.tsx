import { useState } from 'react';
import { useSearch } from 'wouter/use-browser-location';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ZipCodeSearch from '@/components/ZipCodeSearch';

// Add interface for search params
interface SearchParams {
  zip?: string;
  [key: string]: string | undefined;
}

const CoverageMap = () => {
  const search = useSearch() as unknown as SearchParams;
  const [zipCode, setZipCode] = useState<string>(search?.zip || '');

  const handleZipChange = (newZipCode: string) => {
    setZipCode(newZipCode);
  };

  return (
    <div className="container mx-auto px-4 py-10">
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
          <Card className="h-[500px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
            <div className="text-center p-6">
              <p className="text-lg font-medium mb-2">Coverage Map</p>
              <p className="text-neutral-600 dark:text-neutral-400">
                {zipCode 
                  ? `Showing coverage for ${zipCode}` 
                  : 'Enter a ZIP code to view coverage details'}
              </p>
            </div>
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
              ) : (
                <div className="space-y-4">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Showing coverage information for <span className="font-medium">{zipCode}</span>
                  </p>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Coverage Statistics:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Fiber Coverage</p>
                        <p className="font-medium">Coming soon</p>
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Cable Coverage</p>
                        <p className="font-medium">Coming soon</p>
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">DSL Coverage</p>
                        <p className="font-medium">Coming soon</p>
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Satellite Coverage</p>
                        <p className="font-medium">Coming soon</p>
                      </div>
                    </div>
                  </div>
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