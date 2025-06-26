import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { getStorage } from "./storageFactory";
import { parseExcelData, initializeSamplePlans } from "./excelParser";
import { insertProviderSchema, insertPlanSchema, insertUserPreferencesSchema, insertUserSchema } from "@shared/schema";
import path from "path";
import { z } from "zod";
import { getZipFromCoordinates } from "./geocoding";
import { getAIService } from "./ai/aiService";
import { initializePassport, AuthService, isAuthenticated } from "./auth/authService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  initializePassport();

  // Get storage instance
  const storage = await getStorage();

  // Import excel data if available (skip for now to improve startup time)
  const skipExcelImport = process.env.SKIP_EXCEL_IMPORT === 'true';
  if (!skipExcelImport) {
    const excelFilePath = path.resolve(process.cwd(), "attached_assets/DCS internet zip list 2025  4-8-25.xlsx");
    // Run Excel import in background to not block server startup
    setTimeout(async () => {
      try {
        console.log("Starting background Excel data import...");
        await parseExcelData(excelFilePath);
        await initializeSamplePlans();
        console.log("Excel data import completed");
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    }, 1000);
  }

  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await AuthService.register(validatedData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        message: "Registration successful",
        user: userWithoutPassword 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      if (error instanceof Error && error.message === 'Username already exists') {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        return res.json({ 
          message: "Login successful",
          user: userWithoutPassword 
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Remove password from response
    const user = req.user as any;
    const { password, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword });
  });

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

  // Geocoding endpoint
  app.post("/api/geocode/reverse", async (req: Request, res: Response) => {
    try {
      const { lat, lon } = req.body;
      
      if (!lat || !lon || typeof lat !== 'number' || typeof lon !== 'number') {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      
      const zipCode = await getZipFromCoordinates(lat, lon);
      
      if (zipCode) {
        res.json({ zipCode });
      } else {
        res.status(404).json({ message: "Could not determine ZIP code from coordinates" });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ message: "Geocoding service error" });
    }
  });

  // ZIP code boundary endpoint (for map visualization)
  app.get("/api/zipcode/:zipCode/boundary", async (req: Request, res: Response) => {
    try {
      const { zipCode } = req.params;
      
      // Validate ZIP code format
      if (!/^\d{5}$/.test(zipCode)) {
        return res.status(400).json({ message: "Invalid ZIP code format" });
      }
      
      // For now, return center point and estimated radius
      // In production, you would fetch actual ZIP code boundaries from a GIS service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=USA&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'InternetProviderAnalytics/1.0'
          }
        }
      );
      
      const data = await response.json() as any[];
      
      if (data && data.length > 0) {
        const location = data[0];
        res.json({
          zipCode,
          center: {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon)
          },
          boundingBox: location.boundingbox ? {
            north: parseFloat(location.boundingbox[1]),
            south: parseFloat(location.boundingbox[0]),
            east: parseFloat(location.boundingbox[3]),
            west: parseFloat(location.boundingbox[2])
          } : null,
          displayName: location.display_name
        });
      } else {
        res.status(404).json({ message: "ZIP code not found" });
      }
    } catch (error) {
      console.error("ZIP boundary error:", error);
      res.status(500).json({ message: "Failed to fetch ZIP code boundary" });
    }
  });

  // AI Assistant endpoint
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid message" });
      }
      
      const aiService = getAIService();
      
      if (!aiService) {
        // Fallback to simple responses if AI is not configured
        const fallbackResponse = getFallbackResponse(message);
        return res.json({ 
          message: fallbackResponse,
          isAI: false 
        });
      }
      
      // Use AI service to generate response
      const response = await aiService.answerInternetQuestion(message, context);
      
      res.json({
        message: response.message,
        isAI: true,
        error: response.error
      });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ 
        message: "Failed to generate response",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}

// Fallback responses when AI is not available
function getFallbackResponse(input: string): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('fiber') || lowerInput.includes('cable') || lowerInput.includes('dsl')) {
    return "Fiber offers the fastest speeds (up to 1 Gbps or more) with symmetrical upload/download, cable provides good speeds (50-500 Mbps) but asymmetrical performance, while DSL is slower (5-100 Mbps) but often more widely available in rural areas.";
  } else if (lowerInput.includes('speed') || lowerInput.includes('fast')) {
    return "For basic web browsing and email, 25 Mbps is sufficient. For HD streaming, aim for 50 Mbps. For multiple users or 4K streaming, 100+ Mbps is recommended. For gaming and large file transfers, 300+ Mbps provides the best experience.";
  } else if (lowerInput.includes('gaming')) {
    return "For gaming, low latency (ping) is often more important than raw speed. Look for plans with ping under 50ms. Fiber connections typically offer the best latency. I'd recommend at least 100 Mbps download and 10 Mbps upload for gaming while others use the network.";
  } else if (lowerInput.includes('streaming') || lowerInput.includes('netflix') || lowerInput.includes('youtube')) {
    return "For streaming video: SD quality needs 3-5 Mbps, HD needs 5-10 Mbps, and 4K needs 25-35 Mbps per stream. If multiple people stream simultaneously, add these requirements together.";
  } else if (lowerInput.includes('router') || lowerInput.includes('wifi')) {
    return "For the best Wi-Fi coverage, place your router centrally in your home, elevated if possible. Avoid placing it near metal objects, microwaves, or thick walls. Consider a mesh network system for larger homes. Make sure to use a secure password and WPA3 encryption if available.";
  } else {
    return "I'd be happy to help with your internet service questions. You can ask me about choosing between providers, understanding internet technologies, troubleshooting connection issues, or optimizing your home network.";
  }
}
