import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticate = async (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (err) {
        return null;
    }

    await connectDB();
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user || !user.isActive) return null;

    return decoded;
};

export async function GET(request) {
    try {
        const decoded = await authenticate(request);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const contracts = await Contract.find().populate('user', 'name email').sort({ createdAt: -1 });

        return NextResponse.json({ contracts });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
