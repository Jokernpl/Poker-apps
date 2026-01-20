/**
 * =====================================================
 * AUTHENTICATION MIDDLEWARE
 * =====================================================
 * JWT verification e protezione routes
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendi il type di Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

/**
 * Middleware: Verifica JWT token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(403).json({ error: 'Invalid or expired token', details: error.message });
  }
}

/**
 * Genera JWT access token
 */
export function generateAccessToken(userId: string, email: string, username: string): string {
  return jwt.sign(
    { id: userId, email, username },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );
}

/**
 * Genera JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me';
  return jwt.sign(
    { id: userId },
    REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
}

/**
 * Verifica refresh token
 */
export function verifyRefreshToken(token: string): { id: string } | null {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me';
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: string };
  } catch {
    return null;
  }
}

/**
 * Middleware: Solo Admin
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  // TODO: Implementare check admin nel database
  // Per ora, solo per struttura
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  
  if (!req.user || !adminEmails.includes(req.user.email)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  
  next();
}
