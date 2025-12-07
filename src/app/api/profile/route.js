import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import bcrypt from 'bcryptjs';

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

export async function GET(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, country, channelLink, currentPassword, newPassword } = body;

        await connectDB();
        const user = await User.findById(decoded.id).select('+password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update basic fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (country) user.country = country;
        if (channelLink) user.channelLink = channelLink;

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
            }

            // Verify current password
            // We need to fetch password explicitly as it is select: false
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }

            user.password = newPassword; // Will be hashed by pre-save hook
        }

        await user.save();

        // Return updated user without password
        const updatedUser = user.toObject();
        delete updatedUser.password;

        return NextResponse.json({ user: updatedUser, message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
