'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiUser, FiYoutube, FiInstagram, FiCheck, FiChevronRight, FiChevronLeft, FiSave, FiSend, FiPlus, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

export default function CreateContractPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        originalLanguage: 'fa', // Default to Persian
        fullName: '',
        email: '',
        phone: '',
        country: '',
        platforms: [{ platformName: '', link: '' }],
        message: '',
    });

    const handleAddPlatform = () => {
        setFormData(prev => ({
            ...prev,
            platforms: [...prev.platforms, { platformName: '', link: '' }]
        }));
    };

    const handleRemovePlatform = (index) => {
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

    const handleSubmit = async (status = 'draft') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post('/api/contracts', {
                ...formData,
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (status === 'submitted') {
                router.push('/dashboard?success=contract-submitted');
            } else {
                router.push('/dashboard?success=draft-saved');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save contract. Please missing fields.');
        } finally {
            setLoading(false);
        }
    };

    const platformOptions = ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'Other'];

    return (
        <div className="min-h-screen bg-[var(--bg)] pb-20">
            {/* Header */}
            <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                            <FiChevronLeft /> Back
                        </button>
                        <h1 className="text-lg font-bold">{t('dashboard.new_contract_title')}</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSubmit('draft')}
                                disabled={loading}
                                className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <span className="flex items-center gap-2"><FiSave /> Save Draft</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">

                {/* Language Selection */}
                <section className="card p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">1</span>
                        Contract Language
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setFormData({ ...formData, originalLanguage: 'fa' })}
                            className={`p-6 rounded-xl border text-left transition-all ${formData.originalLanguage === 'fa'
                                ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="text-2xl mb-2">🇮🇷</div>
                            <div className="font-bold text-lg">فارسی (Persian)</div>
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, originalLanguage: 'ps' })}
                            className={`p-6 rounded-xl border text-left transition-all ${formData.originalLanguage === 'ps'
                                ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="text-2xl mb-2">🇦🇫</div>
                            <div className="font-bold text-lg">پښتو (Pashto)</div>
                        </button>
                    </div>
                </section>

                {/* Personal Information */}
                <section className="card p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">2</span>
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Full Name ({formData.originalLanguage === 'fa' ? 'نام کامل' : 'پوره نوم'})</label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="input pl-10"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">{t('dashboard.email_address')}</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="label">{t('dashboard.phone_number')}</label>
                            <input
                                type="tel"
                                className="input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+93 700 000 000"
                            />
                        </div>
                        <div>
                            <label className="label">Country of Residence</label>
                            <div className="relative">
                                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="input pl-10"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="e.g. Afghanistan"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Channels & Platforms */}
                <section className="card p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">3</span>
                        Channels & Platforms
                    </h2>
                    <div className="space-y-4">
                        {formData.platforms.map((platform, index) => (
                            <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-sm text-gray-300">Account #{index + 1}</h3>
                                    {formData.platforms.length > 1 && (
                                        <button onClick={() => handleRemovePlatform(index)} className="text-red-400 hover:text-red-300">
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="label">Platform</label>
                                        <select
                                            className="input"
                                            value={platform.platformName}
                                            onChange={(e) => handlePlatformChange(index, 'platformName', e.target.value)}
                                        >
                                            <option value="" disabled>Select...</option>
                                            {platformOptions.map(opt => (
                                                <option key={opt} value={opt} className="bg-[#1a1a2e]">{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Link / URL</label>
                                        <input
                                            type="url"
                                            className="input"
                                            value={platform.link}
                                            onChange={(e) => handlePlatformChange(index, 'link', e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleAddPlatform}
                            className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2"
                        >
                            <FiPlus /> Add Another Account
                        </button>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/10">
                        <label className="label">{t('dashboard.additional_message')}</label>
                        <textarea
                            className="input h-32 resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Any additional details..."
                        ></textarea>
                    </div>
                </section>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => handleSubmit('submitted')}
                        disabled={loading}
                        className="btn btn-primary px-8 py-4 text-lg w-full md:w-auto"
                    >
                        {loading ? 'Submitting...' : 'Submit Contract'} <FiSend className="ml-2 inline" />
                    </button>
                </div>
            </div>
        </div>
    );
}
