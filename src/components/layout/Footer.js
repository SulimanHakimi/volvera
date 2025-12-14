'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMail, FiMapPin, FiArrowRight, FiPhone } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube, FaInstagram, FaHeart, FaTiktok } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [settings, setSettings] = useState({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/settings/public');
                setSettings(res.data || {});
            } catch (error) {
                console.error('Failed to fetch footer settings');
            }
        };
        fetchSettings();
    }, []);

    const socialMap = [
        { key: 'socialFacebook', icon: FaFacebookF, label: 'Facebook' },
        { key: 'socialTwitter', icon: FaTwitter, label: 'Twitter' },
        { key: 'socialLinkedin', icon: FaLinkedinIn, label: 'LinkedIn' },
        { key: 'socialYoutube', icon: FaYoutube, label: 'YouTube' },
        { key: 'socialInstagram', icon: FaInstagram, label: 'Instagram' },
        { key: 'socialTiktok', icon: FaTiktok, label: 'TikTok' },
    ];

    return (
        <footer className="relative bg-[#0f1724] border-t border-[rgba(255,255,255,0.03)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7c3aed]/50 to-transparent"></div>

            <div className="container mx-auto px-6 md:px-8 py-10 md:py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
                    {/* brand info section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0  rounded-xl blur-lg opacity-50"></div>
                                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                                    <Image src="/favicon.ico" className='rounded-xl' alt="Logo" width={100} height={100} />
                                </div>
                            </div>
                            <div>
                                <div className="font-bold text-lg text-white">{settings.siteName || 'VOLVERA'}</div>
                                <div className="text-xs text-[#9aa4b2]">Empower Your Creativity</div>
                            </div>
                        </div>
                        <p className="text-sm text-[#9aa4b2] leading-relaxed mb-6">
                            Join thousands of creators worldwide who keep 99.5% of their earnings. Build your empire, we'll handle the rest.
                        </p>

                        <div className="flex gap-3 flex-wrap">
                            {socialMap.map((social, i) => {
                                const url = settings[social.key];
                                if (!url) return null;
                                return (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-gradient-to-br hover:from-[#06b6d4] hover:to-[#7c3aed] flex items-center justify-center transition-all duration-300 group border border-[rgba(255,255,255,0.03)] hover:border-transparent"
                                    >
                                        <social.icon className="w-4 h-4 text-[#9aa4b2] group-hover:text-white transition-colors" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2 text-white">
                            <div className="w-1 h-4 bg-gradient-to-b from-[#06b6d4] to-[#7c3aed] rounded-full"></div>
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Features', href: '/#features' },
                                { label: 'How It Works', href: '/#how-it-works' },
                                { label: 'About Us', href: '/#about' },
                                { label: 'FAQ', href: '/#faq' },
                                { label: 'Dashboard', href: '/dashboard' },
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[#9aa4b2] hover:text-[#06b6d4] transition-colors inline-flex items-center gap-2 group"
                                    >
                                        <FiArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2 text-white">
                            <div className="w-1 h-4 bg-gradient-to-b from-[#06b6d4] to-[#7c3aed] rounded-full"></div>
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Terms of Service', href: '/terms' },
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[#9aa4b2] hover:text-[#06b6d4] transition-colors inline-flex items-center gap-2 group"
                                    >
                                        <FiArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2 text-white">
                            <div className="w-1 h-4 bg-gradient-to-b from-[#06b6d4] to-[#7c3aed] rounded-full"></div>
                            Contact
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.03)]">
                                    <FiMail className="w-4 h-4 text-[#06b6d4]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#9aa4b2] mb-1">Email</div>
                                    <a href={`mailto:${settings.contactEmail || 'nor.volvera@gmail.com'}`} className="text-sm text-[#9aa4b2] hover:text-[#06b6d4] transition-colors">
                                        {settings.contactEmail || 'nor.volvera@gmail.com'}
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.03)]">
                                    <FiPhone className="w-4 h-4 text-[#06b6d4]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#9aa4b2] mb-1">Phone Number</div>
                                    <a href="tel:+46700556638" className="text-sm text-[#9aa4b2] hover:text-[#06b6d4] transition-colors">
                                        +46 700 556 638
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.03)]">
                                    <FiMapPin className="w-4 h-4 text-[#06b6d4]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#9aa4b2] mb-1">Location</div>
                                    <span className="text-sm text-[#9aa4b2]">{settings.companyAddress || 'Stockholm, Sweden'}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="pb-4 border-t border-[rgba(255,255,255,0.03)]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-[#9aa4b2]">
                            © {currentYear} VOLVERA. All rights reserved
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-[#9aa4b2] flex items-center gap-1">Made with <FaHeart className="w-3 h-3 text-red-500" /> by Suliman Hakimi</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
