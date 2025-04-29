import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plan, Provider, formatPrice, formatSpeed, getProviderLogo } from "@/lib/providers";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface ProviderComparisonTableProps {
  zipCode?: string;
  selectedProviderIds?: number[];
  onZipChange?: (zipCode: string) => void;
  onProviderChange?: (providerIds: number[]) => void;
}

const ProviderComparisonTable = ({
  zipCode,
  selectedProviderIds = [],
  onZipChange,
  onProviderChange
}: ProviderComparisonTableProps) => {
  const { toast } = useToast();
  const [localZipCode, setLocalZipCode] = useState(zipCode || "");
  const [selectedPlans, setSelectedPlans] = useState<Plan[]>([]);
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  
  // Fetch providers in ZIP code
  const { 
    data: providers, 
    isLoading: isLoadingProviders,
    refetch: refetchProviders
  } = useQuery({
    queryKey: [zipCode ? `/api/coverage/${zipCode}` : null],
    enabled: !!zipCode
  });
  
  // Fetch plans for selected providers
  const { 
    data: plans, 
    isLoading: isLoadingPlans,
    refetch: refetchPlans
  } = useQuery({
    queryKey: [selectedProviderIds.length > 0 ? `/api/plans?providerId=${selectedProviderIds.join(',')}` : null],
    enabled: selectedProviderIds.length > 0
  });
  
  // Update available providers when data changes
  useEffect(() => {
    if (providers && Array.isArray(providers)) {
      setAvailableProviders(providers);
    }
  }, [providers]);
  
  // Handle ZIP code search
  const handleZipSearch = () => {
    if (!/^\d{5}$/.test(localZipCode)) {
      toast({
        title: "Invalid ZIP code",
        description: "Please enter a valid 5-digit ZIP code",
        variant: "destructive"
      });
      return;
    }
    
    if (onZipChange) {
      onZipChange(localZipCode);
    }
  };
  
  // Handle provider selection
  const handleProviderSelect = (providerId: number) => {
    let newSelectedProviders: number[];
    
    if (selectedProviderIds.includes(providerId)) {
      newSelectedProviders = selectedProviderIds.filter(id => id !== providerId);
    } else {
      // Limit to comparing max 3 providers
      if (selectedProviderIds.length >= 3) {
        toast({
          title: "Provider limit reached",
          description: "You can compare up to 3 providers at a time"
        });
        return;
      }
      newSelectedProviders = [...selectedProviderIds, providerId];
    }
    
    if (onProviderChange) {
      onProviderChange(newSelectedProviders);
    }
  };
  
  // Find the best plan for each provider
  useEffect(() => {
    if (plans && Array.isArray(plans) && selectedProviderIds.length > 0) {
      const bestPlans: Plan[] = [];
      
      for (const providerId of selectedProviderIds) {
        const providerPlans = plans.filter(plan => plan.providerId === providerId);
        
        if (providerPlans.length > 0) {
          // For simplicity, choose the highest speed plan
          const bestPlan = providerPlans.sort((a, b) => b.downloadSpeed - a.downloadSpeed)[0];
          bestPlans.push(bestPlan);
        }
      }
      
      setSelectedPlans(bestPlans);
    }
  }, [plans, selectedProviderIds]);
  
  // If no providers are returned, show a message
  if (zipCode && providers && Array.isArray(providers) && providers.length === 0 && !isLoadingProviders) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden p-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-display font-bold mb-2">No Providers Found</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            We couldn't find any internet providers in ZIP code {zipCode}.
          </p>
          <div className="max-w-md mx-auto">
            <Label htmlFor="zip-search" className="sr-only">ZIP Code</Label>
            <div className="flex gap-2">
              <Input
                id="zip-search"
                value={localZipCode}
                onChange={(e) => setLocalZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Try another ZIP code"
                maxLength={5}
                className="flex-grow"
              />
              <Button onClick={handleZipSearch} className="gradient-bg hover:opacity-90">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Provider Selection */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="zip-code" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              ZIP Code
            </Label>
            <div className="flex">
              <Input
                id="zip-code"
                type="text"
                placeholder="e.g., 90210"
                value={localZipCode}
                onChange={(e) => setLocalZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                className="flex-1 min-w-0 rounded-l-lg"
              />
              <Button
                type="button"
                onClick={handleZipSearch}
                className="inline-flex items-center rounded-r-lg gradient-bg hover:opacity-90"
              >
                Update
              </Button>
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Providers to Compare {selectedProviderIds.length > 0 && `(${selectedProviderIds.length} selected)`}
            </Label>
            <div className="relative">
              <Select disabled={isLoadingProviders || !zipCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isLoadingProviders ? "Loading providers..." : 
                    !zipCode ? "Enter ZIP code first" : 
                    availableProviders.length === 0 ? "No providers available" :
                    "Select providers to compare"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map(provider => (
                    <SelectItem 
                      key={provider.id} 
                      value={provider.id.toString()}
                      onClick={() => handleProviderSelect(provider.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProviderIds.includes(provider.id)}
                          onChange={() => {}}
                          className="mr-2 h-4 w-4"
                        />
                        {provider.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparison Table */}
      {selectedProviderIds.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-neutral-50 dark:bg-neutral-900 w-1/4">
                  Features
                </TableHead>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableHead key={i} className="text-center">
                      <div className="flex flex-col items-center p-4">
                        <Skeleton className="w-12 h-12 rounded-full mb-2" />
                        <Skeleton className="w-24 h-4 mb-2" />
                        <Skeleton className="w-20 h-3" />
                      </div>
                    </TableHead>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const provider = availableProviders.find(p => p.id === plan.providerId);
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const columnClass = isFirst ? "bg-primary-50 dark:bg-primary-950/20" : 
                                     isLast ? "bg-secondary-50 dark:bg-secondary-950/20" : 
                                     "bg-accent-50 dark:bg-accent-950/20";
                    
                    return (
                      <TableHead key={plan.id} className={`${columnClass} text-center`}>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center mb-2">
                            <img
                              src={provider?.logo || getProviderLogo(provider?.name || '')}
                              alt={`${provider?.name} logo`}
                              className="w-10 h-10 object-contain rounded-full"
                            />
                          </div>
                          <span className="font-display font-bold text-primary-900 dark:text-primary-100">
                            {provider?.name}
                          </span>
                          <span className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                            {plan.name}
                          </span>
                        </div>
                      </TableHead>
                    );
                  })
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Download Speed */}
              <TableRow>
                <TableCell className="font-medium bg-neutral-50 dark:bg-neutral-900">
                  Download Speed
                </TableCell>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableCell key={i} className="text-center">
                      <Skeleton className="w-20 h-6 mx-auto" />
                    </TableCell>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const cellClass = isFirst ? "bg-primary-50/30 dark:bg-primary-950/10" : 
                                    isLast ? "bg-secondary-50/30 dark:bg-secondary-950/10" : 
                                    "bg-accent-50/30 dark:bg-accent-950/10";
                    
                    return (
                      <TableCell key={`${plan.id}-download`} className={`${cellClass} text-center`}>
                        <div className="font-bold text-lg">{formatSpeed(plan.downloadSpeed)}</div>
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
              
              {/* Upload Speed */}
              <TableRow>
                <TableCell className="font-medium bg-neutral-50 dark:bg-neutral-900">
                  Upload Speed
                </TableCell>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableCell key={i} className="text-center">
                      <Skeleton className="w-20 h-6 mx-auto" />
                    </TableCell>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const cellClass = isFirst ? "bg-primary-50/30 dark:bg-primary-950/10" : 
                                    isLast ? "bg-secondary-50/30 dark:bg-secondary-950/10" : 
                                    "bg-accent-50/30 dark:bg-accent-950/10";
                    
                    return (
                      <TableCell key={`${plan.id}-upload`} className={`${cellClass} text-center`}>
                        <div className="font-bold text-lg">{formatSpeed(plan.uploadSpeed)}</div>
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
              
              {/* Price */}
              <TableRow>
                <TableCell className="font-medium bg-neutral-50 dark:bg-neutral-900">
                  Monthly Price
                </TableCell>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableCell key={i} className="text-center">
                      <Skeleton className="w-20 h-6 mx-auto mb-1" />
                      <Skeleton className="w-24 h-3 mx-auto" />
                    </TableCell>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const cellClass = isFirst ? "bg-primary-50/30 dark:bg-primary-950/10" : 
                                    isLast ? "bg-secondary-50/30 dark:bg-secondary-950/10" : 
                                    "bg-accent-50/30 dark:bg-accent-950/10";
                    
                    return (
                      <TableCell key={`${plan.id}-price`} className={`${cellClass} text-center`}>
                        <div className="font-bold text-lg">{formatPrice(plan.price)}</div>
                        {plan.promo && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{plan.promo}</div>
                        )}
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
              
              {/* Contract */}
              <TableRow>
                <TableCell className="font-medium bg-neutral-50 dark:bg-neutral-900">
                  Contract Length
                </TableCell>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableCell key={i} className="text-center">
                      <Skeleton className="w-20 h-6 mx-auto" />
                    </TableCell>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const cellClass = isFirst ? "bg-primary-50/30 dark:bg-primary-950/10" : 
                                    isLast ? "bg-secondary-50/30 dark:bg-secondary-950/10" : 
                                    "bg-accent-50/30 dark:bg-accent-950/10";
                    
                    return (
                      <TableCell key={`${plan.id}-contract`} className={`${cellClass} text-center`}>
                        <div className="font-bold">
                          {plan.contractLength ? `${plan.contractLength} months` : "No Contract"}
                        </div>
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
              
              {/* Data Cap */}
              <TableRow>
                <TableCell className="font-medium bg-neutral-50 dark:bg-neutral-900">
                  Data Cap
                </TableCell>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableCell key={i} className="text-center">
                      <Skeleton className="w-20 h-6 mx-auto" />
                    </TableCell>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const cellClass = isFirst ? "bg-primary-50/30 dark:bg-primary-950/10" : 
                                    isLast ? "bg-secondary-50/30 dark:bg-secondary-950/10" : 
                                    "bg-accent-50/30 dark:bg-accent-950/10";
                    
                    return (
                      <TableCell key={`${plan.id}-data`} className={`${cellClass} text-center`}>
                        <div className="font-bold">
                          {plan.dataCap ? `${plan.dataCap} GB` : "Unlimited"}
                        </div>
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
              
              {/* Equipment Fee */}
              <TableRow>
                <TableCell className="font-medium bg-neutral-50 dark:bg-neutral-900">
                  Equipment Fee
                </TableCell>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableCell key={i} className="text-center">
                      <Skeleton className="w-20 h-6 mx-auto mb-1" />
                      <Skeleton className="w-24 h-3 mx-auto" />
                    </TableCell>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const cellClass = isFirst ? "bg-primary-50/30 dark:bg-primary-950/10" : 
                                    isLast ? "bg-secondary-50/30 dark:bg-secondary-950/10" : 
                                    "bg-accent-50/30 dark:bg-accent-950/10";
                    
                    return (
                      <TableCell key={`${plan.id}-equipment`} className={`${cellClass} text-center`}>
                        <div className="font-bold">
                          {plan.equipmentFee ? formatPrice(plan.equipmentFee) + '/month' : "Included"}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Wi-Fi router included
                        </div>
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
              
              {/* Installation */}
              <TableRow>
                <TableCell className="font-medium bg-neutral-50 dark:bg-neutral-900">
                  Installation
                </TableCell>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableCell key={i} className="text-center">
                      <Skeleton className="w-20 h-6 mx-auto mb-1" />
                      <Skeleton className="w-24 h-3 mx-auto" />
                    </TableCell>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const cellClass = isFirst ? "bg-primary-50/30 dark:bg-primary-950/10" : 
                                    isLast ? "bg-secondary-50/30 dark:bg-secondary-950/10" : 
                                    "bg-accent-50/30 dark:bg-accent-950/10";
                    
                    return (
                      <TableCell key={`${plan.id}-installation`} className={`${cellClass} text-center`}>
                        <div className="font-bold">
                          {plan.installationFee ? formatPrice(plan.installationFee) : "Free"}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Professional installation
                        </div>
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
              
              {/* Action Buttons */}
              <TableRow>
                <TableCell className="font-medium bg-neutral-50 dark:bg-neutral-900"></TableCell>
                {isLoadingPlans ? (
                  Array(selectedProviderIds.length).fill(0).map((_, i) => (
                    <TableCell key={i} className="text-center p-4">
                      <Skeleton className="w-full h-9" />
                    </TableCell>
                  ))
                ) : (
                  selectedPlans.map((plan, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedPlans.length - 1;
                    const cellClass = isFirst ? "bg-primary-50/30 dark:bg-primary-950/10" : 
                                     isLast ? "bg-secondary-50/30 dark:bg-secondary-950/10" : 
                                     "bg-accent-50/30 dark:bg-accent-950/10";
                    const buttonClass = isFirst ? "border-primary-500 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950/20" : 
                                        isLast ? "border-secondary-500 text-secondary-600 hover:bg-secondary-50 dark:border-secondary-400 dark:text-secondary-400 dark:hover:bg-secondary-950/20" : 
                                        "border-accent-500 text-accent-600 hover:bg-accent-50 dark:border-accent-400 dark:text-accent-400 dark:hover:bg-accent-950/20";
                    
                    return (
                      <TableCell key={`${plan.id}-action`} className={`${cellClass} text-center p-4`}>
                        <Button variant="outline" className={`w-full ${buttonClass}`}>
                          View Details
                        </Button>
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-8 text-center">
          {isLoadingProviders ? (
            <div className="space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p>Loading providers...</p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-display font-bold mb-2">No Providers Selected</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {zipCode ? "Select providers above to compare their plans" : "Enter your ZIP code to see available providers"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderComparisonTable;
