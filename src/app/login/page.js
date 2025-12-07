'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', formData);

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            if (response.data.user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
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
            {/* bg effects here */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* title of page */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">{t('auth.login_title')}</h1>
                </div>
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
                                autoComplete="current-password"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent" />
                                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                                {t('auth.forgot_password')}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full relative"
                        >
                            <span className="relative z-10">
                                {loading ? t('common.loading') : t('auth.login_button')}
                            </span>
                        </button>
                    </form>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[rgba(26,26,46,0.6)] text-gray-400">
                                {t('auth.or')}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleOAuthSignIn('google')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
                        >
                            <FaGoogle />
                            Continue with Google
                        </button>

                        <button
                            onClick={() => handleOAuthSignIn('facebook')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
                        >
                            <FaFacebookF />
                            Continue with Facebook
                        </button>
                    </div>
                </div>
                <p className="text-sm text-center m-2 text-gray-400">
                    {t('auth.no_account')}{' '}
                    <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                        {t('auth.sign_up')}
                    </Link>
                </p>                
            </motion.div>
        </div>
    );
}
