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
                            {t('dashboard.manage_subtitle')}
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
                                <div className="text-sm text-gray-400 mb-2">{t('dashboard.approved')}</div>
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
                                <div className="text-sm text-gray-400 mb-2">{t('dashboard.pending')}</div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                    {stats.pending}
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                        </motion.div>
                    </div>

                    {/* Contract Template Downloads */}
                    <div className="card p-6 mb-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{t('dashboard.contract_agreement')}</h2>
                                <p className="text-gray-400 text-sm">{t('dashboard.download_template_desc')}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a
                                href="/api/contract-template?lang=en"
                                target="_blank"
                                className="group relative overflow-hidden p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:from-purple-500/10 hover:border-purple-500/30 transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl">🇬🇧</span>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{t('dashboard.english_template').split(' ')[0]}</h3>
                                <p className="text-sm text-gray-400">{t('dashboard.english_template')}</p>
                            </a>

                            <a
                                href="/api/contract-template?lang=fa"
                                target="_blank"
                                className="group relative overflow-hidden p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:from-cyan-500/10 hover:border-cyan-500/30 transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl">🇮🇷</span>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{t('dashboard.persian')}</h3>
                                <p className="text-sm text-gray-400">{t('dashboard.persian_template')}</p>
                            </a>

                            <a
                                href="/api/contract-template?lang=ps"
                                target="_blank"
                                className="group relative overflow-hidden p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:from-green-500/10 hover:border-green-500/30 transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl">🇦🇫</span>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{t('dashboard.pashto')}</h3>
                                <p className="text-sm text-gray-400">{t('dashboard.pashto_template')}</p>
                            </a>
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm">
                                    <p className="text-blue-300 font-medium mb-1">{t('dashboard.template_box_title')}</p>
                                    <p className="text-gray-400">{t('dashboard.template_box_desc')}</p>
                                </div>
                            </div>
                        </div>
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
                                    {t('dashboard.create_first_contract')}
                                </button>
                            </div>
                        ) : (
                            <div className="h-fit">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">{t('dashboard.contract_number')}</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">{t('dashboard.language')}</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">{t('dashboard.status')}</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">{t('dashboard.date')}</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">{t('dashboard.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contracts.map((contract) => (
                                            <tr key={contract._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-mono text-sm">
                                                    <div>{contract.contractNumber}</div>
                                                    {contract.type === 'termination' && (
                                                        <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold">{t('dashboard.termination')}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-sm">
                                                    {contract.originalLanguage === 'fa' ? t('dashboard.persian') : contract.originalLanguage === 'ps' ? t('dashboard.pashto') : 'English'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                                                        {t('contract.' + contract.status)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-400">
                                                    {new Date(contract.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/dashboard/contracts/${contract._id}`} className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                                                            {t('dashboard.view_details')}
                                                        </Link>
                                                        <div className="relative group">
                                                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </button>
                                                            <div className="absolute right-0 mt-2 w-48 bg-[#1a2332] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                                <div className="p-2 space-y-1">
                                                                    <a
                                                                        href={`/api/contracts/${contract._id}/pdf?lang=en`}
                                                                        target="_blank"
                                                                        className="block px-3 py-2 text-sm hover:bg-white/5 rounded transition-colors"
                                                                    >
                                                                        📄 English
                                                                    </a>
                                                                    <a
                                                                        href={`/api/contracts/${contract._id}/pdf?lang=fa`}
                                                                        target="_blank"
                                                                        className="block px-3 py-2 text-sm hover:bg-white/5 rounded transition-colors"
                                                                    >
                                                                        📄 {t('dashboard.persian')}
                                                                    </a>
                                                                    <a
                                                                        href={`/api/contracts/${contract._id}/pdf?lang=ps`}
                                                                        target="_blank"
                                                                        className="block px-3 py-2 text-sm hover:bg-white/5 rounded transition-colors"
                                                                    >
                                                                        📄 {t('dashboard.pashto')}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
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
