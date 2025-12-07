'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import axios from 'axios';

export default function UploadDocuments() {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const [category, setCategory] = useState('identity');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            setMessage('Maximum 5 files allowed');
            return;
        }
        setFiles([...files, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage('Please select files to upload');
            return;
        }

        setUploading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();

            files.forEach(file => {
                formData.append('files', file);
            });
            formData.append('category', category);

            const response = await axios.post('/api/documents/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('Files uploaded successfully!');
            setFiles([]);

            // Refresh page after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Upload error:', error);
            setMessage(error.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">{t('dashboard.upload_documents')}</h2>
            <p className="text-sm text-[#9aa4b2] mb-6">{t('dashboard.upload_documents_subtitle')}</p>

            <div className="space-y-4">
                {/* Category Selection */}
                <div>
                    <label className="text-xs text-[#9aa4b2] mb-2 block font-medium">{t('dashboard.document_category')}</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input"
                    >
                        <option value="identity">{t('documents.identity')}</option>
                        <option value="channel_proof">{t('documents.channel_proof')}</option>
                        <option value="other">{t('documents.other')}</option>
                    </select>
                </div>

                {/* File Input */}
                <div>
                    <label className="text-xs text-[#9aa4b2] mb-2 block font-medium">{t('dashboard.select_files')}</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="input"
                        accept=".pdf,.jpg,.jpeg,.png"
                    />
                </div>

                {/* Selected Files List */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-xs text-[#9aa4b2] font-medium">{t('dashboard.selected_files')} ({files.length})</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-[rgba(255,255,255,0.03)] p-3 rounded-lg border border-[rgba(255,255,255,0.03)]">
                                    <div className="flex items-center gap-2">
                                        <FiFile className="text-[#06b6d4]" />
                                        <span className="text-sm">{file.name}</span>
                                        <span className="text-xs text-[#9aa4b2]">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message */}
                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.includes('success')
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={uploading || files.length === 0}
                    className="btn btn-primary w-full"
                >
                    <FiUpload className="mr-2" />
                    {uploading ? t('documents.uploading') : t('documents.upload_button')}
                </button>
            </div>
        </div>
    );
}
