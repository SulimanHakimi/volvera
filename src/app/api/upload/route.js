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

        // Generate a strictly unique and unguessable filename
        const crypto = require('crypto');
        const fileExtension = file.name.split('.').pop();
        const randomName = crypto.randomUUID();
        const blobName = `uploads/${randomName}.${fileExtension}`;

        // Upload to Vercel Blob
        const blob = await put(blobName, file, {
            access: 'public', // URLs are unguessable, but technically public
        });

        await connectDB();

        // Save file record to DB
        const newFile = new File({
            user: decoded.id,
            filename: blobName,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            path: blob.url,
            category: 'other',
            status: 'pending',
        });

        await newFile.save();

        // Return sanitized file info
        const safeFile = {
            _id: newFile._id,
            originalName: newFile.originalName,
            mimeType: newFile.mimeType,
            size: newFile.size,
            path: newFile.path,
            createdAt: newFile.createdAt
        };

        return NextResponse.json({
            message: 'File uploaded successfully',
            file: safeFile
        }, { status: 201 });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
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
