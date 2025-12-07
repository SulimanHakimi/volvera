// app/api/notifications/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

// PATCH - Mark notification as read
export async function PATCH(request, { params }) {
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        await connectDB();

        const notification = await Notification.findById(id);
        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        // Check ownership
        if (notification.user.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update notification
        notification.read = body.read !== undefined ? body.read : notification.read;
        await notification.save();

        return NextResponse.json({
            success: true,
            notification
        });

    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}

// DELETE - Delete notification
export async function DELETE(request, { params }) {
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();

        const notification = await Notification.findById(id);
        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        // Check ownership
        if (notification.user.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Notification.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Notification deleted'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
}
