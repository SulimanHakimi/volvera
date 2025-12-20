import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Contract from '@/models/Contract';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        // Count active creators (users with role 'user')
        const activeCreatorsCount = await User.countDocuments({ role: 'user', isActive: true });

        // Get unique countries from partnership applications
        const contractCountries = await Contract.distinct('originalData.country', {
            type: 'partnership',
            'originalData.country': { $ne: null, $ne: '' }
        });

        const countriesCount = contractCountries.length;

        return NextResponse.json({
            activeCreators: activeCreatorsCount,
            countries: countriesCount,
            earningsRetained: '99.5%'
        });
    } catch (error) {
        console.error('Failed to fetch public stats:', error);
        return NextResponse.json({
            activeCreators: 9,
            countries: 3,
            earningsRetained: '99.5%'
        });
    }
}
