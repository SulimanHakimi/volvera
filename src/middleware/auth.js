import { verifyToken } from '../utils/jwt';
import connectDB from '../lib/mongodb';
import User from '../models/User';

/**
 * Authenticate user from JWT token
 */
export const authenticate = async (req) => {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { authenticated: false, error: 'No token provided' };
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return { authenticated: false, error: 'Invalid or expired token' };
        }

        await connectDB();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user || !user.isActive) {
            return { authenticated: false, error: 'User not found or inactive' };
        }

        return {
            authenticated: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return { authenticated: false, error: 'Authentication failed' };
    }
};

/**
 * Check if user is admin
 */
export const isAdmin = (user) => {
    return user && user.role === 'admin';
};

/**
 * Middleware wrapper for API routes
 */
export const withAuth = (handler) => {
    return async (req, context) => {
        const auth = await authenticate(req);

        if (!auth.authenticated) {
            return new Response(
                JSON.stringify({ error: auth.error || 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Attach user to request
        req.user = auth.user;
        return handler(req, context);
    };
};

/**
 * Admin-only middleware
 */
export const withAdminAuth = (handler) => {
    return async (req, context) => {
        const auth = await authenticate(req);

        if (!auth.authenticated) {
            return new Response(
                JSON.stringify({ error: auth.error || 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!isAdmin(auth.user)) {
            return new Response(
                JSON.stringify({ error: 'Admin access required' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        req.user = auth.user;
        return handler(req, context);
    };
};
