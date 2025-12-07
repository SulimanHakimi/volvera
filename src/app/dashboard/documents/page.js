'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiTrash2, FiDownload, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function DocumentsPage() {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('/api/upload', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(res.data.files);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('accessToken');
            await axios.post('/api/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchFiles(); // Refresh list
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] pb-20">
            {/* Header */}
            <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold">{t('dashboard.my_documents')}</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Upload Area */}
                <div className="card p-8 mb-8 border-dashed border-2 border-white/20 hover:border-purple-500/50 transition-colors text-center">
                    <input
                        type="file"
                        onChange={handleUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className={`cursor-pointer flex flex-col items-center gap-4 ${uploading ? 'opacity-50' : ''}`}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                            {uploading ? (
                                <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <FiUpload className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Click to Upload File</h3>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                Upload contracts, ID proofs, or any other relevant documents. Max size 10MB.
                            </p>
                        </div>
                    </label>
                </div>

                {/* File List */}
                <h2 className="text-xl font-bold mb-4">{t('dashboard.uploaded_files')}</h2>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : files.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No files uploaded yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file) => (
                            <motion.div
                                key={file._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-4 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                            <FiFile className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium truncate max-w-[200px]" title={file.originalName}>
                                                {file.originalName}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        {file.status === 'approved' && <FiCheck className="text-green-500" />}
                                        {file.status === 'rejected' && <FiX className="text-red-500" />}
                                        {file.status === 'pending' && <FiClock className="text-yellow-500" />}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={file.path}
                                        target="_blank"
                                        download
                                        className="btn btn-secondary flex-1 py-1.5 text-xs"
                                    >
                                        <FiDownload /> Download
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
