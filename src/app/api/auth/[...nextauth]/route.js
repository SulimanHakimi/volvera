import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/utils/jwt';

export const authOptions = {
    session: {
        strategy: "jwt"
    },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),
    ],

    pages: {
        signIn: '/login',
        error: '/login',
    },

    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                await connectDB();

                // Find or create user
                let dbUser = await User.findOne({ email: user.email });

                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email,
                        avatar: user.image,
                        role: 'user',
                        oauthProvider: account.provider,
                        oauthId: account.providerAccountId,
                        isEmailVerified: true, // Social logins are verified
                        lastLogin: new Date()
                    });
                } else {
                    // Update existing user info
                    dbUser.lastLogin = new Date();
                    if (!dbUser.avatar) dbUser.avatar = user.image;
                    if (!dbUser.oauthProvider) {
                        // Link account if user exists but wasn't created via OAuth
                        dbUser.oauthProvider = account.provider;
                        dbUser.oauthId = account.providerAccountId;
                    }
                    await dbUser.save();
                }

                // Generate our own custom tokens matching the manual login flow
                const accessToken = signToken({
                    id: dbUser._id,
                    email: dbUser.email,
                    role: dbUser.role
                }, '24h');

                const refreshToken = signToken({
                    id: dbUser._id
                }, '7d');

                token.id = dbUser._id.toString();
                token.role = dbUser.role;
                token.accessToken = accessToken;
                token.refreshToken = refreshToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.accessToken = token.accessToken;
                session.refreshToken = token.refreshToken;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
