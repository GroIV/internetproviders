import { IStorage, MemStorage } from './storage';
import { DatabaseStorage } from './dbStorage';
import { testConnection } from './db';

let storageInstance: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // Check if we have a database URL
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  No DATABASE_URL found, using in-memory storage');
    console.log('   This is fine for development, but data will be lost on restart');
    storageInstance = new MemStorage();
    return storageInstance;
  }

  // Try to connect to the database
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Using database storage');
    storageInstance = new DatabaseStorage();
  } else {
    console.log('⚠️  Database connection failed, falling back to in-memory storage');
    storageInstance = new MemStorage();
  }

  return storageInstance;
} 