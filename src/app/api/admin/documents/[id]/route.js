import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
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

        await connectDB();

        // Handle Rejection: Delete file and record
        if (status === 'rejected') {
            const file = await File.findById(id);
            if (!file) {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }

            try {
                // Delete from Vercel Blob using the stored URL
                await del(file.path);
                console.log(`Deleted Blob file: ${file.path}`);
            } catch (err) {
                console.error('Failed to delete Blob file:', err);
                // Continue to delete DB record even if file deletion fails
            }

            await File.findByIdAndDelete(id);
            return NextResponse.json({ message: 'File rejected and deleted', deletedId: id });
        }

        // Handle other updates (Approve, Category change)
        const updateData = {};

        if (status) {
            if (!['approved', 'pending'].includes(status)) {
                // 'rejected' is handled above
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            updateData.status = status;
            updateData.reviewedBy = decoded.id;
            updateData.reviewedAt = new Date();
        }

        if (category) {
            updateData.category = category;
        }

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
            { error: 'Failed to handle document update' },
            { status: 500 }
        );
    }
}
