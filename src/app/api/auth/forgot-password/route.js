import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/utils/email';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: 'If user exists, reset link sent' });
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        try {
            await sendPasswordResetEmail(user.email, user.name, resetToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Reset link sent' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
