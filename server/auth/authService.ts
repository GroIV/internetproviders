import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { getStorage } from '../storageFactory';
import type { User, InsertUser } from '@shared/schema';

// Initialize passport
export function initializePassport() {
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const storage = await getStorage();
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const storage = await getStorage();
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Authentication service
export class AuthService {
  static async register(userData: { username: string; password: string }): Promise<User> {
    const storage = await getStorage();
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const newUser: InsertUser = {
      username: userData.username,
      password: hashedPassword
    };
    
    return await storage.createUser(newUser);
  }
  
  static async login(username: string, password: string): Promise<User | null> {
    const storage = await getStorage();
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }
    
    return user;
  }
  
  static async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const storage = await getStorage();
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password (would need to add this method to storage)
    // For now, return true as placeholder
    return true;
  }
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}

// Middleware to check if user is admin
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
} 