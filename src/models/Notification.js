import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['contract_status', 'file_status', 'system', 'admin_message'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: String,
    relatedContract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
    },
    relatedFile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: Date,
}, {
    timestamps: true,
});

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
