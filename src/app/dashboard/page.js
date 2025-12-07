'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

import ApplyFormModal from "@/components/forms/ApplyFormModal";

import UploadDocuments from '@/components/UploadDocuments';

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const { data: session, status } = useSession();
    useEffect(() => {
        if (status === 'authenticated' && session) {
            localStorage.setItem('accessToken', session.accessToken);
            localStorage.setItem('refreshToken', session.refreshToken);
            localStorage.setItem('user', JSON.stringify(session.user));
        }
    }, [session, status]);
    useEffect(() => {
        const checkAuth = async () => {
            if (status === 'loading') return;

            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken');

            if (session?.user) {
                setUser(session.user);
                if (token) fetchContracts(token);
                else setLoading(false);
                return;
            }
            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
                fetchContracts(token);
                return;
            }

            router.push('/login');
        };

        checkAuth();
    }, [router, session, status]);

    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0
    });

    const fetchStats = async (token) => {
        try {
            const response = await axios.get('/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats({
                total: response.data.totalContracts,
                approved: response.data.approved,
                pending: response.data.pending
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchContracts = async (token) => {
        try {
            const response = await axios.get('/api/contracts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setContracts(response.data.contracts);
            fetchStats(token);
        } catch (error) {
            console.error('Failed to fetch contracts:', error);
        } finally {
            setLoading(false);
        }
    };


    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            under_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            approved: 'bg-green-500/20 text-green-400 border-green-500/30',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colors[status] || colors.draft;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] mt-8">
            <ApplyFormModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {t('dashboard.welcome')}, {user?.name}!
                        </h1>
                        <p className="text-gray-400">
                            Manage your contracts and track your partnership status
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="text-sm text-gray-400 mb-2">{t('dashboard.total_contracts')}</div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    {stats.total}
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="text-sm text-gray-400 mb-2">Approved</div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                    {stats.approved}
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="text-sm text-gray-400 mb-2">Pending</div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                    {stats.pending}
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                        </motion.div>
                    </div>

                    {/* Contracts Section */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">{t('dashboard.my_contracts')}</h2>
                            <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary">
                                {t('dashboard.new_contract')}
                            </button>
                        </div>

                        {contracts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-400 mb-6">
                                    {t('dashboard.no_contracts')}
                                </p>
                                <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary">
                                    Create Your First Contract
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Contract #</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Language</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Status</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Date</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contracts.map((contract) => (
                                            <tr key={contract._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-mono text-sm">
                                                    <div>{contract.contractNumber}</div>
                                                    {contract.type === 'termination' && (
                                                        <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold">Termination</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-sm">
                                                    {contract.originalLanguage === 'fa' ? 'Persian' : 'Pashto'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                                                        {contract.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-400">
                                                    {new Date(contract.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Link href={`/dashboard/contracts/${contract._id}`} className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Document Upload Section */}
                    <div className="mt-8">
                        <UploadDocuments />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
