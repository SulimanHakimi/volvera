import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/utils/jwt';
import { sendVerificationEmail } from '@/utils/email';

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }
        await connectDB();

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 409 }
            );
        }

        const user = new User({
            name,
            email,
            password,
        });

        await user.save();

        const verificationToken = user.generateVerificationToken();
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(user.email, user.name, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Optionally, we could rollback user creation here, or just let them resend verification later
        }

        return NextResponse.json({
            message: 'Registration successful. Please check your email to verify your account.',
            requireVerification: true
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
