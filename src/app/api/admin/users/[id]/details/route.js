import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import File from '@/models/File';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticateAdmin = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
};

export async function GET(request, { params }) {
    try {
        const decoded = authenticateAdmin(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();

        // Fetch user's contracts
        const contracts = await Contract.find({ user: id })
            .select('title status platform createdAt')
            .sort({ createdAt: -1 })
            .limit(50);

        // Fetch user's uploaded files
        const files = await File.find({ user: id })
            .select('originalName size status category path createdAt')
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({
            contracts,
            files
        });

    } catch (error) {
        console.error('Fetch user details error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user details' },
            { status: 500 }
        );
    }
}
