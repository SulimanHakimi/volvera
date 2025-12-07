'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import axios from 'axios';

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const res = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Failed to load notifications');
        }
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;

        try {
            const token = localStorage.getItem('accessToken');
            await axios.put('/api/notifications', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark read');
        }
    };

    const toggleOpen = () => {
        setOpen(!open);
        if (!open) {
            markAsRead();
        }
    };

    return (
        <div className="relative">
            <button
                onClick={toggleOpen}
                className="relative p-2 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-colors"
            >
                <FiBell className="w-5 h-5 text-[#9aa4b2]" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0f1724]"></span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-[#0b1220] rounded-xl border border-[rgba(255,255,255,0.03)] shadow-2xl overflow-hidden z-50 max-h-[400px] flex flex-col"
                    >
                        <div className="p-3 border-b border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.03)] font-semibold text-sm text-white">
                            Notifications
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-[#9aa4b2] text-sm">
                                    No notifications
                                </div>
                            ) : (
                                <div className="divide-y divide-[rgba(255,255,255,0.03)]">
                                    {notifications.map((notif) => (
                                        <div key={notif._id} className={`p-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors ${!notif.isRead ? 'bg-[#06b6d4]/10' : ''}`}>
                                            <div className="text-sm font-medium mb-1 text-white">{notif.title}</div>
                                            <div className="text-xs text-[#9aa4b2] leading-relaxed">{notif.message}</div>
                                            <div className="text-[10px] text-[#9aa4b2] mt-2">{new Date(notif.createdAt).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* View All Link */}
                            {notifications.length > 0 && (
                                <div className="border-t border-[rgba(255,255,255,0.03)] p-3">
                                    <a
                                        href="/notifications"
                                        className="block text-center text-sm text-[#06b6d4] hover:text-[#7c3aed] font-medium transition-colors"
                                    >
                                        View All Notifications →
                                    </a>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
