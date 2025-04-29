import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Provider table
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  website: text("website"),
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
});

// Coverage table to track which providers serve which ZIP codes
export const coverage = pgTable("coverage", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  zipCode: text("zip_code").notNull(),
  hasService: boolean("has_service").notNull().default(true),
});

export const insertCoverageSchema = createInsertSchema(coverage).omit({
  id: true,
});

// Plans that providers offer
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  name: text("name").notNull(),
  downloadSpeed: integer("download_speed").notNull(), // Mbps
  uploadSpeed: integer("upload_speed").notNull(), // Mbps
  price: integer("price").notNull(), // Stored in cents
  promo: text("promo"), // Promotional pricing info
  contractLength: integer("contract_length"), // In months, null = no contract
  dataCap: integer("data_cap"), // In GB, null = unlimited
  equipmentFee: integer("equipment_fee"), // Monthly fee in cents
  installationFee: integer("installation_fee"), // One-time fee in cents
  features: jsonb("features").$type<string[]>(), // Array of feature descriptions
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
});

// User preferences for recommendations
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  zipCode: text("zip_code").notNull(),
  usageType: text("usage_type").notNull(), // streaming, gaming, work, etc.
  userCount: integer("user_count").notNull(),
  prioritizeSpeed: boolean("prioritize_speed").default(false),
  prioritizePrice: boolean("prioritize_price").default(false),
  prioritizeReliability: boolean("prioritize_reliability").default(false),
  needsGaming: boolean("needs_gaming").default(false),
  needsStreaming: boolean("needs_streaming").default(false),
  needsVideoConferencing: boolean("needs_video_conferencing").default(false),
  streamingQuality: text("streaming_quality"), // SD, HD, 4K
  deviceCount: integer("device_count"),
  maxBudget: integer("max_budget"), // Max monthly budget in cents
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

// Original User model (keeping this to maintain backward compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Type exports
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type Coverage = typeof coverage.$inferSelect;
export type InsertCoverage = z.infer<typeof insertCoverageSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
