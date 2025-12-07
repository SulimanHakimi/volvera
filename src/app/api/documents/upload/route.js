import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import Notification from '@/models/Notification';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import fs from 'fs';
import path from 'path';

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

// Allowed file types (whitelist approach)
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

// Rate limiting map (in production, use Redis)
const uploadAttempts = new Map();

export async function POST(request) {
    try {
        const decoded = authenticate(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Rate limiting: max 10 uploads per hour per user
        const now = Date.now();
        const userKey = decoded.id;
        const attempts = uploadAttempts.get(userKey) || [];
        const recentAttempts = attempts.filter(time => now - time < 3600000); // 1 hour

        if (recentAttempts.length >= 10) {
            return NextResponse.json({ error: 'Too many upload attempts. Please try again later.' }, { status: 429 });
        }

        await connectDB();

        const formData = await request.formData();
        const files = formData.getAll('files');
        const category = formData.get('category') || 'other';

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        // Limit number of files per upload
        if (files.length > 5) {
            return NextResponse.json({ error: 'Maximum 5 files per upload' }, { status: 400 });
        }

        // Validate category
        const validCategories = ['contract', 'identity', 'channel_proof', 'other'];
        if (!validCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadedFiles = [];

        for (const file of files) {
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json({ error: `File ${file.name} exceeds 10MB limit` }, { status: 400 });
            }

            // Validate file size minimum (prevent empty files)
            if (file.size < 100) {
                return NextResponse.json({ error: `File ${file.name} is too small or empty` }, { status: 400 });
            }

            // Validate MIME type
            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                return NextResponse.json({
                    error: `File type ${file.type} not allowed. Only PDF, JPG, PNG, DOC, DOCX are accepted.`
                }, { status: 400 });
            }

            // Validate file extension
            const fileExt = path.extname(file.name).toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
                return NextResponse.json({
                    error: `File extension ${fileExt} not allowed.`
                }, { status: 400 });
            }

            // Prevent path traversal attacks
            const baseName = path.basename(file.name);
            if (baseName !== file.name || file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
                return NextResponse.json({ error: 'Invalid filename detected' }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());

            // Additional MIME type verification by checking file signature (magic numbers)
            const fileSignature = buffer.slice(0, 4).toString('hex');
            const validSignatures = {
                '25504446': 'pdf',  // PDF
                'ffd8ffe0': 'jpg',  // JPEG
                'ffd8ffe1': 'jpg',  // JPEG
                'ffd8ffe2': 'jpg',  // JPEG
                '89504e47': 'png',  // PNG
                'd0cf11e0': 'doc',  // DOC/DOCX
                '504b0304': 'docx', // DOCX (ZIP-based)
            };

            const isValidSignature = Object.keys(validSignatures).some(sig =>
                fileSignature.startsWith(sig)
            );

            if (!isValidSignature) {
                return NextResponse.json({
                    error: `File ${file.name} appears to be corrupted or has an invalid format`
                }, { status: 400 });
            }

            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            // Strict filename sanitization
            const sanitizedName = baseName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100);
            const filename = `${decoded.id}_${timestamp}_${randomStr}_${sanitizedName}`;
            const filePath = path.join(uploadDir, filename);

            // Ensure the resolved path is within upload directory (prevent path traversal)
            const resolvedPath = path.resolve(filePath);
            const resolvedUploadDir = path.resolve(uploadDir);
            if (!resolvedPath.startsWith(resolvedUploadDir)) {
                return NextResponse.json({ error: 'Security violation detected' }, { status: 403 });
            }

            fs.writeFileSync(filePath, buffer, { mode: 0o600 }); // Restrict file permissions

            // Save to database
            const fileDoc = await File.create({
                user: decoded.id,
                filename: filename,
                originalName: sanitizedName,
                mimeType: file.type,
                size: file.size,
                path: `/uploads/documents/${filename}`,
                category: category,
                status: 'pending',
            });

            uploadedFiles.push(fileDoc);
        }

        // Update rate limiting
        recentAttempts.push(now);
        uploadAttempts.set(userKey, recentAttempts);

        // Create notification for user
        await Notification.create({
            user: decoded.id,
            type: 'file_status',
            title: 'Documents Uploaded',
            message: `${uploadedFiles.length} document(s) uploaded successfully. Awaiting admin review.`,
            link: '/dashboard',
        });

        return NextResponse.json({
            success: true,
            message: `${uploadedFiles.length} document(s) uploaded successfully`,
            files: uploadedFiles.map(f => ({
                id: f._id,
                originalName: f.originalName,
                size: f.size,
                category: f.category,
                status: f.status
            }))
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload documents' }, { status: 500 });
    }
}
