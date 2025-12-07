'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiCheck } from 'react-icons/fi';
import axios from 'axios';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await axios.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request password reset. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06b6d4]/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                </div>

                <div className="card">
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#9aa4b2]">Email Address</label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]" />
                                    <input
                                        type="email"
                                        required
                                        className="input pl-10"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#06b6d4] text-[#042028] font-bold py-3 rounded-xl transition-all hover:opacity-90 group"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform inline ml-2" />
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
                                <FiCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Check your email</h2>
                            <p className="text-[#9aa4b2] text-sm mb-6">
                                We've sent a password reset link to <span className="text-white">{email}</span>
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="text-sm text-[#9aa4b2] hover:text-white transition-colors"
                            >
                                Try a different email
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-sm text-[#9aa4b2] m-2 text-center">
                    Remember your password?{' '}
                    <Link href="/login" className="text-[#06b6d4] hover:text-[#06b6d4]/80 transition-colors font-medium">
                        Login here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
