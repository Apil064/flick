import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { Request, Response, NextFunction } from 'express';

// This middleware will add auth info to the request
export const authMiddleware = ClerkExpressWithAuth();

// Optional: Strict middleware that requires a user to be logged in
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore - Clerk adds auth to request
  if (!req.auth?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
