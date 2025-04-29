import { apiRequest } from "@/lib/queryClient";

export interface Provider {
  id: number;
  name: string;
  logo?: string;
  website?: string;
}

export interface Plan {
  id: number;
  providerId: number;
  name: string;
  downloadSpeed: number;
  uploadSpeed: number;
  price: number;
  promo?: string;
  contractLength?: number | null;
  dataCap?: number | null;
  equipmentFee?: number | null;
  installationFee?: number | null;
  features?: string[];
  provider?: Provider;
}

export interface UserPreferences {
  zipCode: string;
  usageType: string;
  userCount: number;
  prioritizeSpeed?: boolean;
  prioritizePrice?: boolean;
  prioritizeReliability?: boolean;
  needsGaming?: boolean;
  needsStreaming?: boolean;
  needsVideoConferencing?: boolean;
  streamingQuality?: string;
  deviceCount?: number;
  maxBudget?: number;
}

export interface RecommendationResponse {
  message: string;
  recommendations: Plan[];
}

// Format price from cents to dollars
export const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Format speed with unit
export const formatSpeed = (speed: number) => {
  return `${speed} Mbps`;
};

// Get provider logo by name (placeholder logic)
export const getProviderLogo = (name: string): string => {
  // This would normally use real logos, but for now we'll return placeholder icons
  // In a real implementation, you would have a map of provider names to logo paths or URLs
  const normalizedName = name.toLowerCase();
  
  if (normalizedName.includes('xfinity') || normalizedName.includes('comcast')) {
    return 'https://via.placeholder.com/150/FF7F00/FFFFFF?text=Xfinity';
  } else if (normalizedName.includes('spectrum')) {
    return 'https://via.placeholder.com/150/0077C8/FFFFFF?text=Spectrum';
  } else if (normalizedName.includes('at&t') || normalizedName.includes('att')) {
    return 'https://via.placeholder.com/150/009FDB/FFFFFF?text=AT%26T';
  } else if (normalizedName.includes('verizon')) {
    return 'https://via.placeholder.com/150/CD040B/FFFFFF?text=Verizon';
  } else if (normalizedName.includes('cox')) {
    return 'https://via.placeholder.com/150/3395FF/FFFFFF?text=Cox';
  } else if (normalizedName.includes('centurylink')) {
    return 'https://via.placeholder.com/150/00853F/FFFFFF?text=CenturyLink';
  } else {
    // Default placeholder for any other provider
    return `https://via.placeholder.com/150/6C757D/FFFFFF?text=${encodeURIComponent(name.substring(0, 10))}`;
  }
};

// Get plans by provider
export const getProviderPlans = async (providerId: number): Promise<Plan[]> => {
  const res = await apiRequest('GET', `/api/plans?providerId=${providerId}`);
  return await res.json();
};

// Get providers by ZIP code
export const getProvidersByZip = async (zipCode: string): Promise<Provider[]> => {
  const res = await apiRequest('GET', `/api/coverage/${zipCode}`);
  return await res.json();
};

// Submit preferences and get recommendations
export const getRecommendations = async (preferences: UserPreferences): Promise<RecommendationResponse> => {
  const res = await apiRequest('POST', '/api/recommendations', preferences);
  return await res.json();
};

// Compare specific plans
export const comparePlans = async (planIds: number[]): Promise<Plan[]> => {
  const res = await apiRequest('GET', `/api/compare?planIds=${planIds.join(',')}`);
  return await res.json();
};
