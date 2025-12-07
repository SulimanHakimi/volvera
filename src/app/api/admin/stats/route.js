import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

export async function GET(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Parallel fetch for overview stats
        const [
            totalUsers,
            activeContracts,
            totalEarnings, // Placeholder logic
            recentContracts,
            newUsers
        ] = await Promise.all([
            User.countDocuments(),
            Contract.countDocuments({ status: { $in: ['approved', 'under_review', 'submitted'] } }), // More active definition
            Promise.resolve(125000), // Dummy earnings
            Contract.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
            User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
        ]);

        return NextResponse.json({
            stats: {
                totalUsers,
                activeContracts,
                totalEarnings,
                platformUsage: '78%'
            },
            recentContracts,
            newUsers
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
