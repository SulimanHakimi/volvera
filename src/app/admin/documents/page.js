'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFile, FiDownload, FiCheck, FiX, FiFilter, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

export default function DocumentsPage() {
    const router = useRouter();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('/api/admin/documents', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(res.data.files || []);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (fileId, newStatus) => {
        const isReject = newStatus === 'rejected';
        const confirmMsg = isReject
            ? "Are you sure you want to REJECT and DELETE this document? This action cannot be undone."
            : `Are you sure you want to ${newStatus} this document?`;

        if (!confirm(confirmMsg)) return;

        setUpdatingId(fileId);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.patch(`/api/admin/documents/${fileId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (isReject) {
                setFiles(prev => prev.filter(f => f._id !== fileId));
            } else {
                setFiles(prev => prev.map(f =>
                    f._id === fileId ? { ...f, status: newStatus } : f
                ));
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCategoryChange = async (fileId, newCategory) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.patch(`/api/admin/documents/${fileId}`,
                { category: newCategory },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFiles(prev => prev.map(f =>
                f._id === fileId ? { ...f, category: newCategory } : f
            ));
        } catch (error) {
            alert('Failed to update category');
        }
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch =
            (file.originalName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (file.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (file.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || file.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <Loader fullScreen={false} size="large" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Document Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Review and manage user uploaded documents</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card p-5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by file name, user, email..."
                            className="input pl-12 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="input px-5"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Files List */}
            <div className="space-y-4">
                {filteredFiles.length === 0 ? (
                    <div className="card p-20 text-center">
                        <FiFile className="w-20 h-20 mx-auto mb-4 text-gray-600 opacity-30" />
                        <p className="text-gray-400 text-lg">No documents found</p>
                    </div>
                ) : (
                    filteredFiles.map((file) => (
                        <motion.div
                            key={file._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[var(--accent)]/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-5 flex-1">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                                    <FiFile className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white truncate" title={file.originalName}>{file.originalName}</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Size: {(file.size / 1024 / 1024).toFixed(2)} MB •
                                        Uploaded {new Date(file.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-6 text-sm items-center">
                                        <div>
                                            <span className="text-gray-400">User:</span>{' '}
                                            <span className="text-white font-medium">{file.user?.name || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Email:</span>{' '}
                                            <span className="text-[var(--accent)]">{file.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                                            <span className="text-gray-400">Category:</span>
                                            <select
                                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:border-[var(--accent)] outline-none"
                                                value={file.category || 'other'}
                                                onChange={(e) => handleCategoryChange(file._id, e.target.value)}
                                            >
                                                <option value="contract">Contract</option>
                                                <option value="identity">Identity</option>
                                                <option value="channel_proof">Channel Proof</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                <span className={`px-4 py-2 rounded-full text-xs font-bold border ${file.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    file.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    }`}>
                                    {file.status.toUpperCase()}
                                </span>

                                <div className="flex gap-3">
                                    <a
                                        href={file.path}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary p-3 hover:bg-[var(--accent)]/10 transition-all"
                                        title="Download File"
                                    >
                                        <FiDownload className="w-5 h-5" />
                                    </a>

                                    {file.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(file._id, 'approved')}
                                                disabled={updatingId === file._id}
                                                className="btn bg-green-500/20 hover:bg-green-500/30 text-green-400 p-3 disabled:opacity-50 transition-all"
                                                title="Approve"
                                            >
                                                <FiCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(file._id, 'rejected')}
                                                disabled={updatingId === file._id}
                                                className="btn bg-red-500/20 hover:bg-red-500/30 text-red-400 p-3 disabled:opacity-50 transition-all"
                                                title="Reject"
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
