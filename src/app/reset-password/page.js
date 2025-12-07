'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiLock, FiArrowRight, FiCheck } from 'react-icons/fi';
import axios from 'axios';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/reset-password', { token, password });
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. Token may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="card text-center p-8">
                <div className="text-red-400 mb-4">Invalid Link</div>
                <p className="text-[#9aa4b2] mb-6">This password reset link is invalid or missing the token.</p>
                <Link href="/forgot-password" className="bg-[#06b6d4] text-[#042028] font-bold py-3 px-6 rounded-xl hover:opacity-90 inline-flex transition-all">
                    Request new link
                </Link>
            </div>
        );
    }

    return (
        <div className="card">
            {!success ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#9aa4b2]">New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]" />
                            <input
                                type="password"
                                required
                                className="input pl-10"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#9aa4b2]">Confirm Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]" />
                            <input
                                type="password"
                                required
                                className="input pl-10"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#06b6d4] text-[#042028] font-bold py-3 rounded-xl transition-all hover:opacity-90 group"
                    >
                        {loading ? 'Reseting...' : 'Reset Password'}
                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform inline ml-2" />
                    </button>
                </form>
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
                    <p className="text-[#9aa4b2] text-sm mb-6">
                        Your password has been successfully reset. Redirecting to login...
                    </p>
                    <Link href="/login" className="w-full bg-[#06b6d4] text-[#042028] font-bold py-3 rounded-xl transition-all hover:opacity-90 block">
                        Login Now
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
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
                    <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
                </div>

                <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </motion.div>
        </div>
    );
}
