'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

export default function ApplyFormModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        platforms: [{ platform: 'YouTube', link: '' }],
        country: '',
        phone: '',
        message: '',
        language: 'en',
    });
    const [formStatus, setFormStatus] = useState({ loading: false, message: '', type: '' });

    const platformOptions = ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'Twitter', 'Twitch', 'Other'];

    const handleAddPlatform = () => {
        setFormData(prev => ({
            ...prev,
            platforms: [...prev.platforms, { platform: 'YouTube', link: '' }]
        }));
    };

    const handleRemovePlatform = (index) => {
        if (formData.platforms.length === 1) return;
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.filter((_, i) => i !== index)
        }));
    };

    const handlePlatformChange = (index, field, value) => {
        const newPlatforms = [...formData.platforms];
        newPlatforms[index] = { ...newPlatforms[index], [field]: value };
        setFormData(prev => ({ ...prev, platforms: newPlatforms }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ loading: true, message: '', type: '' });

        try {
            const token = localStorage.getItem('accessToken');
            const payload = {
                originalLanguage: formData.language === 'en' ? 'fa' : formData.language, // Fallback 'en' to 'fa' for now as DB only supports fa/ps, or maybe allow en? Let's just map for safety or let it pass if model updated. I'll map 'en' -> 'fa' if validation is strict, but better to just send. Actually, let's map platforms correctly.
                originalLanguage: formData.language,
                fullName: formData.fullName,
                email: formData.email,
                platforms: formData.platforms.map(p => ({ platformName: p.platform, link: p.link })),
                country: formData.country,
                phone: formData.phone,
                message: formData.message,
                status: 'submitted'
            };

            const response = await axios.post('/api/contracts', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormStatus({
                loading: false,
                message: t('apply_form.success'),
                type: 'success'
            });

            setTimeout(() => {
                onClose();
                setFormData({
                    fullName: '',
                    email: '',
                    platforms: [{ platform: 'YouTube', link: '' }],
                    country: '',
                    phone: '',
                    message: '',
                    language: 'en',
                });
                setFormStatus({ loading: false, message: '', type: '' });
            }, 2000);

        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.error || error.message || t('apply_form.error');
            setFormStatus({
                loading: false,
                message: errMsg,
                type: 'error'
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-[#0b1220] rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.03)]"
                            >
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#0f1724] hover:bg-[rgba(255,255,255,0.03)] transition-colors z-10"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-2 text-white">
                                        {t('apply_form.title')}
                                    </h2>
                                    <p className="text-sm text-[#9aa4b2] mb-6">
                                        {t('apply_form.subtitle')}
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label text-sm">{t('apply_form.full_name')}</label>
                                                <input
                                                    type="text"
                                                    className="input text-sm"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="label text-sm">{t('apply_form.email')}</label>
                                                <input
                                                    type="email"
                                                    className="input text-sm"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Dynamic Platforms Section */}
                                        <div className="space-y-3">
                                            <label className="label text-sm">{t('apply_form.channels_platforms')}</label>
                                            <div className="space-y-3">
                                                {formData.platforms.map((item, index) => (
                                                    <div key={index} className="flex gap-3 items-start">
                                                        <div className="w-1/3">
                                                            <select
                                                                className="input text-sm"
                                                                value={item.platform}
                                                                onChange={(e) => handlePlatformChange(index, 'platform', e.target.value)}
                                                            >
                                                                {platformOptions.map(opt => (
                                                                    <option key={opt} value={opt} className="bg-[#0b1220]">{opt}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="url"
                                                                className="input text-sm"
                                                                value={item.link}
                                                                onChange={(e) => handlePlatformChange(index, 'link', e.target.value)}
                                                                placeholder={t('apply_form.message_placeholder')}
                                                                required
                                                            />
                                                        </div>
                                                        {formData.platforms.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemovePlatform(index)}
                                                                className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-[1px]"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddPlatform}
                                                className="text-sm text-[#06b6d4] hover:text-[#06b6d4] flex items-center gap-1 mt-2"
                                            >
                                                <FiPlus /> {t('apply_form.add_another')}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label text-sm">{t('apply_form.country')}</label>
                                                <input
                                                    type="text"
                                                    className="input text-sm"
                                                    value={formData.country}
                                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="label text-sm">{t('apply_form.phone')}</label>
                                                <input
                                                    type="tel"
                                                    className="input text-sm"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label text-sm">{t('apply_form.message')}</label>
                                            <textarea
                                                className="input text-sm"
                                                rows="3"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder={t('apply_form.message_placeholder')}
                                            ></textarea>
                                        </div>

                                        <div>
                                            <label className="label text-sm">{t('apply_form.language')}</label>
                                            <select
                                                className="input text-sm"
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                            >
                                                <option value="en">English</option>
                                                <option value="fa">فارسی (Persian)</option>
                                                <option value="ps">پښتو (Pashto)</option>
                                            </select>
                                        </div>

                                        {formStatus.message && (
                                            <div className={`p-3 rounded-lg text-sm ${formStatus.type === 'success'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {formStatus.message}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={formStatus.loading}
                                            className="w-full bg-[#06b6d4] text-[#042028] font-bold py-3 rounded-xl transition-all hover:opacity-90 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {formStatus.loading ? t('apply_form.submitting') : t('apply_form.submit')}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
