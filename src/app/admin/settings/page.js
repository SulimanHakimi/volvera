'use client';

import { useState, useEffect } from 'react';
import { FiBriefcase, FiUpload, FiShare2, FiFileText, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { defaultPartnershipAgreement, defaultTerminationNotice } from '@/lib/defaultAgreements';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        companyRegistrationNumber: '',
        companyAddress: '',
        companySignatureUrl: '',
        aboutUs_en: '',
        aboutUs_fa: '',
        aboutUs_ps: '',
        socialFacebook: '',
        socialTwitter: '',
        socialInstagram: '',
        socialLinkedin: '',
        socialYoutube: '',
        socialTiktok: '',
        partnershipAgreement_en: '',
        partnershipAgreement_fa: '',
        partnershipAgreement_ps: '',
        terminationNotice_en: '',
        terminationNotice_fa: '',
        terminationNotice_ps: ''
    });
    const [signatureFile, setSignatureFile] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;

                if (!token || !user || user.role !== 'admin') {
                    router.push('/login');
                    return;
                }

                const res = await axios.get('/api/admin/settings', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                let fetchedSettings = {};
                if (res.data && Object.keys(res.data).length > 0) {
                    fetchedSettings = res.data;
                }

                setSettings(prev => ({
                    ...prev,
                    ...fetchedSettings,
                    partnershipAgreement_en: fetchedSettings.partnershipAgreement_en || defaultPartnershipAgreement.en,
                    partnershipAgreement_fa: fetchedSettings.partnershipAgreement_fa || defaultPartnershipAgreement.fa,
                    partnershipAgreement_ps: fetchedSettings.partnershipAgreement_ps || defaultPartnershipAgreement.ps,
                    terminationNotice_en: fetchedSettings.terminationNotice_en || defaultTerminationNotice.en,
                    terminationNotice_fa: fetchedSettings.terminationNotice_fa || defaultTerminationNotice.fa,
                    terminationNotice_ps: fetchedSettings.terminationNotice_ps || defaultTerminationNotice.ps,
                }));

            } catch (error) {
                console.error('Failed to load settings');
            }
        };
        fetchSettings();
    }, [router]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSignatureFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setSignaturePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            let signatureUrl = settings.companySignatureUrl;

            // Upload signature if a new file is selected
            if (signatureFile) {
                const formData = new FormData();
                formData.append('file', signatureFile);

                const uploadRes = await axios.post('/api/upload', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (uploadRes.data?.file?.path) {
                    signatureUrl = uploadRes.data.file.path;
                    setSettings(prev => ({ ...prev, companySignatureUrl: signatureUrl }));
                }
            }

            const settingsToSave = {
                ...settings,
                companySignatureUrl: signatureUrl
            };

            await axios.post('/api/admin/settings', settingsToSave, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSignatureFile(null);
        } catch (error) {
            console.error(error);
            alert('Failed to save settings: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General Settings' },
        { id: 'partnership', label: 'Partnership Agreement' },
        { id: 'termination', label: 'Termination Notice' }
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
                <p className="text-gray-400">Configure global settings, legal documents, and company information.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)] overflow-x-auto pb-1 gap-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === tab.id
                                ? 'text-[var(--accent)]'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid gap-6">

                {activeTab === 'general' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Company Information */}
                        <div className="card p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                    <FiBriefcase className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold">Company Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Company Registration Number</label>
                                    <input
                                        type="text"
                                        name="companyRegistrationNumber"
                                        className="input"
                                        placeholder="Org. nr"
                                        value={settings.companyRegistrationNumber || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label">Registered Address</label>
                                    <textarea
                                        name="companyAddress"
                                        className="input min-h-[42px]"
                                        rows={3}
                                        placeholder="Street, City, Country"
                                        value={settings.companyAddress || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label">Company Signature (Image)</label>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="input flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
                                                    <FiUpload />
                                                    <span className="truncate">
                                                        {signatureFile ? signatureFile.name : 'Click to upload new signature'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Recommended: Transparent PNG, max 2MB.
                                            </p>
                                        </div>
                                        {(settings.companySignatureUrl || signatureFile) && (
                                            <div className="w-32 h-16 border border-white/10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden relative">
                                                {signatureFile ? (
                                                    signaturePreview ? (
                                                        <Image
                                                            src={signaturePreview}
                                                            alt="New Signature Preview"
                                                            width={128}
                                                            height={64}
                                                            className="max-w-full max-h-full object-contain"
                                                            unoptimized={true}
                                                        />
                                                    ) : (
                                                        <div className="text-muted">Preview loading...</div>
                                                    )
                                                ) : (
                                                    <Image
                                                        src={settings.companySignatureUrl}
                                                        alt="Current Signature"
                                                        width={128}
                                                        height={64}
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Us */}
                        <div className="card p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                    <FiFileText className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold">About Us (Editable)</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="label">About Us (English)</label>
                                    <textarea
                                        name="aboutUs_en"
                                        className="input min-h-[82px]"
                                        rows={4}
                                        placeholder="About us (English)"
                                        value={settings.aboutUs_en || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label">About Us (Persian)</label>
                                    <textarea
                                        name="aboutUs_fa"
                                        className="input min-h-[82px]"
                                        rows={4}
                                        placeholder="About us (فارسی)"
                                        value={settings.aboutUs_fa || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label">About Us (Pashto)</label>
                                    <textarea
                                        name="aboutUs_ps"
                                        className="input min-h-[82px]"
                                        rows={4}
                                        placeholder="About us (پښتو)"
                                        value={settings.aboutUs_ps || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="card p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                                    <FiShare2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold">Social Media Links</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Facebook URL</label>
                                    <input
                                        type="url"
                                        name="socialFacebook"
                                        className="input"
                                        placeholder="https://facebook.com/..."
                                        value={settings.socialFacebook || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label">Instagram URL</label>
                                    <input
                                        type="url"
                                        name="socialInstagram"
                                        className="input"
                                        placeholder="https://instagram.com/..."
                                        value={settings.socialInstagram || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label">Twitter (X) URL</label>
                                    <input
                                        type="url"
                                        name="socialTwitter"
                                        className="input"
                                        placeholder="https://twitter.com/..."
                                        value={settings.socialTwitter || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        name="socialLinkedin"
                                        className="input"
                                        placeholder="https://linkedin.com/..."
                                        value={settings.socialLinkedin || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label">YouTube URL</label>
                                    <input
                                        type="url"
                                        name="socialYoutube"
                                        className="input"
                                        placeholder="https://youtube.com/..."
                                        value={settings.socialYoutube || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label">TikTok URL</label>
                                    <input
                                        type="url"
                                        name="socialTiktok"
                                        className="input"
                                        placeholder="https://tiktok.com/..."
                                        value={settings.socialTiktok || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'partnership' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="card p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                        <FiFileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Partnership Agreement Content</h2>
                                        <p className="text-sm text-gray-400">Edit the Partnership Agreement text. Use Markdown (# for headers) to format.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label className="label mb-2 block">English Version</label>
                                    <textarea
                                        name="partnershipAgreement_en"
                                        className="input min-h-[400px] font-mono text-sm leading-relaxed"
                                        value={settings.partnershipAgreement_en || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Persian (فارسی) Version</label>
                                    <textarea
                                        name="partnershipAgreement_fa"
                                        className="input min-h-[400px] font-mono text-sm leading-relaxed text-right"
                                        dir="rtl"
                                        value={settings.partnershipAgreement_fa || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Pashto (پښتو) Version</label>
                                    <textarea
                                        name="partnershipAgreement_ps"
                                        className="input min-h-[400px] font-mono text-sm leading-relaxed text-right"
                                        dir="rtl"
                                        value={settings.partnershipAgreement_ps || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'termination' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="card p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                        <FiFileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Termination Notice Content</h2>
                                        <p className="text-sm text-gray-400">Edit the Termination Notice text. Use Markdown (# for headers) to format.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label className="label mb-2 block">English Version</label>
                                    <textarea
                                        name="terminationNotice_en"
                                        className="input min-h-[400px] font-mono text-sm leading-relaxed"
                                        value={settings.terminationNotice_en || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Persian (فارسی) Version</label>
                                    <textarea
                                        name="terminationNotice_fa"
                                        className="input min-h-[400px] font-mono text-sm leading-relaxed text-right"
                                        dir="rtl"
                                        value={settings.terminationNotice_fa || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Pashto (پښتو) Version</label>
                                    <textarea
                                        name="terminationNotice_ps"
                                        className="input min-h-[400px] font-mono text-sm leading-relaxed text-right"
                                        dir="rtl"
                                        value={settings.terminationNotice_ps || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary shadow-xl px-8 py-4 text-base font-bold"
                >
                    {loading ? 'Saving Changes...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
