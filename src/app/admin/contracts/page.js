'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFileText, FiDownload, FiEye, FiCheck, FiX, FiFilter, FiAlertCircle, FiX as FiClose } from 'react-icons/fi';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

export default function ContractsPage() {
    const router = useRouter();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [downloadingFile, setDownloadingFile] = useState(null);

    const [updatingId, setUpdatingId] = useState(null);

    // PDF Viewer State
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!token || !user || user.role !== 'admin') {
                router.push('/login');
                return;
            }

            const res = await axios.get('/api/admin/contracts', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setContracts(res.data.contracts || []);
        } catch (error) {
            console.error('Failed to fetch contracts:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Open PDF in modal
    const handleViewPdf = async (contract) => {
        setPdfLoading(true);
        setIsPdfModalOpen(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`/api/contracts/${contract._id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            setIsPdfModalOpen(false);
        } finally {
            setPdfLoading(false);
        }
    };

    // Download PDF
    const handleDownload = async (contract, lang = 'en') => {
        setDownloadingFile(`${contract._id}-${lang}`);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`/api/contracts/${contract._id}/pdf?lang=${lang}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `VOLVERA_Contract_${contract._id}_${lang}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download PDF');
        } finally {
            setDownloadingFile(null);
        }
    };

    const handleStatusChange = async (contractId, newStatus) => {
        if (!confirm(`Are you sure you want to ${newStatus} this contract?`)) return;

        setUpdatingId(contractId);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.patch(`/api/admin/contracts/${contractId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setContracts(prev => prev.map(c =>
                c._id === contractId ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredContracts = contracts.filter(contract => {
        const matchesSearch =
            (contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contract.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contract.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <Loader fullScreen={false} size="large" />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Contract Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Review, approve, or reject creator applications</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="card p-6 flex items-center gap-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                        <FiAlertCircle className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">
                            {contracts.filter(c => ['submitted', 'under_review', 'pending'].includes(c.status)).length}
                        </div>
                        <div className="text-sm text-gray-400">Pending Review</div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                        <FiCheck className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">
                            {contracts.filter(c => c.status === 'approved').length}
                        </div>
                        <div className="text-sm text-gray-400">Approved</div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-5 bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
                        <FiX className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">
                            {contracts.filter(c => c.status === 'rejected').length}
                        </div>
                        <div className="text-sm text-gray-400">Rejected</div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card p-5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, name, email..."
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
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Contracts List */}
            <div className="space-y-4">
                {filteredContracts.length === 0 ? (
                    <div className="card p-20 text-center">
                        <FiFileText className="w-20 h-20 mx-auto mb-4 text-gray-600 opacity-30" />
                        <p className="text-gray-400 text-lg">No contracts found</p>
                    </div>
                ) : (
                    filteredContracts.map((contract) => (
                        <motion.div
                            key={contract._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[var(--accent)]/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-5 flex-1">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                                    <FiFileText className="w-8 h-8 text-[var(--accent)]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white">Partnership Agreement</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        ID: <span className="text-[var(--accent)] font-semibold">{contract.contractNumber || contract._id.slice(-8)}</span> •
                                        Submitted {new Date(contract.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-6 text-sm">
                                        <div>
                                            <span className="text-gray-400">Creator:</span>{' '}
                                            <span className="text-white font-medium">{contract.user?.name || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Email:</span>{' '}
                                            <span className="text-[var(--accent)]">{contract.user?.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Language:</span>{' '}
                                            <span className="text-white">
                                                {contract.originalLanguage === 'fa' ? 'فارسی' :
                                                    contract.originalLanguage === 'ps' ? 'پښتو' : 'English'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                <span className={`px-4 py-2 rounded-full text-xs font-bold border ${contract.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    contract.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    }`}>
                                    {contract.status.replace('_', ' ').toUpperCase()}
                                </span>

                                <div className="flex gap-3">
                                    {/* View PDF */}
                                    <button
                                        onClick={() => handleViewPdf(contract)}
                                        className="btn btn-secondary p-3 hover:bg-[var(--accent)]/10 transition-all"
                                        title="View Contract PDF"
                                    >
                                        <FiEye className="w-5 h-5" />
                                    </button>

                                    {/* Download PDF Buttons */}
                                    <button
                                        onClick={() => handleDownload(contract, 'en')}
                                        disabled={downloadingFile !== null}
                                        className="btn btn-secondary p-3 hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Download English PDF"
                                    >
                                        <div className="relative">
                                            {downloadingFile === `${contract._id}-en` ? (
                                                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FiDownload className="w-5 h-5" />
                                            )}
                                            <span className="absolute -top-2 -right-2 text-[0.6rem] bg-blue-500 px-1 rounded-full text-white">EN</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleDownload(contract, 'fa')}
                                        disabled={downloadingFile !== null}
                                        className="btn btn-secondary p-3 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Download Persian PDF"
                                    >
                                        <div className="relative">
                                            {downloadingFile === `${contract._id}-fa` ? (
                                                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FiDownload className="w-5 h-5" />
                                            )}
                                            <span className="absolute -top-2 -right-2 text-[0.6rem] bg-cyan-500 px-1 rounded-full text-white">FA</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleDownload(contract, 'ps')}
                                        disabled={downloadingFile !== null}
                                        className="btn btn-secondary p-3 hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Download Pashto PDF"
                                    >
                                        <div className="relative">
                                            {downloadingFile === `${contract._id}-ps` ? (
                                                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FiDownload className="w-5 h-5" />
                                            )}
                                            <span className="absolute -top-2 -right-2 text-[0.6rem] bg-green-500 px-1 rounded-full text-white">PS</span>
                                        </div>
                                    </button>

                                    {['submitted', 'under_review', 'pending'].includes(contract.status) && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(contract._id, 'approved')}
                                                disabled={updatingId === contract._id}
                                                className="btn bg-green-500/20 hover:bg-green-500/30 text-green-400 p-3 disabled:opacity-50 transition-all"
                                                title="Approve"
                                            >
                                                <FiCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(contract._id, 'rejected')}
                                                disabled={updatingId === contract._id}
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

            {/* PDF Viewer Modal */}
            {isPdfModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] border border-purple-500/30"
                    >
                        <button
                            onClick={() => {
                                setIsPdfModalOpen(false);
                                setPdfUrl(null);
                            }}
                            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all"
                        >
                            <FiClose className="w-7 h-7 text-white" />
                        </button>

                        <div className="h-full flex flex-col">
                            <div className="px-6 py-4 border-b border-purple-500/30">
                                <h2 className="text-2xl font-bold text-white">Contract Preview</h2>
                            </div>

                            <div className="flex-1 overflow-hidden bg-gray-800">
                                {pdfLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                                    </div>
                                ) : pdfUrl ? (
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full h-full border-0"
                                        title="Contract PDF"
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        Failed to load PDF
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}