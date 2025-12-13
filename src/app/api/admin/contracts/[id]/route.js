import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticateAdmin = async (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (err) {
        return null;
    }
    if (!decoded || decoded.role !== 'admin') return null;

    await connectDB();
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user || !user.isActive) return null;

    return decoded;
};

// PATCH - Update contract status
export async function PATCH(request, { params }) {
    try {
        const decoded = await authenticateAdmin(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        await connectDB();

        // Load contract first so we can inspect its type and user
        const contract = await Contract.findById(id).populate('user');
        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        contract.status = status;
        await contract.save();

        // If this is a termination request that admin accepted, deactivate the user account
        if (status === 'approved' && contract.type === 'termination' && contract.user) {
            try {
                await User.findByIdAndUpdate(contract.user._id || contract.user, { isActive: false });
            } catch (err) {
                console.error('Failed to deactivate user on termination approval:', err);
            }
        }

        return NextResponse.json({ message: 'Contract updated', contract });
    } catch (error) {
        console.error('Update contract error:', error);
        return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }
}

// DELETE - Delete a contract
export async function DELETE(request, { params }) {
    try {
        const decoded = await authenticateAdmin(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const contract = await Contract.findByIdAndDelete(id);
        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Contract deleted' });
    } catch (error) {
        console.error('Delete contract error:', error);
        return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }
}
