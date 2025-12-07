import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

// Helper to authenticate admin
const authenticateAdmin = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
};

export async function GET(request) {
    try {
        const decoded = authenticateAdmin(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const files = await File.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Fetch documents error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
