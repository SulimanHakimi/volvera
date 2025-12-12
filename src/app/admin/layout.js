'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    FiHome,
    FiUsers,
    FiFileText,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: FiHome, href: '/admin' },
        { name: 'Users', icon: FiUsers, href: '/admin/users' },
        { name: 'Contracts', icon: FiFileText, href: '/admin/contracts' },
        { name: 'Documents', icon: FiFileText, href: '/admin/documents' },
        { name: 'Settings', icon: FiSettings, href: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg)] flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0F0F16] border-r border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/5">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                <Image src="/favicon.ico" className='rounded-xl' alt="Logo" width={100} height={100} />
                            </div>
                            <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Admin
                            </span>
                        </Link>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                    ${isActive
                                            ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20'
                                            : 'text-[#9aa4b2] hover:bg-white/5 hover:text-white'
                                        }
                  `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info / Logout */}
                    <div className="p-4 border-t border-white/5">
                        <div className="bg-white/5 rounded-xl p-4 mb-3">
                            <div className="text-sm font-medium text-white mb-0.5">{user?.name || 'Admin User'}</div>
                            <div className="text-xs text-gray-500">{user?.email || 'admin@platform.com'}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                        >
                            <FiLogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0F0F16]">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg hover:bg-white/5"
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                    <span className="font-bold">Admin Dashboard</span>
                    <div className="w-8" /> {/* Spacer */}
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
