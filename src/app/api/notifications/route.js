import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';


const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

export async function GET(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await connectDB();

        const notifications = await Notification.find({ user: decoded.id })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({ user: decoded.id, isRead: false });

        return NextResponse.json({ notifications, unreadCount });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        await Notification.updateMany(
            { user: decoded.id, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
