import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticateAdmin = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
};

export async function PATCH(request, { params }) {
    try {
        const decoded = authenticateAdmin(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status, category } = await request.json();
        const updateData = {};

        if (status) {
            if (!['approved', 'rejected', 'pending'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            updateData.status = status;
            updateData.reviewedBy = decoded.id;
            updateData.reviewedAt = new Date();
        }

        if (category) {
            updateData.category = category;
        }

        await connectDB();

        const file = await File.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('user', 'name email');

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json({ file });

    } catch (error) {
        console.error('Update document error:', error);
        return NextResponse.json(
            { error: 'Failed to update document' },
            { status: 500 }
        );
    }
}
