'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

export default function RegisterPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            if (response.data.requireVerification) {
                // Redirect to login with a success message
                router.push('/login?registered=true');
            } else {
                // Fallback for old flow if ever needed
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider) => {
        try {
            await signIn(provider, { callbackUrl: '/dashboard' });
        } catch (error) {
            setError(`Failed to sign in with ${provider}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#06b6d4]/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">{t('auth.register_title')}</h1>
                </div>

                {/* Register Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="label text-sm font-medium mb-2 block">{t('auth.name')}</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                autoComplete="name"
                                placeholder="Ahmad Wali"
                            />
                        </div>

                        <div>
                            <label className="label text-sm font-medium mb-2 block">{t('auth.email')}</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="label text-sm font-medium mb-2 block">{t('auth.password')}</label>
                            <input
                                type="password"
                                className="input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                autoComplete="new-password"
                                minLength={6}
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-[#9aa4b2] mt-1.5">
                                Minimum 6 characters
                            </p>
                        </div>

                        <div>
                            <label className="label text-sm font-medium mb-2 block">{t('auth.confirm_password')}</label>
                            <input
                                type="password"
                                className="input"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#06b6d4] text-[#042028] font-bold py-3 rounded-xl transition-all hover:opacity-90 relative"
                        >
                            <span className="relative z-10">
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-[#042028] border-t-transparent rounded-full animate-spin"></div>
                                        {t('common.loading')}
                                    </div>
                                ) : t('auth.register_button')}
                            </span>
                        </button>
                    </form>
                    <p className="text-xs text-center text-[#9aa4b2] mt-6 leading-relaxed">
                        By registering, you agree to our{' '}
                        <Link href="/terms" className="text-[#06b6d4] hover:text-[#06b6d4]/80 transition-colors">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-[#06b6d4] hover:text-[#06b6d4]/80 transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[rgba(255,255,255,0.03)]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#0b1220] text-[#9aa4b2]">
                                {t('auth.or')}
                            </span>
                        </div>
                    </div>
                    {/* social login options Buttons */}
                    <div className="space-y-3 mt-6">
                        <button
                            onClick={() => handleOAuthSignIn('google')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-all text-sm font-medium"
                        >
                            <FaGoogle />
                            Continue with Google
                        </button>

                        <button
                            onClick={() => handleOAuthSignIn('facebook')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-all text-sm font-medium"
                        >
                            <FaFacebook />
                            Continue with Facebook
                        </button>
                    </div>
                </div>
                <p className="text-sm text-center m-2 text-[#9aa4b2]">
                    {t('auth.have_account')}{' '}
                    <Link href="/login" className="text-[#06b6d4] hover:text-[#06b6d4]/80 transition-colors font-medium">
                        {t('auth.sign_in')}
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
