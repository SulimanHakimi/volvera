// components/UploadSignedContract.jsx
'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiFileText } from 'react-icons/fi';

export default function UploadSignedContract({ contractId, status, signedUrl }) {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.post(`/api/contracts/${contractId}/upload-signed`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage(res.data.message);
            setFile(null);
            // Optional: refresh page or update parent state
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (status === 'signed' && signedUrl) {
        return (
            <div className="card p-6 bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3 text-green-400">
                    <FiCheckCircle className="w-8 h-8" />
                    <div>
                        <p className="font-semibold">{t('dashboard.contract_signed_uploaded')}</p>
                        <a href={signedUrl} target="_blank" className="text-sm underline hover:text-green-300">
                            View Signed Contract
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (status !== 'approved') {
        return (
            <div className="card p-6 bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-3 text-yellow-400">
                    <FiAlertCircle className="w-6 h-6" />
                    <p>Waiting for admin approval to upload signed contract</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <FiFileText /> Upload Signed Contract
            </h3>
            <p className="text-sm text-gray-400 text-[#9aa4b2]">
                Please download the contract, print it, sign it with ink, scan or photograph it clearly, then upload here.
            </p>

            <div className="space-y-4">
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-sm text-[#9aa4b2] file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#06b6d4]/10 file:text-[#06b6d4] hover:file:bg-[#06b6d4]/20 cursor-pointer"
                />

                {file && (
                    <div className="text-sm text-gray-300">
                        Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    {uploading ? (
                        <>Uploading...</>
                    ) : (
                        <>
                            <FiUpload /> Upload Signed Contract
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}