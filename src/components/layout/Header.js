'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiMenu, FiX, FiGlobe, FiChevronDown, FiUser, FiLogOut, FiLayout, FiBell, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter(); // Initialize router here
    const { t } = useTranslation();
    const { currentLanguage, changeLanguage } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { data: session } = useSession();
    const [localUser, setLocalUser] = useState(null);


    useEffect(() => {
        setMounted(true);
        const checkUser = () => {
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        setLocalUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error('Failed to parse user', e);
                    }
                } else {
                    setLocalUser(null);
                }
            }
        };

        checkUser();

        // Listen for login/logout events
        window.addEventListener('user-auth-change', checkUser);
        window.addEventListener('storage', checkUser);

        return () => {
            window.removeEventListener('user-auth-change', checkUser);
            window.removeEventListener('storage', checkUser);
        };
    }, []);


    const user = session?.user || localUser;

    // Hide header on admin pages
    if (pathname?.startsWith('/admin')) return null;

    const handleLogout = async () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setLocalUser(null);
        window.dispatchEvent(new Event('user-auth-change'));

        if (session) {
            await signOut({ redirect: true, callbackUrl: '/login' });
        } else {
            router.push('/login');
        }
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
        { code: 'ps', name: 'پښتو', flag: '🇦🇫' },
    ];

    const currentLang = languages.find(l => l.code === currentLanguage);

    return (
        <header className="sticky top-0 left-0 right-0 z-50 bg-[#0f1724]/95 backdrop-blur-2xl border-b border-[rgba(255,255,255,0.03)]">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center shadow-lg">
                                <Image src="/favicon.ico" className='rounded-xl' alt="Logo" width={100} height={100} />
                            </div>
                        </div>
                        <div className="">
                            <div className="text-lg font-bold bg-gradient-to-r from-white to-[#9aa4b2] bg-clip-text text-transparent">
                                VOLVERA
                            </div>
                            <div className="text-xs text-[#9aa4b2]">99.5% Earnings Retained</div>
                        </div>
                    </Link>

                    {/* pc nav */}
                    <nav className="hidden md:flex items-center gap-6">

                        <Link
                            href="/#features"
                            className="text-sm font-medium text-[#9aa4b2] hover:text-white transition-colors relative group"
                        >
                            {t('nav.features')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link
                            href="/#how-it-works"
                            className="text-sm font-medium text-[#9aa4b2] hover:text-white transition-colors relative group"
                        >
                            {t('nav.how_it_works')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link
                            href="/#about"
                            className="text-sm font-medium text-[#9aa4b2] hover:text-white transition-colors relative group"
                        >
                            {t('nav.about')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link
                            href="/#faq"
                            className="text-sm font-medium text-[#9aa4b2] hover:text-white transition-colors relative group"
                        >
                            {t('nav.faq')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        {/* langusge selector part */}
                        <div className="relative">
                            <button
                                onClick={() => setLangMenuOpen(!langMenuOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.03)] hover:border-[#06b6d4]/30 transition-all text-sm font-medium text-[#9aa4b2] hover:text-white"
                            >
                                <FiGlobe className="w-4 h-4" />
                                <span>{currentLang?.flag}</span>
                                <FiChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {langMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-[#0b1220] rounded-xl border border-[rgba(255,255,255,0.03)] shadow-2xl overflow-hidden"
                                    >
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    changeLanguage(lang.code);
                                                    setLangMenuOpen(false);
                                                }}
                                                className={`w-full px-4 py-3 text-left text-sm hover:bg-[rgba(255,255,255,0.03)] transition-colors flex items-center gap-3 ${currentLanguage === lang.code ? 'bg-[#06b6d4]/10 text-[#06b6d4]' : 'text-[#9aa4b2]'
                                                    }`}
                                            >
                                                <span className="text-xl">{lang.flag}</span>
                                                <span>{lang.name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>


                        {user && <NotificationDropdown />}

                        <div className="w-px h-8 bg-[rgba(255,255,255,0.03)] mx-2"></div>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.03)] hover:border-[#06b6d4]/30 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt="User"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : <FiUser />}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <div className="text-xs font-semibold text-white leading-none mb-0.5">{user.name || 'User'}</div>
                                        <div className="text-[10px] text-[#9aa4b2] leading-none">{user.email || 'Member'}</div>
                                    </div>
                                    <FiChevronDown className={`w-4 h-4 text-[#9aa4b2] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-[#0b1220] rounded-xl border border-[rgba(255,255,255,0.03)] shadow-2xl overflow-hidden divide-y divide-[rgba(255,255,255,0.03)]"
                                        >
                                            <div className="p-3">
                                                <div className="text-sm font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-[#9aa4b2] truncate">{user.email}</div>
                                            </div>
                                            <div className="p-1">
                                                <Link
                                                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#9aa4b2] hover:text-white hover:bg-[rgba(255,255,255,0.03)] rounded-lg transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <FiLayout className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#9aa4b2] hover:text-white hover:bg-[rgba(255,255,255,0.03)] rounded-lg transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <FiUser className="w-4 h-4" />
                                                    Profile
                                                </Link>
                                            </div>
                                            <div className="p-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <FiLogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-[#9aa4b2] hover:text-white transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#6d28d9] hover:to-[#0891b2] text-white text-sm font-semibold shadow-lg shadow-[#7c3aed]/30 hover:shadow-[#7c3aed]/50 transition-all hover-lift"
                                >
                                    {t('nav.register')}
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Humberger benu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2.5 hover:bg-[rgba(255,255,255,0.03)] rounded-xl transition-colors border border-[rgba(255,255,255,0.03)] text-[#9aa4b2]"
                    >
                        {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                </div>

                {/* mobile menu sidebar - Portalled to body to ensuring full screen coverage */}
                {mounted && createPortal(
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                                />

                                {/* Sidebar */}
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed top-0 right-0 h-[100vh] w-[75%] max-w-sm bg-[#0f1724] md:hidden shadow-2xl z-[101] overflow-y-auto"
                                >
                                    <div className="flex flex-col min-h-full">
                                        {/* Sidebar Header */}
                                        <div className="flex items-center justify-end p-4 border-b border-[rgba(255,255,255,0.03)]">
                                            <button
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="p-2 hover:bg-[rgba(255,255,255,0.03)] rounded-lg transition-colors text-[#9aa4b2]"
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Navigation */}
                                        <div className="bg-[#0f1724] p-4 space-y-1 flex-1">
                                            <Link
                                                href="/#features"
                                                className="block px-4 py-3 hover:bg-[rgba(255,255,255,0.03)] rounded-xl transition-colors text-sm font-medium text-[#9aa4b2] hover:text-white"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {t('nav.features')}
                                            </Link>
                                            <Link
                                                href="/#how-it-works"
                                                className="block px-4 py-3 hover:bg-[rgba(255,255,255,0.03)] rounded-xl transition-colors text-sm font-medium text-[#9aa4b2] hover:text-white"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {t('nav.how_it_works')}
                                            </Link>
                                            <Link
                                                href="/#about"
                                                className="block px-4 py-3 hover:bg-[rgba(255,255,255,0.03)] rounded-xl transition-colors text-sm font-medium text-[#9aa4b2] hover:text-white"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {t('nav.about')}
                                            </Link>
                                            <Link
                                                href="/#faq"
                                                className="block px-4 py-3 hover:bg-[rgba(255,255,255,0.03)] rounded-xl transition-colors text-sm font-medium text-[#9aa4b2] hover:text-white"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {t('nav.faq')}
                                            </Link>

                                            {/* Language Selector */}
                                            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.03)]">
                                                <div className="px-4 text-xs font-semibold text-[#9aa4b2] mb-3 uppercase tracking-wider">Language</div>
                                                <div className="flex flex-wrap gap-2 px-2">
                                                    {languages.map((lang) => (
                                                        <button
                                                            key={lang.code}
                                                            onClick={() => {
                                                                changeLanguage(lang.code);
                                                            }}
                                                            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 border ${currentLanguage === lang.code
                                                                ? 'bg-[#06b6d4]/10 border-[#06b6d4]/30 text-[#06b6d4]'
                                                                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-[#9aa4b2]'
                                                                }`}
                                                        >
                                                            <span className="text-lg">{lang.flag}</span>
                                                            <span>{lang.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* User Section */}
                                            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.03)]">
                                                {user ? (
                                                    <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 border border-[rgba(255,255,255,0.03)]">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-white font-bold text-lg overflow-hidden relative">
                                                                {user.image ? (
                                                                    <img
                                                                        src={user.image}
                                                                        alt="User"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span>{user.name ? user.name.charAt(0) : 'U'}</span>
                                                                )}
                                                            </div>
                                                            <div className="overflow-hidden flex-1">
                                                                <div className="font-medium text-white truncate">{user.name}</div>
                                                                <div className="text-xs text-[#9aa4b2] truncate">{user.email}</div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Link
                                                                href={user.role === 'admin' ? '/admin' : '/dashboard'}
                                                                className="block w-full text-center py-2 bg-[#06b6d4]/10 text-[#06b6d4] hover:bg-[#06b6d4]/20 rounded-lg text-sm font-medium transition-colors"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                Dashboard
                                                            </Link>
                                                            <Link
                                                                href="/notifications"
                                                                className="block w-full text-center py-2 bg-[rgba(255,255,255,0.03)] text-[#9aa4b2] hover:text-white rounded-lg text-sm font-medium transition-colors"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                Notifications
                                                            </Link>
                                                            <button
                                                                onClick={handleLogout}
                                                                className="block w-full text-center py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                Sign Out
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Link
                                                            href="/login"
                                                            className="py-2.5 rounded-xl border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-[#9aa4b2] hover:text-white text-sm font-medium text-center transition-all"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            {t('nav.login')}
                                                        </Link>
                                                        <Link
                                                            href="/register"
                                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#6d28d9] hover:to-[#0891b2] text-white text-sm font-semibold shadow-lg shadow-[#7c3aed]/30 hover:shadow-[#7c3aed]/50 transition-all hover-lift"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            {t('nav.register')}
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Section */}
                                        <div className="p-4 border-t border-[rgba(255,255,255,0.03)] mt-auto">
                                            <div className="text-xs font-semibold text-[#9aa4b2] mb-3 uppercase tracking-wider">Contact Us</div>
                                            <ul className="space-y-3">
                                                <li className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.03)]">
                                                        <FiMail className="w-4 h-4 text-[#06b6d4]" />
                                                    </div>
                                                    <a href="mailto:nor.volvera@gmail.com" className="text-sm text-[#9aa4b2] hover:text-[#06b6d4] transition-colors truncate">
                                                        nor.volvera@gmail.com
                                                    </a>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.03)]">
                                                        <FiPhone className="w-4 h-4 text-[#06b6d4]" />
                                                    </div>
                                                    <a href="tel:+46700556638" className="text-sm text-[#9aa4b2] hover:text-[#06b6d4] transition-colors">
                                                        +46 700 556 638
                                                    </a>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.03)]">
                                                        <FiMapPin className="w-4 h-4 text-[#06b6d4]" />
                                                    </div>
                                                    <span className="text-sm text-[#9aa4b2]">Stockholm, Sweden</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </header>
    );
}
