import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

// Helper to authenticate user
const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

// GET - Get all contracts for the authenticated user
export async function GET(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // If admin, maybe return all? But for now assume user dashboard
        const filter = { user: decoded.id };
        if (decoded.role === 'admin') {
            // Admin sees all? Let's keep it user specific for this route, or handle admin route separately
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

// POST - Create a new contract
export async function POST(request) {
    try {
        const decoded = authenticate(request);
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

        // Clean platforms
        const validPlatforms = platforms ? platforms.filter(p => p.platformName && p.link) : [];

        // Validation
        if (!originalLanguage || !fullName || !email) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        // Simple Auto-Translation Stub
        // In a real app, you'd call GPT-4 or Google Translate API here
        // In a real app, you'd call GPT-4 or Google Translate API here
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
