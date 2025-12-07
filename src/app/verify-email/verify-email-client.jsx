'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                await axios.post('/api/auth/verify-email', { token });
                setStatus('success');
                setMessage('Email successfully verified! You can now login.');
                setTimeout(() => router.push('/login'), 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Failed to verify email. The link may be expired.');
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card max-w-md w-full p-8 text-center space-y-6"
            >
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <FiLoader className="w-16 h-16 text-purple-500 animate-spin mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <FiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <h1 className="text-2xl font-bold mb-2 text-green-400">Verified!</h1>
                        <p className="text-gray-300 mb-6">{message}</p>
                        <Link href="/login" className="btn btn-primary w-full">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <FiXCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold mb-2 text-red-400">Verification Failed</h1>
                        <p className="text-gray-300 mb-6">{message}</p>
                        <Link href="/login" className="btn btn-secondary w-full">
                            Back to Login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
