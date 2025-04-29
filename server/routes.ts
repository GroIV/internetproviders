import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseExcelData, initializeSamplePlans } from "./excelParser";
import { insertProviderSchema, insertPlanSchema, insertUserPreferencesSchema } from "@shared/schema";
import path from "path";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Import excel data if available
  const excelFilePath = path.resolve(process.cwd(), "attached_assets/DCS internet zip list 2025  4-8-25.xlsx");
  try {
    await parseExcelData(excelFilePath);
    await initializeSamplePlans();
  } catch (error) {
    console.error("Error initializing data:", error);
  }

  // Provider endpoints
  app.get("/api/providers", async (req: Request, res: Response) => {
    const providers = await storage.getProviders();
    res.json(providers);
  });

  app.get("/api/providers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid provider ID" });
    }
    
    const provider = await storage.getProvider(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    
    res.json(provider);
  });

  app.post("/api/providers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProviderSchema.parse(req.body);
      const provider = await storage.createProvider(validatedData);
      res.status(201).json(provider);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid provider data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create provider" });
    }
  });

  // ZIP code lookup endpoint
  app.get("/api/coverage/:zipCode", async (req: Request, res: Response) => {
    const zipCode = req.params.zipCode;
    
    // Validate ZIP code format
    if (!/^\d{5}$/.test(zipCode)) {
      return res.status(400).json({ message: "Invalid ZIP code format" });
    }
    
    const providers = await storage.getProvidersByZipCode(zipCode);
    res.json(providers);
  });

  // Plans endpoints
  app.get("/api/plans", async (req: Request, res: Response) => {
    const providerId = req.query.providerId ? parseInt(req.query.providerId as string) : undefined;
    
    if (req.query.providerId && isNaN(providerId!)) {
      return res.status(400).json({ message: "Invalid provider ID" });
    }
    
    const plans = await storage.getPlans(providerId);
    res.json(plans);
  });

  app.get("/api/plans/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }
    
    const plan = await storage.getPlan(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    
    res.json(plan);
  });

  app.post("/api/plans", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create plan" });
    }
  });

  // Recommendation endpoint
  app.post("/api/recommendations", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserPreferencesSchema.parse(req.body);
      
      // Save the user preferences
      const preferences = await storage.createUserPreferences(validatedData);
      
      // Get providers for the ZIP code
      const providers = await storage.getProvidersByZipCode(preferences.zipCode);
      
      if (providers.length === 0) {
        return res.json({ 
          message: "No providers available in your area", 
          recommendations: [] 
        });
      }
      
      // Get all plans from these providers
      const providerPlans = [];
      for (const provider of providers) {
        const plans = await storage.getProviderPlans(provider.id);
        providerPlans.push(...plans.map(plan => ({ ...plan, provider })));
      }
      
      if (providerPlans.length === 0) {
        return res.json({ 
          message: "No plans available from providers in your area", 
          recommendations: [] 
        });
      }
      
      // Simple recommendation algorithm
      let recommendedPlans = [...providerPlans];
      
      // Filter based on user needs
      if (preferences.needsGaming || preferences.needsVideoConferencing) {
        // Gaming and video conferencing need lower latency and higher upload speeds
        recommendedPlans = recommendedPlans.filter(plan => plan.uploadSpeed >= 20);
      }
      
      if (preferences.needsStreaming) {
        // For 4K streaming, recommend higher download speeds
        if (preferences.streamingQuality === '4K') {
          recommendedPlans = recommendedPlans.filter(plan => plan.downloadSpeed >= 25 * preferences.userCount);
        } 
        // For HD streaming
        else if (preferences.streamingQuality === 'HD') {
          recommendedPlans = recommendedPlans.filter(plan => plan.downloadSpeed >= 5 * preferences.userCount);
        }
      }
      
      // Sort based on user priorities
      if (preferences.prioritizeSpeed) {
        recommendedPlans.sort((a, b) => b.downloadSpeed - a.downloadSpeed);
      } else if (preferences.prioritizePrice) {
        recommendedPlans.sort((a, b) => a.price - b.price);
      }
      
      // Filter by budget if specified
      if (preferences.maxBudget && preferences.maxBudget > 0) {
        recommendedPlans = recommendedPlans.filter(plan => plan.price <= preferences.maxBudget!);
      }
      
      // Return the top recommendations (up to 5)
      const topRecommendations = recommendedPlans.slice(0, 5);
      
      res.json({
        message: "Based on your preferences, here are our recommendations",
        recommendations: topRecommendations
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preference data", errors: error.errors });
      }
      console.error("Recommendation error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Compare plans endpoint
  app.get("/api/compare", async (req: Request, res: Response) => {
    try {
      const planIds = req.query.planIds as string;
      
      if (!planIds) {
        return res.status(400).json({ message: "No plan IDs provided" });
      }
      
      const ids = planIds.split(',').map(id => parseInt(id));
      
      if (ids.some(id => isNaN(id))) {
        return res.status(400).json({ message: "Invalid plan ID format" });
      }
      
      const plans = [];
      for (const id of ids) {
        const plan = await storage.getPlan(id);
        if (plan) {
          const provider = await storage.getProvider(plan.providerId);
          plans.push({ ...plan, provider });
        }
      }
      
      if (plans.length === 0) {
        return res.status(404).json({ message: "No plans found with the provided IDs" });
      }
      
      res.json(plans);
    } catch (error) {
      console.error("Compare plans error:", error);
      res.status(500).json({ message: "Failed to compare plans" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
