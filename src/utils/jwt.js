// utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Sign a token
 */
export const signToken = (payload, expiresIn = '7d') => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify access token - throws on invalid/expired
 */
export const verifyToken = (token) => {
    if (!token) throw new Error('No token provided');
    if (!JWT_SECRET) throw new Error('JWT_SECRET is missing');

    return jwt.verify(token, JWT_SECRET); // Let it throw naturally
};

export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1] || null;
};