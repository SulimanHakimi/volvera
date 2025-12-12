'use client';

import { useState, useEffect } from 'react';
import { FiBriefcase, FiUpload, FiShare2 } from 'react-icons/fi';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        companyRegistrationNumber: '',
        companyAddress: '',
        companySignatureUrl: '',
        socialFacebook: '',
        socialTwitter: '',
        socialInstagram: '',
        socialLinkedin: '',
        socialYoutube: '',
        socialTiktok: ''
    });
    const [signatureFile, setSignatureFile] = useState(null);

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
                if (res.data && Object.keys(res.data).length > 0) {
                    setSettings(prev => ({ ...prev, ...res.data }));
                }
            } catch (error) {
                console.error('Failed to load settings');
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSignatureFile(e.target.files[0]);
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

            // Save all settings
            const settingsToSave = {
                ...settings,
                companySignatureUrl: signatureUrl
            };

            await axios.post('/api/admin/settings', settingsToSave, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSignatureFile(null); // Clear selected file after successful save
            alert('Settings saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">Platform Settings</h1>
                <p className="text-gray-400 text-sm">Configure general website settings.</p>
            </div>

            <div className="grid gap-6">

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
                                            /* Preview local blob if selected */
                                            <img
                                                src={URL.createObjectURL(signatureFile)}
                                                alt="New Signature Preview"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : (
                                            /* Show existing URL */
                                            <img
                                                src={settings.companySignatureUrl}
                                                alt="Current Signature"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
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

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>

    );
}
