'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiGlobe, FiLock, FiShield } from 'react-icons/fi';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'VOLVERA',
        contactEmail: 'volvera.se@hotmail.com',
        maxUploadSize: 10,
        allowedFileTypes: 'pdf, docx, jpg, png',
        allowRegistration: true,
        enableSocialLogin: true,
        maintenanceMode: false
    });

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

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post('/api/admin/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            alert('Failed to save settings');
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
                {/* General Settings */}
                <div className="card p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <FiGlobe className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">General Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Site Name</label>
                            <input
                                type="text"
                                name="siteName"
                                className="input"
                                value={settings.siteName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="label">Contact Email</label>
                            <input
                                type="email"
                                name="contactEmail"
                                className="input"
                                value={settings.contactEmail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Upload Settings */}
                <div className="card p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <FiSave className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Contract & File Settings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Max Upload Size (MB)</label>
                            <input
                                type="number"
                                name="maxUploadSize"
                                className="input"
                                value={settings.maxUploadSize}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="label">Allowed File Types</label>
                            <input
                                type="text"
                                name="allowedFileTypes"
                                className="input"
                                value={settings.allowedFileTypes}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="card p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                            <FiShield className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Security & Access</h2>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-sm font-medium">Allow New User Registrations</span>
                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-white/10 bg-white/5">
                                <input
                                    type="checkbox"
                                    name="allowRegistration"
                                    checked={settings.allowRegistration}
                                    onChange={handleChange}
                                    className="absolute w-full h-full opacity-0 cursor-pointer"
                                />
                                <span className={`absolute left-0 inline-block w-6 h-6 border rounded-full shadow transform transition-transform duration-200 ease-in-out ${settings.allowRegistration ? 'translate-x-6 bg-purple-500 border-purple-500' : 'translate-x-0 bg-gray-400 border-gray-400'}`}></span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-sm font-medium">Enable Social Login</span>
                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-white/10 bg-white/5">
                                <input
                                    type="checkbox"
                                    name="enableSocialLogin"
                                    checked={settings.enableSocialLogin}
                                    onChange={handleChange}
                                    className="absolute w-full h-full opacity-0 cursor-pointer"
                                />
                                <span className={`absolute left-0 inline-block w-6 h-6 border rounded-full shadow transform transition-transform duration-200 ease-in-out ${settings.enableSocialLogin ? 'translate-x-6 bg-purple-500 border-purple-500' : 'translate-x-0 bg-gray-400 border-gray-400'}`}></span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-sm font-medium">Maintenance Mode</span>
                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-white/10 bg-white/5">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="absolute w-full h-full opacity-0 cursor-pointer"
                                />
                                <span className={`absolute left-0 inline-block w-6 h-6 border rounded-full shadow transform transition-transform duration-200 ease-in-out ${settings.maintenanceMode ? 'translate-x-6 bg-purple-500 border-purple-500' : 'translate-x-0 bg-gray-400 border-gray-400'}`}></span>
                            </div>
                        </label>
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
        </div>
    );
}
