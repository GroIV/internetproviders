import { 
  users, type User, type InsertUser,
  providers, type Provider, type InsertProvider,
  coverage, type Coverage, type InsertCoverage,
  plans, type Plan, type InsertPlan,
  userPreferences, type UserPreferences, type InsertUserPreferences
} from "@shared/schema";

// Expanded storage interface with CRUD methods for the new models
export interface IStorage {
  // User methods (original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Provider methods
  getProviders(): Promise<Provider[]>;
  getProvider(id: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, provider: Partial<InsertProvider>): Promise<Provider | undefined>;
  deleteProvider(id: number): Promise<boolean>;
  
  // Coverage methods
  getProvidersByZipCode(zipCode: string): Promise<Provider[]>;
  getZipCodesByProvider(providerId: number): Promise<string[]>;
  addCoverage(coverage: InsertCoverage): Promise<Coverage>;
  removeCoverage(providerId: number, zipCode: string): Promise<boolean>;
  
  // Plan methods
  getPlans(providerId?: number): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  getProviderPlans(providerId: number): Promise<Plan[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: number): Promise<boolean>;
  
  // User Preferences methods
  getUserPreferences(id: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(id: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private providers: Map<number, Provider>;
  private coverageData: Map<string, Set<number>>; // zipCode -> Set of providerIds
  private plans: Map<number, Plan>;
  private userPreferencesData: Map<number, UserPreferences>;
  
  private currentUserId: number;
  private currentProviderId: number;
  private currentCoverageId: number;
  private currentPlanId: number;
  private currentUserPreferencesId: number;
  
  constructor() {
    this.users = new Map();
    this.providers = new Map();
    this.coverageData = new Map();
    this.plans = new Map();
    this.userPreferencesData = new Map();
    
    this.currentUserId = 1;
    this.currentProviderId = 1;
    this.currentCoverageId = 1;
    this.currentPlanId = 1;
    this.currentUserPreferencesId = 1;
  }
  
  // User methods (original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Provider methods
  async getProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values());
  }
  
  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }
  
  async createProvider(provider: InsertProvider): Promise<Provider> {
    const id = this.currentProviderId++;
    const newProvider: Provider = { 
      ...provider, 
      id,
      logo: provider.logo ?? null, 
      website: provider.website ?? null 
    };
    this.providers.set(id, newProvider);
    return newProvider;
  }
  
  async updateProvider(id: number, provider: Partial<InsertProvider>): Promise<Provider | undefined> {
    const existingProvider = this.providers.get(id);
    if (!existingProvider) return undefined;
    
    const updatedProvider = { ...existingProvider, ...provider };
    this.providers.set(id, updatedProvider);
    return updatedProvider;
  }
  
  async deleteProvider(id: number): Promise<boolean> {
    return this.providers.delete(id);
  }
  
  // Coverage methods
  async getProvidersByZipCode(zipCode: string): Promise<Provider[]> {
    const providerIds = this.coverageData.get(zipCode) || new Set();
    return Array.from(providerIds).map(id => this.providers.get(id)).filter(Boolean) as Provider[];
  }
  
  async getZipCodesByProvider(providerId: number): Promise<string[]> {
    const zipCodes: string[] = [];
    this.coverageData.forEach((providerIds, zipCode) => {
      if (providerIds.has(providerId)) {
        zipCodes.push(zipCode);
      }
    });
    return zipCodes;
  }
  
  async addCoverage(coverageData: InsertCoverage): Promise<Coverage> {
    const id = this.currentCoverageId++;
    const newCoverage: Coverage = { 
      ...coverageData, 
      id,
      hasService: coverageData.hasService ?? true 
    };
    
    if (!this.coverageData.has(coverageData.zipCode)) {
      this.coverageData.set(coverageData.zipCode, new Set());
    }
    
    this.coverageData.get(coverageData.zipCode)!.add(coverageData.providerId);
    return newCoverage;
  }
  
  async removeCoverage(providerId: number, zipCode: string): Promise<boolean> {
    const providerIds = this.coverageData.get(zipCode);
    if (!providerIds) return false;
    
    return providerIds.delete(providerId);
  }
  
  // Plan methods
  async getPlans(providerId?: number): Promise<Plan[]> {
    const allPlans = Array.from(this.plans.values());
    if (providerId) {
      return allPlans.filter(plan => plan.providerId === providerId);
    }
    return allPlans;
  }
  
  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }
  
  async getProviderPlans(providerId: number): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter(plan => plan.providerId === providerId);
  }
  
  async createPlan(plan: InsertPlan): Promise<Plan> {
    const id = this.currentPlanId++;
    
    // Convert features to proper string array or null
    let planFeatures: string[] | null = null;
    if (plan.features) {
      if (Array.isArray(plan.features)) {
        planFeatures = plan.features.map(f => String(f));
      }
    }
    
    const newPlan: Plan = { 
      ...plan, 
      id,
      promo: plan.promo ?? null,
      contractLength: plan.contractLength ?? null,
      dataCap: plan.dataCap ?? null,
      equipmentFee: plan.equipmentFee ?? null,
      installationFee: plan.installationFee ?? null,
      features: planFeatures
    };
    this.plans.set(id, newPlan);
    return newPlan;
  }
  
  async updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan | undefined> {
    const existingPlan = this.plans.get(id);
    if (!existingPlan) return undefined;
    
    // Process features similarly to createPlan
    let updatedFeatures = existingPlan.features;
    if (plan.features !== undefined) {
      if (plan.features === null) {
        updatedFeatures = null;
      } else if (Array.isArray(plan.features)) {
        updatedFeatures = plan.features.map(f => String(f));
      }
    }
    
    const updatedPlan: Plan = { 
      ...existingPlan, 
      ...plan,
      features: updatedFeatures
    };
    
    this.plans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  async deletePlan(id: number): Promise<boolean> {
    return this.plans.delete(id);
  }
  
  // User Preferences methods
  async getUserPreferences(id: number): Promise<UserPreferences | undefined> {
    return this.userPreferencesData.get(id);
  }
  
  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.currentUserPreferencesId++;
    const newPreferences: UserPreferences = { 
      ...preferences, 
      id,
      prioritizeSpeed: preferences.prioritizeSpeed ?? null,
      prioritizePrice: preferences.prioritizePrice ?? null,
      prioritizeReliability: preferences.prioritizeReliability ?? null,
      needsGaming: preferences.needsGaming ?? null,
      needsStreaming: preferences.needsStreaming ?? null,
      needsVideoConferencing: preferences.needsVideoConferencing ?? null,
      streamingQuality: preferences.streamingQuality ?? null,
      deviceCount: preferences.deviceCount ?? null,
      maxBudget: preferences.maxBudget ?? null
    };
    this.userPreferencesData.set(id, newPreferences);
    return newPreferences;
  }
  
  async updateUserPreferences(id: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const existingPreferences = this.userPreferencesData.get(id);
    if (!existingPreferences) return undefined;
    
    const updatedPreferences = { ...existingPreferences, ...preferences };
    this.userPreferencesData.set(id, updatedPreferences);
    return updatedPreferences;
  }
}

export const storage = new MemStorage();
