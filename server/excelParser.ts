import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises';
import { storage } from './storage';
import { InsertProvider, InsertCoverage } from '@shared/schema';

interface ProviderZipMap {
  [providerName: string]: Set<string>;
}

/**
 * Parses the Excel file containing ZIP code coverage data for internet providers
 * and loads it into the storage system
 */
export async function parseExcelData(filePath: string): Promise<void> {
  try {
    // Check if file exists
    const excelStats = await fs.stat(filePath);
    if (!excelStats.isFile()) {
      console.error(`Excel file not found at path: ${filePath}`);
      return;
    }
    
    console.log(`Reading Excel file from: ${filePath}`);
    
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Parse the Excel file
    const workbook = XLSX.read(fileBuffer);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // DEBUG: Log the first row to see the structure
    if (data.length > 0) {
      console.log("Excel file first row structure:", Object.keys(data[0] as object));
    }
    
    // Organize data by provider and ZIP
    const providerZipMap: ProviderZipMap = {};
    
    // Based on the logs, we now know the actual provider columns
    // The first row contains the provider names in certain columns
    // We need to fix the row detection since we're not adding ZIP codes properly
    
    // From looking at the first row columns, we need to update our approach
    // Let's manually define the providers we recognize in the data:
    const possibleProviderNames = [
      ' 201 ',     // Alta
      ' 730 ',     // Astound
      ' 6,153 ',   // ATT
      ' 533 ',     // Brightspeed
      ' 3,334 ',   // Earthlink
      ' 139 ',     // Fidium
      ' 1,560 ',   // Frontier
      ' 356 ',     // Metronet
      ' 2,076 ',   // Optimum
      ' 11,546 ',  // Spectrum
      ' 1,917 ',   // Windstream
      ' 336 ',     // WOW
      ' 424 '      // Ziply
    ];
    
    // Create providers with more recognizable names based on the header row
    const providerNameMap: Record<string, string> = {
      ' 201 ': 'Alta',
      ' 730 ': 'Astound',
      ' 6,153 ': 'ATT',
      ' 533 ': 'Brightspeed',
      ' 3,334 ': 'Earthlink',
      ' 139 ': 'Fidium',
      ' 1,560 ': 'Frontier',
      ' 356 ': 'Metronet',
      ' 2,076 ': 'Optimum',
      ' 11,546 ': 'Spectrum',
      ' 1,917 ': 'Windstream',
      ' 336 ': 'WOW',
      ' 424 ': 'Ziply'
    };
    
    // Initialize provider sets
    for (const providerColumn of possibleProviderNames) {
      const providerName = providerNameMap[providerColumn] || `Provider ${providerColumn.trim()}`;
      providerZipMap[providerName] = new Set<string>();
    }
    
    // We need to handle the first row separately because it contains the headers
    let isFirstRow = true;
    
    for (const row of data) {
      if (isFirstRow) {
        isFirstRow = false;
        continue; // Skip the header row
      }
      
      // Get the ZIP code from the __EMPTY field
      const zipCode = (row as any)['__EMPTY'];
      
      if (!zipCode || typeof zipCode !== 'number') {
        console.warn('Row missing valid ZIP code:', row);
        continue;
      }
      
      // Process each provider column from our identified list
      for (const providerColumn of possibleProviderNames) {
        const value = (row as any)[providerColumn];
        
        // If the value is greater than 0, consider the provider has service
        if (value && typeof value === 'number' && value > 0) {
          const providerName = providerNameMap[providerColumn] || `Provider ${providerColumn.trim()}`;
          providerZipMap[providerName].add(String(zipCode));
        }
      }
    }
    
    // Save providers and their coverage to storage
    for (const [providerName, zipCodes] of Object.entries(providerZipMap)) {
      // Create the provider
      const provider: InsertProvider = {
        name: providerName,
        logo: '', // Default empty, would be populated later
        website: '', // Default empty, would be populated later
      };
      
      const savedProvider = await storage.createProvider(provider);
      
      // Add coverage for each ZIP code
      for (const zipCode of Array.from(zipCodes)) {
        const coverage: InsertCoverage = {
          providerId: savedProvider.id,
          zipCode,
          hasService: true,
        };
        
        await storage.addCoverage(coverage);
      }
      
      console.log(`Added provider ${providerName} with ${zipCodes.size} ZIP codes`);
    }
    
    console.log('Excel data import completed successfully');
  } catch (error) {
    console.error('Error parsing Excel file:', error);
  }
}

// Function to initialize sample plan data
export async function initializeSamplePlans(): Promise<void> {
  try {
    const providers = await storage.getProviders();
    
    // Only add sample plans if providers exist
    if (providers.length === 0) {
      console.log('No providers to add plans for');
      return;
    }
    
    // Sample plan templates to assign to providers
    const planTemplates = [
      {
        name: "Basic",
        downloadSpeed: 100,
        uploadSpeed: 10,
        price: 3999, // $39.99
        contractLength: null,
        dataCap: null,
        equipmentFee: 1000, // $10.00
        installationFee: 9999, // $99.99
        features: ["Basic streaming", "Email & web browsing", "Wi-Fi router included"]
      },
      {
        name: "Standard",
        downloadSpeed: 300,
        uploadSpeed: 20,
        price: 5999, // $59.99
        contractLength: null,
        dataCap: null,
        equipmentFee: 1000,
        installationFee: 9999,
        features: ["HD streaming", "Multiple devices", "Wi-Fi router included", "Parental controls"]
      },
      {
        name: "Premium",
        downloadSpeed: 500,
        uploadSpeed: 50,
        price: 7999, // $79.99
        contractLength: null,
        dataCap: null,
        equipmentFee: 1000,
        installationFee: 9999,
        features: ["4K streaming", "Gaming", "Work from home", "Advanced security", "Wi-Fi router included"]
      },
      {
        name: "Gigabit",
        downloadSpeed: 1000,
        uploadSpeed: 100,
        price: 9999, // $99.99
        contractLength: null,
        dataCap: null,
        equipmentFee: 1000,
        installationFee: 9999,
        features: ["Gigabit speeds", "Multiple 4K streams", "Professional gaming", "Whole home coverage", "Premium Wi-Fi 6 router"]
      }
    ];
    
    // Add plans for each provider with slight variations
    for (const provider of providers) {
      for (const template of planTemplates) {
        // Add some variation based on provider
        const speedVariation = Math.floor(Math.random() * 50);
        const priceVariation = Math.floor(Math.random() * 1000); // Up to $10 variation
        
        await storage.createPlan({
          providerId: provider.id,
          name: `${provider.name} ${template.name}`,
          downloadSpeed: template.downloadSpeed + speedVariation,
          uploadSpeed: template.uploadSpeed + Math.floor(speedVariation / 2),
          price: template.price + priceVariation,
          promo: Math.random() > 0.5 ? `$${((template.price - 1000) / 100).toFixed(2)}/mo for first 12 months` : undefined,
          contractLength: template.contractLength,
          dataCap: template.dataCap,
          equipmentFee: template.equipmentFee,
          installationFee: template.installationFee,
          features: template.features
        });
      }
      
      console.log(`Added sample plans for provider: ${provider.name}`);
    }
    
    console.log('Sample plans initialized successfully');
  } catch (error) {
    console.error('Error initializing sample plans:', error);
  }
}
