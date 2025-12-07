'use client';

import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen">

            <main className="container mx-auto px-4 py-24 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
                <p className="text-sm text-[var(--text-secondary)] mb-8">Last updated: December 2025</p>

                <div className="prose prose-invert max-w-none space-y-6 mb-12">
                    <div>
                        <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            By accessing and using Volvera, you accept and agree to be bound by the terms
                            and provision of this agreement. If you do not agree to these terms, please do not use our services.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">2. Partnership Agreement</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
                            As a creator partner, you agree to:
                        </p>
                        <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the quality and integrity of your content</li>
                            <li>Comply with all applicable laws and regulations</li>
                            <li>Respect intellectual property rights</li>
                            <li>Maintain professional conduct</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">3. Revenue Sharing</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            Volvera operates on a 99.5% revenue retention model. You retain 99.5% of all
                            earnings generated through the partnership, while Volvera retains 0.5% to
                            maintain and improve the platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">4. Content Guidelines</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
                            All content must:
                        </p>
                        <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                            <li>Comply with platform policies</li>
                            <li>Not contain illegal or harmful material</li>
                            <li>Respect copyright and trademark laws</li>
                            <li>Not promote violence, hate, or discrimination</li>
                            <li>Be appropriate for the intended audience</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">5. Account Termination</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We reserve the right to suspend or terminate your account if you violate these terms,
                            engage in fraudulent activity, or if we believe your actions may harm the platform or
                            other users.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">6. Intellectual Property</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            You retain all rights to your content. By using our platform, you grant Volvera
                            a non-exclusive license to host, display, and distribute your content as necessary to
                            provide our services.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">7. Limitation of Liability</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            Volvera shall not be liable for any indirect, incidental, special, consequential,
                            or punitive damages resulting from your use of or inability to use the service.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">8. Changes to Terms</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We reserve the right to modify these terms at any time. We will notify users of any
                            material changes via email or through the platform. Continued use of the service after
                            changes constitutes acceptance of the new terms.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">9. Governing Law</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            These terms shall be governed by and construed in accordance with applicable laws,
                            without regard to its conflict of law provisions.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3">10. Contact Information</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            For questions about these Terms of Service, please contact us:
                        </p>
                        <div className="mt-3 p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                            <p className="text-sm">Email: volvera.se@hotmail.com</p>
                            <p className="text-sm">Address: Volvera, Inc</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
