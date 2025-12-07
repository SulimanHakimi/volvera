// app/api/notifications/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const getUserId = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) throw new Error('Missing token');
    const decoded = verifyToken(token);
    if (!decoded?.id) throw new Error('Invalid token payload');
    return decoded.id;
};

export async function GET(request) {
    try {
        const userId = getUserId(request);
        await connectDB();

        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),
            Notification.countDocuments({ user: userId, isRead: false })
        ]);

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        if (error.message.includes('token') || error.message.includes('jwt')) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid or expired token' },
                { status: 401 }
            );
        }
        console.error('GET /api/notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const userId = getUserId(request); // throws if invalid/expired
        await connectDB();

        await Notification.updateMany(
            { user: userId, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error.message.includes('token') || error.message.includes('jwt')) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid or expired token' },
                { status: 401 }
            );
        }
        console.error('PUT /api/notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to mark notifications as read' },
            { status: 500 }
        );
    }
}