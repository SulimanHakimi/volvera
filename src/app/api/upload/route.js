import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';

// Helper to authenticate user
const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

export async function POST(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Generate a unique filename to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.name.split('.').pop();
        const blobName = `uploads/${file.name.split('.')[0]}-${uniqueSuffix}.${extension}`;

        // Upload to Vercel Blob
        const blob = await put(blobName, file, {
            access: 'public',
        });

        await connectDB();

        // Save file record to DB
        const newFile = new File({
            user: decoded.id,
            filename: blob.pathname,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            path: blob.url,
            category: 'other',
            status: 'pending',
        });

        await newFile.save();

        return NextResponse.json({
            message: 'File uploaded successfully',
            file: newFile
        }, { status: 201 });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const files = await File.find({ user: decoded.id }).sort({ createdAt: -1 });

        return NextResponse.json({ files });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}
