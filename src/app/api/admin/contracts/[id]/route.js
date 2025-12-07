import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

// Helper to authenticate admin
const authenticateAdmin = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
};

// PATCH - Update contract status
export async function PATCH(request, { params }) {
    try {
        const decoded = authenticateAdmin(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        await connectDB();

        const contract = await Contract.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
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
        const decoded = authenticateAdmin(request);
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
