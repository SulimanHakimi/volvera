import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import User from '@/models/User';

const authenticate = async (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (err) {
        return null;
    }

    // Check user is active
    await connectDB();
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user || !user.isActive) return null;

    return decoded;
};

export async function GET(request) {
    try {
        const decoded = await authenticate(request);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const filter = { user: decoded.id };
        if (decoded.role === 'admin') {
            // Admins can see all contracts
            // delete filter.user;
        }

        const contracts = await Contract.find(filter).sort({ createdAt: -1 });

        return NextResponse.json({ contracts });
    } catch (error) {
        console.error('Get contracts error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contracts' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const decoded = await authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            originalLanguage,
            fullName,
            email,
            platforms,
            country,
            phone,
            message,
            status = 'draft',
            type = 'partnership',
            relatedContract,
        } = body;

        const validPlatforms = platforms ? platforms.filter(p => p.platformName && p.link) : [];

        if (!originalLanguage || !fullName || !email) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        const translatedData = {
            fullName: fullName + ' [EN]',
            email: email,
            platforms: validPlatforms,
            country: country ? country + ' [EN]' : '',
            phone: phone,
            message: message ? message + ' (Translated from ' + originalLanguage + ')' : '',
            additionalInfo: {},
        };

        const contract = new Contract({
            user: decoded.id,
            originalLanguage,
            originalData: {
                fullName,
                email,
                platforms: validPlatforms,
                country,
                phone,
                message,
            },
            translatedData,
            translationMethod: 'auto',
            status,
            type,
            relatedContract,
        });

        await contract.save();

        return NextResponse.json({
            message: 'Contract created successfully',
            contract,
        }, { status: 201 });

    } catch (error) {
        console.error('Create contract error:', error);
        return NextResponse.json(
            { error: 'Failed to create contract' },
            { status: 500 }
        );
    }
}
