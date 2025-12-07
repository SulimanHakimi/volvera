import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

export async function GET(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();

        // Fetch user's contracts
        const contracts = await Contract.find({ user: decoded.id });

        // Calculate stats
        const stats = {
            totalContracts: contracts.length,
            approved: contracts.filter(c => c.status === 'approved').length,
            pending: contracts.filter(c => ['submitted', 'under_review'].includes(c.status)).length,
            rejected: contracts.filter(c => c.status === 'rejected').length,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
