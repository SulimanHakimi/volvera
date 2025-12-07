import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: function () {
            return !this.oauthProvider;
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    country: {
        type: String,
        trim: true,
    },
    channelLink: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    preferredLanguage: {
        type: String,
        enum: ['en', 'fa', 'ps'],
        default: 'en',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    oauthProvider: {
        type: String,
        enum: ['google', 'facebook', null],
        default: null,
    },
    oauthId: String,
    avatar: String,
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: Date,
}, {
    timestamps: true,
});

UserSchema.pre('save', async function () {
    if (!this.password) return;

    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateVerificationToken = function () {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.emailVerificationToken = token;
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    return token;
};

UserSchema.methods.generatePasswordResetToken = function () {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.passwordResetToken = token;
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    return token;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
