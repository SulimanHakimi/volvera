import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import Notification from '@/models/Notification';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

export async function POST(request, { params }) {
    try {
        const decoded = authenticate(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await connectDB();

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const contract = await Contract.findById(id);
        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        if (contract.user.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const blobName = `contracts/signed_${id}_${Date.now()}.pdf`;

        // Upload to Vercel Blob
        const blob = await put(blobName, file, {
            access: 'public',
        });

        contract.status = 'active';
        contract.signedContractUrl = blob.url;
        await contract.save();

        await Notification.create({
            user: contract.user,
            type: 'contract_status',
            title: 'Contract Signed & Active',
            message: 'Your signed contract has been received and verified. Your partnership is now Active!',
            link: '/dashboard',
            relatedContract: contract._id
        });

        return NextResponse.json({
            success: true,
            message: 'Contract uploaded and activated successfully',
            contract
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload contract: ' + error.message }, { status: 500 });
    }
}
