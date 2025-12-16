'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFileText, FiDownload, FiEye, FiCheck, FiX, FiFilter, FiAlertCircle, FiX as FiClose, FiInfo } from 'react-icons/fi';
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

    const [pdfUrl, setPdfUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);

    const [selectedContract, setSelectedContract] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

    const handleViewPdf = async (contract) => {
        setPdfLoading(true);
        setPdfError(null);
        setPdfUrl(null);
        setIsPdfModalOpen(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`/api/contracts/${contract._id}/pdf?lang=en`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error(error);
            setPdfError('Failed to generate PDF preview. ' + (error.message || ''));
        } finally {
            setPdfLoading(false);
        }
    };

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
            link.setAttribute('download', `VOLVERA_${contract.type || 'Contract'}_${contract.contractNumber || contract._id}_${lang}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(error);
            const msg = error.response?.status === 500 ? 'Server error generating PDF' : 'Failed to download PDF';
            alert(`${msg}. Please try again.`);
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

    const handleViewDetails = (contract) => {
        setSelectedContract(contract);
        setIsDetailsModalOpen(true);
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
                    <div className="relative flex-2">
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
                            className="card p-5 md:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[var(--accent)]/50 transition-all duration-300 group"
                        >
                            <div className="flex items-start gap-4 flex-1 w-full">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <FiFileText className="w-6 h-6 md:w-8 md:h-8 text-[var(--accent)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-lg md:text-xl font-bold text-white truncate">
                                            {contract.type === 'termination' ? 'Termination Request' : 'Partnership Agreement'}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${contract.type === 'termination' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                            {contract.type === 'termination' ? 'Termination' : 'Partnership'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                                            ID: <span className="font-mono text-gray-300">{contract.contractNumber || contract._id.slice(-8)}</span>
                                        </span>
                                        <span className="hidden sm:inline text-gray-600">•</span>
                                        <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 text-xs uppercase tracking-wider">Creator:</span>
                                            <span className="text-white font-medium truncate max-w-[150px]">{contract.user?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 text-xs uppercase tracking-wider">Email:</span>
                                            <span className="text-[var(--accent)] truncate max-w-[200px]">{contract.user?.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border w-fit ${contract.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    contract.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    }`}>
                                    {contract.status.replace('_', ' ').toUpperCase()}
                                </span>

                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    {/* View Details */}
                                    <button
                                        onClick={() => handleViewDetails(contract)}
                                        className="btn btn-secondary p-2.5 hover:bg-[var(--accent)]/10 transition-all flex-1 sm:flex-none justify-center flex items-center gap-2"
                                        title="View Details"
                                    >
                                        <FiInfo className="w-5 h-5 flex-shrink-0" />
                                    </button>

                                    {/* View PDF */}
                                    <button
                                        onClick={() => handleViewPdf(contract)}
                                        className="btn btn-secondary p-2.5 hover:bg-[var(--accent)]/10 transition-all flex-1 sm:flex-none justify-center flex items-center gap-2"
                                        title="View Contract PDF"
                                    >
                                        <FiEye className="w-5 h-5 flex-shrink-0" />
                                    </button>

                                    {/* Download PDF Buttons - Grouped visually */}
                                    <div className="flex gap-1 flex-1 sm:flex-none bg-white/5 rounded-lg p-1">
                                        <button
                                            onClick={() => handleDownload(contract, 'en')}
                                            disabled={downloadingFile !== null}
                                            className="p-1.5 rounded hover:bg-white/10 transition-all disabled:opacity-50 text-xs font-bold text-blue-400 flex items-center gap-1 justify-center"
                                            title="Download English PDF"
                                        >
                                            <FiDownload className="w-3 h-3 flex-shrink-0" />
                                            EN
                                        </button>
                                        <div className="w-[1px] bg-white/10 my-1"></div>
                                        <button
                                            onClick={() => handleDownload(contract, 'fa')}
                                            disabled={downloadingFile !== null}
                                            className="p-1.5 rounded hover:bg-white/10 transition-all disabled:opacity-50 text-xs font-bold text-cyan-400 flex items-center gap-1 justify-center"
                                            title="Download Persian PDF"
                                        >
                                            <FiDownload className="w-3 h-3 flex-shrink-0" />
                                            FA
                                        </button>
                                        <div className="w-[1px] bg-white/10 my-1"></div>
                                        <button
                                            onClick={() => handleDownload(contract, 'ps')}
                                            disabled={downloadingFile !== null}
                                            className="p-1.5 rounded hover:bg-white/10 transition-all disabled:opacity-50 text-xs font-bold text-green-400 flex items-center gap-1 justify-center"
                                            title="Download Pashto PDF"
                                        >
                                            <FiDownload className="w-3 h-3 flex-shrink-0" />
                                            PS
                                        </button>
                                    </div>

                                    {['submitted', 'under_review', 'pending'].includes(contract.status) && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(contract._id, 'approved')}
                                                disabled={updatingId === contract._id}
                                                className="btn bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2.5 disabled:opacity-50 transition-all flex-1 sm:flex-none justify-center"
                                                title="Approve"
                                            >
                                                <FiCheck className="w-5 h-5 flex-shrink-0" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(contract._id, 'rejected')}
                                                disabled={updatingId === contract._id}
                                                className="btn bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2.5 disabled:opacity-50 transition-all flex-1 sm:flex-none justify-center"
                                                title="Reject"
                                            >
                                                <FiX className="w-5 h-5 flex-shrink-0" />
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
                        className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] border border-purple-500/30 flex flex-col"
                    >
                        <button
                            onClick={() => {
                                setIsPdfModalOpen(false);
                                setPdfUrl(null);
                            }}
                            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all border border-white/10"
                        >
                            <FiClose className="w-7 h-7 text-white" />
                        </button>

                        <div className="px-6 py-4 border-b border-purple-500/30 bg-gray-900 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-white">Contract Preview</h2>
                        </div>

                        <div className="flex-1 overflow-hidden bg-gray-800 rounded-b-2xl relative">
                            {pdfLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                                        <p className="text-white">Generating PDF...</p>
                                    </div>
                                </div>
                            ) : pdfError ? (
                                <div className="h-full flex flex-col items-center justify-center text-red-400 gap-4 p-8 text-center">
                                    <FiAlertCircle className="w-16 h-16" />
                                    <div>
                                        <p className="text-xl font-bold">Failed to load preview</p>
                                        <p className="text-sm mt-2">{pdfError}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsPdfModalOpen(false)}
                                        className="btn btn-primary mt-4"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full border-0 rounded-b-2xl"
                                    title="Contract PDF"
                                />
                            ) : null}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Contract Details Modal */}
            {isDetailsModalOpen && selectedContract && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--border)] flex flex-col"
                    >
                        <button
                            onClick={() => setIsDetailsModalOpen(false)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                        >
                            <FiClose className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="p-6 md:p-8 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Contract Details</h2>
                                <p className="text-gray-400 text-sm">Full information for {selectedContract.contractNumber}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <h3 className="text-[var(--accent)] font-semibold mb-3 text-sm uppercase tracking-wider">Creator Info</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Full Name</span>
                                                <span className="text-white font-medium">{selectedContract.originalData?.fullName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Email</span>
                                                <span className="text-white">{selectedContract.originalData?.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Phone</span>
                                                <span className="text-white">{selectedContract.originalData?.phone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Country</span>
                                                <span className="text-white">{selectedContract.originalData?.country}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <h3 className="text-[var(--accent)] font-semibold mb-3 text-sm uppercase tracking-wider">Contract Info</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Status</span>
                                                <span className={`px-2 py-0.5 rounded textxs font-semibold ${selectedContract.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                                    selectedContract.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {selectedContract.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Type</span>
                                                <span className="text-white capitalize">{selectedContract.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Original Language</span>
                                                <span className="text-white uppercase">{selectedContract.originalLanguage}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Submission Date</span>
                                                <span className="text-white">{new Date(selectedContract.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 h-full">
                                        <h3 className="text-[var(--accent)] font-semibold mb-3 text-sm uppercase tracking-wider">Platforms & Channels</h3>
                                        <div className="space-y-3">
                                            {selectedContract.originalData?.platforms?.map((p, i) => (
                                                <div key={i} className="flex flex-col gap-1 text-sm pb-2 border-b border-white/5 last:border-0 last:pb-0">
                                                    <span className="font-medium text-white">{p.platformName}</span>
                                                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline truncate block">
                                                        {p.link}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedContract.originalData?.message && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <h3 className="text-[var(--accent)] font-semibold mb-2 text-sm uppercase tracking-wider">Message</h3>
                                    <p className="text-gray-300 text-sm italic leading-relaxed">
                                        "{selectedContract.originalData.message}"
                                    </p>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}