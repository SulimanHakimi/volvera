import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticateAdmin = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
};

export async function POST(request) {
    try {
        const decoded = authenticateAdmin(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { targetUserId, title, message, type } = await request.json();

        if (!title || !message) {
            return NextResponse.json({ error: 'Missing title or message' }, { status: 400 });
        }

        await connectDB();

        if (targetUserId === 'all') {
            const users = await User.find({ role: 'user' }, '_id');
            const notifications = users.map(user => ({
                user: user._id,
                title,
                message,
                type: type || 'admin_message',
            }));
            await Notification.insertMany(notifications);
            return NextResponse.json({ message: `Sent to ${notifications.length} users` });
        } else {
            const notification = new Notification({
                user: targetUserId,
                title,
                message,
                type: type || 'admin_message',
            });
            await notification.save();
            return NextResponse.json({ message: 'Notification sent', notification });
        }

    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
