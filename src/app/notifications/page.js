'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle, FiAlertCircle, FiFileText, FiTrash2, FiFilter } from 'react-icons/fi';
import axios from 'axios';

export default function NotificationsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [typeFilter, setTypeFilter] = useState('all'); // all, contract_status, file_status, system, admin_message

    useEffect(() => {
        setMounted(true);
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('accessToken'); // Fixed: use 'accessToken'
            const response = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/notifications/${id}`,
                { read: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const unreadIds = notifications.filter(n => !n.read).map(n => n._id);

            await Promise.all(
                unreadIds.map(id =>
                    axios.patch(`/api/notifications/${id}`,
                        { read: true },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                )
            );

            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'contract_status':
                return <FiFileText className="text-[#06b6d4]" />;
            case 'file_status':
                return <FiCheckCircle className="text-[#10b981]" />;
            case 'system':
                return <FiAlertCircle className="text-[#f59e0b]" />;
            case 'admin_message':
                return <FiBell className="text-[#7c3aed]" />;
            default:
                return <FiBell className="text-[#9aa4b2]" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'contract_status':
                return 'border-l-[#06b6d4]';
            case 'file_status':
                return 'border-l-[#10b981]';
            case 'system':
                return 'border-l-[#f59e0b]';
            case 'admin_message':
                return 'border-l-[#7c3aed]';
            default:
                return 'border-l-[#9aa4b2]';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread' && n.read) return false;
        if (filter === 'read' && !n.read) return false;
        if (typeFilter !== 'all' && n.type !== typeFilter) return false;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-[#0f1724] flex items-center justify-center">
                <div className="text-[#9aa4b2]">{mounted ? t('common.loading') : 'Loading...'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1724] text-[#e6eef6]">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 md:mb-8"
                >
                    <button
                        onClick={() => router.back()}
                        className="text-[#9aa4b2] hover:text-[#06b6d4] mb-4 flex items-center gap-2 transition-colors"
                    >
                        ← {t('common.back')}
                    </button>

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#7c3aed] flex items-center justify-center">
                                <FiBell className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{t('notifications.title')}</h1>
                                <p className="text-[#9aa4b2] text-sm">
                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                </p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[rgba(6,182,212,0.1)] text-[#06b6d4] rounded-lg hover:bg-[rgba(6,182,212,0.2)] transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                            >
                                <FiCheck /> {t('notifications.mark_read')}
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4 md:mb-6 flex flex-wrap gap-2 md:gap-3"
                >
                    <div className="hidden sm:flex items-center gap-2">
                        <FiFilter className="text-[#9aa4b2]" />
                        <span className="text-sm text-[#9aa4b2]">Filter:</span>
                    </div>

                    {/* Read/Unread Filter */}
                    <div className="flex gap-2">
                        {['all', 'unread', 'read'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-[#06b6d4] text-white'
                                    : 'bg-[rgba(255,255,255,0.03)] text-[#9aa4b2] hover:bg-[rgba(255,255,255,0.06)]'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2">
                        {['all', 'contract_status', 'file_status', 'system', 'admin_message'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === type
                                    ? 'bg-[#7c3aed] text-white'
                                    : 'bg-[rgba(255,255,255,0.03)] text-[#9aa4b2] hover:bg-[rgba(255,255,255,0.06)]'
                                    }`}
                            >
                                {type === 'all' ? 'All Types' : type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <FiBell className="text-6xl text-[#9aa4b2] mx-auto mb-4 opacity-20" />
                            <p className="text-[#9aa4b2] text-lg">{t('notifications.no_notifications')}</p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((notification, index) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-[#1a2332] border-l-4 ${getNotificationColor(notification.type)} rounded-lg p-4 hover:bg-[#1e2838] transition-all group ${!notification.read ? 'border border-[rgba(6,182,212,0.2)]' : 'border border-transparent'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                                            {notification.title}
                                            {!notification.read && (
                                                <span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span>
                                            )}
                                        </h3>
                                        <p className="text-[#9aa4b2] text-sm mb-2 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-[#9aa4b2]">
                                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                            <span className="px-2 py-0.5 bg-[rgba(255,255,255,0.03)] rounded">
                                                {notification.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="p-2 hover:bg-[rgba(6,182,212,0.1)] text-[#06b6d4] rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <FiCheck />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification._id)}
                                            className="p-2 hover:bg-[rgba(239,68,68,0.1)] text-[#ef4444] rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
