'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiFileText, FiDollarSign, FiActivity } from 'react-icons/fi';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!token || !user || user.role !== 'admin') {
                router.push('/login');
                return;
            }

            try {
                const res = await axios.get('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading stats...</div>;

    const stats = [
        { label: 'Total Users', value: data?.stats?.totalUsers || 0, change: '+0%', icon: <FiUsers/>, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Contracts', value: data?.stats?.activeContracts || 0, change: '+0%', icon: <FiFileText/>, color: 'from-purple-500 to-pink-500' },
        { label: 'Total Earnings', value: '$' + (data?.stats?.totalEarnings || 0), change: '+0%', icon: <FiDollarSign/>, color: 'from-green-500 to-emerald-500' },
        { label: 'Platform Usage', value: data?.stats?.platformUsage || '0%', change: '+0%', icon: <FiActivity/>, color: 'from-orange-500 to-red-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative overflow-hidden rounded-2xl bg-[#0F0F16] border border-white/5 p-6 group"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`
                  w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-0.5
                `}>
                                    <div className="w-full h-full bg-[#0F0F16] rounded-[10px] flex items-center justify-center">
                                        <div className={`text-xl`}>{stat.icon}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>

                        {/* Background Glow */}
                        <div className={`
              absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-3xl opacity-20
              bg-gradient-to-br ${stat.color} group-hover:opacity-30 transition-opacity
            `} />
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Contracts */}
                <div className="rounded-2xl bg-[#0F0F16] border border-white/5 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Recent Contracts</h2>
                    </div>
                    <div className="space-y-4">
                        {data?.recentContracts?.length > 0 ? data.recentContracts.map((contract, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                                        {contract.user?.name ? contract.user.name.charAt(0) : 'U'}
                                    </div>
                                    <div>
                                        <div className="font-medium">{contract.user?.name || 'Unknown User'}</div>
                                        <div className="text-xs text-gray-400">#{contract.contractNumber}</div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                                    {contract.status}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center text-gray-500 py-4">No recent contracts</div>
                        )}
                    </div>
                </div>

                {/* New Users */}
                <div className="rounded-2xl bg-[#0F0F16] border border-white/5 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">New Users</h2>
                    </div>
                    <div className="space-y-4">
                        {data?.newUsers?.length > 0 ? data.newUsers.map((user, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-xs text-gray-400">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-500 py-4">No new users</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
