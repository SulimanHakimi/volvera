import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const authenticate = async (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    try {
        return verifyToken(token);
    } catch (err) {
        return null;
    }
};

export async function GET(request, { params }) {
    try {
        const decoded = await authenticate(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { filename } = await params;

        await connectDB();
        const file = await File.findOne({ filename });
        if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

        // Only owner or admin can access
        if (file.user.toString() !== (decoded.id || decoded.userId).toString() && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Compose path based on env
        const uploadDir = process.env.FILE_UPLOAD_PATH || (process.env.NODE_ENV === 'production' ? path.join(os.tmpdir(), 'uploads', 'documents') : path.join(process.cwd(), 'public', 'uploads', 'documents'));
        const filePath = path.join(uploadDir, filename);

        // Ensure path doesn't escape
        const resolvedPath = path.resolve(filePath);
        const resolvedUploadDir = path.resolve(uploadDir);
        if (!resolvedPath.startsWith(resolvedUploadDir)) {
            return NextResponse.json({ error: 'Security violation detected' }, { status: 403 });
        }

        const data = await fs.readFile(filePath);
        return new NextResponse(data, {
            status: 200,
            headers: {
                'Content-Type': file.mimeType,
                'Content-Disposition': `attachment; filename="${file.originalName}"`,
            }
        });
    } catch (err) {
        console.error('Serve temp file error:', err);
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
    }
}
