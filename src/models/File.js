import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
    },
    filename: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['contract', 'identity', 'channel_proof', 'other'],
        default: 'other',
    },
    tags: [String],
    description: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: Date,
    reviewNotes: String,
    isTemplate: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

FileSchema.index({ user: 1, createdAt: -1 });
FileSchema.index({ contract: 1 });
FileSchema.index({ isTemplate: 1 });

export default mongoose.models.File || mongoose.model('File', FileSchema);
