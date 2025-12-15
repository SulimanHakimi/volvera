import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

export async function PATCH(request, { params }) {
    try {
        const decoded = authenticate(request);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        await connectDB();

        const targetUser = await User.findById(id);

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const MAIN_ADMIN_EMAIL = 'nor.volvera@gmail.com';
        const isTargetMainAdmin = targetUser.email === MAIN_ADMIN_EMAIL;
        const isActorMainAdmin = decoded.email === MAIN_ADMIN_EMAIL;

        // Protection 1: Nobody can demote or deactivate the Main Admin
        if (isTargetMainAdmin) {
            if ((body.role && body.role !== 'admin') || body.isActive === false) {
                return NextResponse.json({ error: 'Cannot modify main admin critical status' }, { status: 403 });
            }
        }

        // Protection 2: Only Main Admin can manage Admin roles (promote/demote)
        if (body.role) {
            if (!isActorMainAdmin) {
                if (targetUser.role === 'admin' || body.role === 'admin') {
                    return NextResponse.json({ error: 'Only the main admin can manage admin roles' }, { status: 403 });
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');

        return NextResponse.json({ user: updatedUser });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const decoded = authenticate(request);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();
        const userToDelete = await User.findById(id);

        if (!userToDelete) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (userToDelete.email === 'nor.volvera@gmail.com') {
            return NextResponse.json({ error: 'Cannot delete the main admin account' }, { status: 403 });
        }

        await User.findByIdAndDelete(id);

        return NextResponse.json({ message: 'User deleted' });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
