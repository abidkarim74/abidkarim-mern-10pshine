import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { CustomJwtPayload, AuthenticatedRequest, AuthenticatedUser } from '../interfaces/auth_interface';


export const verify_authentication = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

    if (!JWT_SECRET) {
      throw new Error("No access token key present in .env");
    }
    const authHeader = req.headers['authorization'];


    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'You are not authenticated!' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET as string) as AuthenticatedUser;

    if (!decoded.id || !decoded.username) {
      res.status(403).json({ message: 'Invalid token payload!' });
      return;
    }
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };
    next();
    
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Invalid or expired token!' });
  }
};