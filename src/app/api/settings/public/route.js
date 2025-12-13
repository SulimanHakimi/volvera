import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Config from '@/models/Config';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        const publicKeys = [
            'siteName',
            'contactEmail',
            'socialFacebook',
            'socialTwitter',
            'socialInstagram',
            'socialLinkedin',
            'socialYoutube',
            'socialTiktok',
            'companyAddress'
            , 'aboutUs_en', 'aboutUs_fa', 'aboutUs_ps'
        ];

        const configs = await Config.find({ key: { $in: publicKeys } });
        const settings = configs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch public settings' }, { status: 500 });
    }
}
