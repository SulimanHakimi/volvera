'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMessageSquare, FiTrash2, FiUserPlus, FiLock, FiUnlock, FiX, FiSend } from 'react-icons/fi';
import axios from 'axios';
import Loader from '@/components/ui/Loader';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Add User Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
    const [addLoading, setAddLoading] = useState(false);

    // Notification Modal
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [notifData, setNotifData] = useState({ title: '', message: '' });
    const [sendLoading, setSendLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.users);
        } catch (error) {
            console.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.post('/api/admin/users', newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers([res.data.user, ...users]);
            setIsAddModalOpen(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create user');
        } finally {
            setAddLoading(false);
        }
    };

    const handleToggleBlock = async (user) => {
        const action = user.isActive ? 'block' : 'unblock';
        if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.patch(`/api/admin/users/${user._id}`,
                { isActive: !user.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers(users.map(u => u._id === user._id ? res.data.user : u));
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== userId));
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const openNotifModal = (user) => {
        setSelectedUser(user);
        setNotifData({ title: '', message: '' });
        setIsNotifModalOpen(true);
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        setSendLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post('/api/admin/notifications', {
                targetUserId: selectedUser._id,
                title: notifData.title,
                message: notifData.message
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsNotifModalOpen(false);
        } catch (error) {
            alert('Failed to send notification');
        } finally {
            setSendLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Loader fullScreen={false} size="large" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-gray-400 text-sm">Manage user Access and Profiles.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-primary"
                >
                    <FiUserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 font-semibold text-gray-300 text-sm">
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Active</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${user.role === 'admin'
                                            ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium items-center gap-1.5 inline-flex ${user.isEmailVerified
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {user.isEmailVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                            {user.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openNotifModal(user)}
                                                className="p-1.5 hover:bg-[var(--accent)]/10 rounded-lg text-gray-400 hover:text-[var(--accent)] transition-colors"
                                                title="Send Notification"
                                            >
                                                <FiMessageSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleBlock(user)}
                                                className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                                                title={user.isActive ? 'Block User' : 'Unblock User'}
                                            >
                                                {user.isActive ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                                title="Delete User"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl"
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <FiX className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold mb-6 text-white">Add New User</h2>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="label">Full Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Email Address</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="label">Role</label>
                                    <select
                                        className="input"
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={addLoading}
                                        className="btn btn-primary w-full"
                                    >
                                        {addLoading ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notification Modal */}
            <AnimatePresence>
                {isNotifModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl"
                        >
                            <button
                                onClick={() => setIsNotifModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <FiX className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold mb-2 text-white">Send Notification</h2>
                            <p className="text-sm text-gray-400 mb-6">To: {selectedUser?.name}</p>

                            <form onSubmit={handleSendNotification} className="space-y-4">
                                <div>
                                    <label className="label">Title / Subject</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={notifData.title}
                                        onChange={e => setNotifData({ ...notifData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Message</label>
                                    <textarea
                                        className="input resize-none h-32"
                                        value={notifData.message}
                                        onChange={e => setNotifData({ ...notifData, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={sendLoading}
                                        className="btn btn-primary w-full"
                                    >
                                        {sendLoading ? 'Sending...' : 'Send Message'} <FiSend className="ml-2" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
