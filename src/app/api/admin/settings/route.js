import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';


import Config from '@/models/Config';

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
        const configs = await Config.find({});
        // Convert array to object for easier frontend consumption
        const settings = configs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        await connectDB();

        for (const [key, value] of Object.entries(body)) {
            await Config.findOneAndUpdate(
                { key },
                { key, value },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ message: 'Settings saved' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
