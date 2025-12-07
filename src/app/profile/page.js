'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiYoutube, FiMapPin, FiLock, FiSave, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        channelLink: ''
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const res = await axios.get('/api/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data.user);
            } catch (error) {
                console.error('Failed to load profile');
                setMessage({ type: 'error', text: 'Failed to load profile data' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setSaving(false);
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const payload = { ...user };
            if (passwords.newPassword) {
                payload.currentPassword = passwords.currentPassword;
                payload.newPassword = passwords.newPassword;
            }

            const res = await axios.put('/api/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(res.data.user);
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data.user }));

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-8 h-8 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12 px-4 mt-4 md:px-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('profile.title')}</h1>
                    <p className="text-[#9aa4b2]">{t('profile.subtitle')}</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                        <FiAlertCircle className="w-5 h-5" />
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar / Avatar Card */}
                    <div className="md:col-span-1">
                        <div className="card p-6 text-center space-y-4">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#06b6d4] to-[#7c3aed] flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-[#06b6d4]/20">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                                <p className="text-sm text-[#9aa4b2]">{user.email}</p>
                            </div>
                            <div className="pt-4 flex flex-col gap-2">
                                <div className="px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] text-sm font-medium border border-[rgba(255,255,255,0.03)] flex items-center justify-center gap-2 text-white">
                                    <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-[#06b6d4]' : 'bg-blue-500'}`}></span>
                                    {user.role === 'admin' ? 'Administrator' : 'Creator'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Info */}
                            <div className="card p-6 space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 pb-2 border-b border-[rgba(255,255,255,0.03)] text-white">
                                    <FiUser className="text-[#06b6d4]" />
                                    {t('profile.personal_info')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-[#9aa4b2] mb-1 block">{t('profile.full_name')}</label>
                                        <div className="relative">
                                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={user.name}
                                                onChange={handleChange}
                                                className="input pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#9aa4b2] mb-1 block">{t('profile.email_readonly')}</label>
                                        <div className="relative">
                                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]" />
                                            <input
                                                type="email"
                                                value={user.email}
                                                disabled
                                                className="input pl-10 opacity-60 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#9aa4b2] mb-1 block">{t('profile.phone')}</label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]" />
                                            <input
                                                type="text"
                                                name="phone"
                                                value={user.phone || ''}
                                                onChange={handleChange}
                                                className="input pl-10"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#9aa4b2] mb-1 block">{t('profile.country')}</label>
                                        <div className="relative">
                                            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]" />
                                            <input
                                                type="text"
                                                name="country"
                                                value={user.country || ''}
                                                onChange={handleChange}
                                                className="input pl-10"
                                                placeholder="e.g. United States"
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-[#9aa4b2] mb-1 block">{t('profile.channel_link')}</label>
                                        <div className="relative">
                                            <FiYoutube className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]" />
                                            <input
                                                type="text"
                                                name="channelLink"
                                                value={user.channelLink || ''}
                                                onChange={handleChange}
                                                className="input pl-10"
                                                placeholder="https://youtube.com/c/yourchannel"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="card p-6 space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 pb-2 border-b border-[rgba(255,255,255,0.03)] text-white">
                                    <FiLock className="text-[#06b6d4]" />
                                    {t('profile.change_password')}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-[#9aa4b2] mb-1 block">{t('profile.current_password')}</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwords.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="input"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-[#9aa4b2] mb-1 block">{t('profile.new_password')}</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwords.newPassword}
                                                onChange={handlePasswordChange}
                                                className="input"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-[#9aa4b2] mb-1 block">{t('profile.confirm_new_password')}</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwords.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="input"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-primary"
                                >
                                    {saving ? t('profile.saving') : t('profile.save_changes')}
                                    <FiSave className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
