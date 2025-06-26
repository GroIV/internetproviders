import { eq, and, inArray } from 'drizzle-orm';
import { getDb } from './db';
import { 
  users, type User, type InsertUser,
  providers, type Provider, type InsertProvider,
  coverage, type Coverage, type InsertCoverage,
  plans, type Plan, type InsertPlan,
  userPreferences, type UserPreferences, type InsertUserPreferences
} from '../shared/schema';
import type { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  private get db() {
    return getDb();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }
  
  // Provider methods
  async getProviders(): Promise<Provider[]> {
    return await this.db.select().from(providers);
  }
  
  async getProvider(id: number): Promise<Provider | undefined> {
    const result = await this.db.select().from(providers).where(eq(providers.id, id));
    return result[0];
  }
  
  async createProvider(provider: InsertProvider): Promise<Provider> {
    const result = await this.db.insert(providers).values(provider).returning();
    return result[0];
  }
  
  async updateProvider(id: number, provider: Partial<InsertProvider>): Promise<Provider | undefined> {
    const result = await this.db.update(providers)
      .set(provider)
      .where(eq(providers.id, id))
      .returning();
    return result[0];
  }
  
  async deleteProvider(id: number): Promise<boolean> {
    const result = await this.db.delete(providers).where(eq(providers.id, id)).returning();
    return result.length > 0;
  }
  
  // Coverage methods
  async getProvidersByZipCode(zipCode: string): Promise<Provider[]> {
    const coverageResults = await this.db.select()
      .from(coverage)
      .where(and(
        eq(coverage.zipCode, zipCode),
        eq(coverage.hasService, true)
      ));
    
    if (coverageResults.length === 0) return [];
    
    const providerIds = coverageResults.map(c => c.providerId);
    return await this.db.select()
      .from(providers)
      .where(inArray(providers.id, providerIds));
  }
  
  async getZipCodesByProvider(providerId: number): Promise<string[]> {
    const results = await this.db.select()
      .from(coverage)
      .where(and(
        eq(coverage.providerId, providerId),
        eq(coverage.hasService, true)
      ));
    return results.map(r => r.zipCode);
  }
  
  async addCoverage(coverageData: InsertCoverage): Promise<Coverage> {
    const result = await this.db.insert(coverage).values(coverageData).returning();
    return result[0];
  }
  
  async removeCoverage(providerId: number, zipCode: string): Promise<boolean> {
    const result = await this.db.delete(coverage)
      .where(and(
        eq(coverage.providerId, providerId),
        eq(coverage.zipCode, zipCode)
      ))
      .returning();
    return result.length > 0;
  }
  
  // Plan methods
  async getPlans(providerId?: number): Promise<Plan[]> {
    if (providerId) {
      return await this.db.select().from(plans).where(eq(plans.providerId, providerId));
    }
    return await this.db.select().from(plans);
  }
  
  async getPlan(id: number): Promise<Plan | undefined> {
    const result = await this.db.select().from(plans).where(eq(plans.id, id));
    return result[0];
  }
  
  async getProviderPlans(providerId: number): Promise<Plan[]> {
    return await this.db.select().from(plans).where(eq(plans.providerId, providerId));
  }
  
  async createPlan(plan: InsertPlan): Promise<Plan> {
    const result = await this.db.insert(plans).values(plan as any).returning();
    return result[0];
  }
  
  async updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan | undefined> {
    const result = await this.db.update(plans)
      .set(plan as any)
      .where(eq(plans.id, id))
      .returning();
    return result[0];
  }
  
  async deletePlan(id: number): Promise<boolean> {
    const result = await this.db.delete(plans).where(eq(plans.id, id)).returning();
    return result.length > 0;
  }
  
  // User Preferences methods
  async getUserPreferences(id: number): Promise<UserPreferences | undefined> {
    const result = await this.db.select().from(userPreferences).where(eq(userPreferences.id, id));
    return result[0];
  }
  
  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const result = await this.db.insert(userPreferences).values(preferences).returning();
    return result[0];
  }
  
  async updateUserPreferences(id: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const result = await this.db.update(userPreferences)
      .set(preferences)
      .where(eq(userPreferences.id, id))
      .returning();
    return result[0];
  }
}

// Export a singleton instance
export const dbStorage = new DatabaseStorage(); 