'use client';

import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen mt-8">
            <main className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-sm text-[var(--text-secondary)] mb-8">Last updated: December 2025</p>

                <div className="prose prose-invert max-w-none space-y-6 mb-12">
                    <div>
                        <h2 className="text-2xl font-bold mb-3">1. Information We Collect</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We collect information you provide directly to us, including your name, email address,
                            channel information, and any other information you choose to provide when creating an account
                            or submitting a partnership application
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">2. How We Use Your Information</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                            <li>Process your partnership applications</li>
                            <li>Communicate with you about your account</li>
                            <li>Send you updates and notifications</li>
                            <li>Improve our services</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">3. Information Sharing</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We do not sell, trade, or rent your personal information to third parties. We may share
                            your information with service providers who assist us in operating our platform, conducting
                            our business, or serving our users.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">4. Data Security</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We implement appropriate security measures to protect your personal information. However,
                            no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">5. Your Rights</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to processing of your data</li>
                            <li>Data portability</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">6. Cookies</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We use cookies and similar tracking technologies to track activity on our platform and
                            hold certain information. You can instruct your browser to refuse all cookies or to
                            indicate when a cookie is being sent.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">7. Changes to This Policy</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We may update our Privacy Policy from time to time. We will notify you of any changes
                            by posting the new Privacy Policy on this page and updating the "Last updated" date.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">8. Contact Us</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div className="mt-3 p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                            <p className="text-sm">Email: nor.volvera@gmail.com</p>
                            <p className="text-sm">Address: Volvera, Inc.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
