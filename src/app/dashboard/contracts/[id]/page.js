'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiChevronLeft, FiDownload, FiCheckCircle, FiClock, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import axios from 'axios';
import UploadSignedContract from '@/components/UploadSignedContract';

export default function ContractDetailsPage({ params }) {
    const { t } = useTranslation();
    const { id } = use(params);
    const router = useRouter();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [terminationLoading, setTerminationLoading] = useState(false);
    const [downloadingLang, setDownloadingLang] = useState(null);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return router.push('/login');

                const res = await axios.get('/api/contracts', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const found = res.data.contracts.find(c => c._id === id);
                if (found) {
                    setContract(found);
                    // If this is a termination request that has been approved, sign the user out
                    if (found.type === 'termination' && found.status === 'approved') {
                        try {
                            alert('Your account has been deactivated by admin. You will be logged out.');
                        } catch (err) { }
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
                        window.dispatchEvent(new Event('user-auth-change'));
                        router.push('/login');
                        return;
                    }
                } else {
                    // router.push('/dashboard');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, [id, router]);

    const handleRequestTermination = async () => {
        if (!confirm('Are you sure you want to request termination for this contract? This action cannot be undone.')) return;

        setTerminationLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const { originalData, originalLanguage, user } = contract;

            // Create a new contract of type 'termination'
            await axios.post('/api/contracts', {
                originalLanguage,
                fullName: originalData.fullName,
                email: originalData.email,
                phone: originalData.phone,
                country: originalData.country,
                platforms: originalData.platforms,
                message: "Termination Request for Contract #" + contract.contractNumber,
                type: 'termination',
                relatedContract: contract._id,
                status: 'submitted'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            router.push('/dashboard?success=termination-requested');
        } catch (error) {
            console.error(error);
            alert('Failed to request termination.');
        } finally {
            setTerminationLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>;
    if (!contract) return <div className="p-8 text-center text-gray-400">Contract not found</div>;

    const isPartnership = contract.type === 'partnership' || !contract.type;
    const isTermination = contract.type === 'termination';

    const handleDownload = async (lang) => {
        setDownloadingLang(lang);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`/api/contracts/${contract._id}/pdf?lang=${lang}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `contract-${contract.contractNumber}-${lang}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            if (error.response?.status === 401) {
                router.push('/login');
            } else {
                alert('Failed to download contract. Please try again.');
            }
        } finally {
            setDownloadingLang(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1220] pb-20 pt-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-[#9aa4b2] hover:text-white transition-colors mb-6 text-sm font-medium"
                >
                    <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[#06b6d4] group-hover:text-white transition-all">
                        <FiArrowLeft />
                    </div>
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isTermination ? 'Termination Request' : 'Contract Details'}
                        </h1>
                        <div className="flex items-center gap-2 text-[#9aa4b2] text-sm">
                            <span>Reference ID:</span>
                            <span className="font-mono text-white/70 tracking-wide bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                #{contract.contractNumber}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Status Card */}
                    <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold mb-1">{t('dashboard.current_status')}</h2>
                            <div className="flex items-center gap-2 text-gray-400">
                                Updates regarding your {isTermination ? 'termination request' : 'partnership'}
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 font-bold uppercase tracking-wider
                        ${contract.status === 'approved' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                                contract.status === 'rejected' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                    'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                            }
                    `}>
                            {contract.status === 'approved' ? <FiCheckCircle /> :
                                contract.status === 'rejected' ? <FiXCircle /> : <FiClock />}
                            {contract.status.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="md:col-span-2 space-y-6">
                            <section className="card p-6">
                                <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-4">{t('dashboard.personal_information')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="text-gray-400 block mb-1">{t('dashboard.full_name')}</label>
                                        <div className="font-medium">{contract.originalData.fullName}</div>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 block mb-1">Email</label>
                                        <div className="font-medium">{contract.originalData.email}</div>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 block mb-1">Phone</label>
                                        <div className="font-medium">{contract.originalData.phone}</div>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 block mb-1">Country</label>
                                        <div className="font-medium">{contract.originalData.country}</div>
                                    </div>
                                </div>
                            </section>

                            <section className="card p-6">
                                <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-4">Platforms</h3>
                                <div className="space-y-4">
                                    {contract.originalData.platforms.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                            <span className="font-medium">{p.platformName}</span>
                                            <a href={p.link} target="_blank" className="text-purple-400 hover:underline text-sm truncate max-w-[200px]">
                                                {p.link}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar / Actions */}
                        <div className="space-y-6">
                            <div className="card p-6">
                                <h3 className="font-bold mb-4">{t('dashboard.official_contract')}</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleDownload('en')}
                                        disabled={downloadingLang !== null}
                                        className="btn btn-secondary w-full justify-center flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {downloadingLang === 'en' ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <FiDownload />}
                                        {downloadingLang === 'en' ? 'Downloading...' : 'Download (English)'}
                                    </button>
                                    <button
                                        onClick={() => handleDownload('fa')}
                                        disabled={downloadingLang !== null}
                                        className="btn btn-secondary w-full justify-center flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {downloadingLang === 'fa' ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <FiDownload />}
                                        {downloadingLang === 'fa' ? 'Downloading...' : 'Download (Persian)'}
                                    </button>
                                    <button
                                        onClick={() => handleDownload('ps')}
                                        disabled={downloadingLang !== null}
                                        className="btn btn-secondary w-full justify-center flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {downloadingLang === 'ps' ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <FiDownload />}
                                        {downloadingLang === 'ps' ? 'Downloading...' : 'Download (Pashto)'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 text-center mt-3">
                                    Generated on {new Date(contract.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Upload Signed Contract (Only for Partnership) */}
                            {isPartnership && (
                                <UploadSignedContract
                                    contractId={contract._id}
                                    status={contract.status}
                                    signedUrl={contract.signedContractUrl}
                                />
                            )}

                            {/* Termination Request Button */}
                            {isPartnership && contract.status === 'approved' && (
                                <div className="card p-6 border-red-500/20 bg-red-500/5">
                                    <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                                        <FiAlertCircle /> Termination
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Wish to end your partnership? You can request a contract termination here.
                                    </p>
                                    <button
                                        onClick={handleRequestTermination}
                                        disabled={terminationLoading}
                                        className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-semibold"
                                    >
                                        {terminationLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                                Requesting...
                                            </div>
                                        ) : 'Request Termination'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
