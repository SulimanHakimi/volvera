import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    originalLanguage: {
        type: String,
        enum: ['fa', 'ps', 'en'],
        required: true,
    },
    type: {
        type: String,
        enum: ['partnership', 'termination'],
        default: 'partnership',
    },
    relatedContract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
    },
    originalData: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        platforms: [{
            platformName: { type: String, required: true },
            link: { type: String, required: true }
        }],
        country: String,
        phone: String,
        message: String,
        additionalInfo: mongoose.Schema.Types.Mixed,
    },
    translatedData: {
        fullName: String,
        email: String,
        platforms: [{
            platformName: String,
            link: String
        }],
        country: String,
        phone: String,
        message: String,
        additionalInfo: mongoose.Schema.Types.Mixed,
    },
    translationMethod: {
        type: String,
        enum: ['auto', 'manual', 'pending'],
        default: 'pending',
    },
    translatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    translatedAt: Date,
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'signed', 'terminated'],
        default: 'draft',
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: Date,
    reviewNotes: String,
    // PDF generation
    pdfGenerated: {
        type: Boolean,
        default: false,
    },
    pdfPath: String,
    // Metadata
    contractNumber: {
        type: String,
        unique: true,
    },
    submittedAt: Date,
    approvedAt: Date,
}, {
    timestamps: true,
});

ContractSchema.pre('save', async function () {
    // Generate contract number if missing
    if (!this.contractNumber) {
        const count = await this.constructor.countDocuments();
        const year = new Date().getFullYear();
        this.contractNumber = `CP-${year}-${String(count + 1).padStart(6, '0')}`;
    }

    // Update timestamps based on status
    if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
        this.submittedAt = new Date();
    }
    if (this.isModified('status') && this.status === 'approved' && !this.approvedAt) {
        this.approvedAt = new Date();
    }
});

// Force model recompilation in dev to pick up schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models && mongoose.models.Contract) {
    delete mongoose.models.Contract;
}

export default mongoose.models.Contract || mongoose.model('Contract', ContractSchema);
