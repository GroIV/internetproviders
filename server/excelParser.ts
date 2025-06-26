import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises';
import { getStorage } from './storageFactory';
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
    // Get storage instance
    const storage = await getStorage();
    
    // Check if file exists
    try {
      const excelStats = await fs.stat(filePath);
      if (!excelStats.isFile()) {
        console.error(`Excel file not found at path: ${filePath}`);
        return;
      }
    } catch (error) {
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
    
    // Convert to JSON with header option
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (data.length < 2) {
      console.error('Excel file does not have enough data');
      return;
    }
    
    // First row contains headers
    const headers = data[0];
    console.log('Excel headers:', headers);
    
    // Find ZIP code column (usually the first column)
    let zipCodeIndex = 0;
    
    // Provider name mapping - more flexible approach
    const providerColumns: Map<number, string> = new Map();
    
    // Detect provider columns (skip the ZIP code column)
    for (let i = 1; i < headers.length; i++) {
      const header = String(headers[i]).trim();
      
      // Try to detect provider names from headers
      let providerName = '';
      
      // Common provider name patterns
      if (header.toLowerCase().includes('alta')) providerName = 'Alta';
      else if (header.toLowerCase().includes('astound')) providerName = 'Astound';
      else if (header.toLowerCase().includes('at&t') || header.toLowerCase().includes('att')) providerName = 'AT&T';
      else if (header.toLowerCase().includes('brightspeed')) providerName = 'Brightspeed';
      else if (header.toLowerCase().includes('earthlink')) providerName = 'Earthlink';
      else if (header.toLowerCase().includes('fidium')) providerName = 'Fidium';
      else if (header.toLowerCase().includes('frontier')) providerName = 'Frontier';
      else if (header.toLowerCase().includes('metronet')) providerName = 'Metronet';
      else if (header.toLowerCase().includes('optimum')) providerName = 'Optimum';
      else if (header.toLowerCase().includes('spectrum')) providerName = 'Spectrum';
      else if (header.toLowerCase().includes('windstream')) providerName = 'Windstream';
      else if (header.toLowerCase().includes('wow')) providerName = 'WOW';
      else if (header.toLowerCase().includes('ziply')) providerName = 'Ziply';
      else if (header.toLowerCase().includes('verizon')) providerName = 'Verizon';
      else if (header.toLowerCase().includes('cox')) providerName = 'Cox';
      else if (header.toLowerCase().includes('xfinity') || header.toLowerCase().includes('comcast')) providerName = 'Xfinity';
      else if (header && header !== '__EMPTY' && !header.match(/^\d+$/)) {
        // Use the header as provider name if it's not empty or just numbers
        providerName = header;
      }
      
      if (providerName) {
        providerColumns.set(i, providerName);
      }
    }
    
    console.log(`Found ${providerColumns.size} provider columns`);
    
    // Initialize provider map
    const providerZipMap: ProviderZipMap = {};
    Array.from(providerColumns.values()).forEach(providerName => {
      providerZipMap[providerName] = new Set<string>();
    });
    
    // Process data rows (skip header row)
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      // Get ZIP code
      const zipCode = String(row[zipCodeIndex] || '').trim();
      
      // Validate ZIP code
      if (!zipCode || !/^\d{5}$/.test(zipCode)) {
        continue;
      }
      
      // Check each provider column
      Array.from(providerColumns.entries()).forEach(([colIndex, providerName]) => {
        const value = row[colIndex];
        
        // If there's any non-empty value, consider the provider has service
        if (value !== undefined && value !== null && value !== '' && value !== 0) {
          providerZipMap[providerName].add(zipCode);
        }
      });
    }
    
    // Clear existing data (optional - remove if you want to append)
    console.log('Clearing existing provider data...');
    const existingProviders = await storage.getProviders();
    for (const provider of existingProviders) {
      await storage.deleteProvider(provider.id);
    }
    
    // Save providers and their coverage to storage
    for (const [providerName, zipCodes] of Object.entries(providerZipMap)) {
      if (zipCodes.size === 0) {
        console.log(`Skipping provider ${providerName} - no coverage areas found`);
        continue;
      }
      
      // Create the provider with proper logo URLs
      const provider: InsertProvider = {
        name: providerName,
        logo: getProviderLogoUrl(providerName),
        website: getProviderWebsite(providerName),
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

// Helper function to get provider logo URLs
function getProviderLogoUrl(providerName: string): string {
  const name = providerName.toLowerCase();
  
  // Return actual logo URLs for major providers
  if (name.includes('xfinity') || name.includes('comcast')) {
    return 'https://corporate.comcast.com/images/comcast-logo.png';
  } else if (name.includes('spectrum')) {
    return 'https://www.spectrum.com/content/dam/spectrum/residential/en/images/spectrum-logo.svg';
  } else if (name.includes('at&t') || name === 'att') {
    return 'https://www.att.com/ecms/dam/att/consumer/global/logos/att_globe_500x500.jpg';
  } else if (name.includes('verizon')) {
    return 'https://www.verizon.com/content/dam/verizon/personal/v-logo.svg';
  } else if (name.includes('cox')) {
    return 'https://www.cox.com/content/dam/cox/images/logos/cox-logo.svg';
  }
  
  // For others, return empty string and let the frontend handle it
  return '';
}

// Helper function to get provider websites
function getProviderWebsite(providerName: string): string {
  const name = providerName.toLowerCase();
  
  if (name.includes('xfinity') || name.includes('comcast')) return 'https://www.xfinity.com';
  if (name.includes('spectrum')) return 'https://www.spectrum.com';
  if (name.includes('at&t') || name === 'att') return 'https://www.att.com';
  if (name.includes('verizon')) return 'https://www.verizon.com';
  if (name.includes('cox')) return 'https://www.cox.com';
  if (name.includes('frontier')) return 'https://www.frontier.com';
  if (name.includes('centurylink')) return 'https://www.centurylink.com';
  if (name.includes('windstream')) return 'https://www.windstream.com';
  if (name.includes('optimum')) return 'https://www.optimum.com';
  if (name.includes('earthlink')) return 'https://www.earthlink.net';
  
  return '';
}

// Function to initialize sample plan data
export async function initializeSamplePlans(): Promise<void> {
  try {
    // Get storage instance
    const storage = await getStorage();
    
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
