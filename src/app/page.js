'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ApplyFormModal from '@/components/forms/ApplyFormModal';
import Link from 'next/link';

export default function HomePage() {
  const { t } = useTranslation();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  const handleInlineSubmit = (e) => {
    e.preventDefault();
    setFormStatus('Sending application...');
    setTimeout(() => {
      setFormStatus('Application received. We will contact you within 3 business days.');
      e.target.reset();
    }, 900);
  };

  const handleCopyTerms = () => {
    const terms = 'Freelancer agreement: independent contractor; you keep ownership; we take 0.5% fee; payments via bank/WU.';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(terms).then(() => alert('Terms copied to clipboard'));
    } else {
      // Fallback
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen font-['Inter'] text-[#e6eef6]" style={{ backgroundColor: '#0f1724' }}>
      <style jsx global>{`
        :root {
          --bg: #0f1724;
          --card: #0b1220;
          --accent: #06b6d4;
          --muted: #9aa4b2;
          --glass: rgba(255,255,255,0.03);
          --card-bg: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          --card-shadow: rgba(2,8,23,0.6);
          --card-border: rgba(255,255,255,0.03);
        }
        body {
            background-color: var(--bg);
            color: #e6eef6;
        }
        .hero-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 28px;
        }
        .custom-card {
           background: var(--card-bg);
           background-color: var(--card);
           border-radius: 14px;
           padding: 20px;
           box-shadow: 0 6px 30px var(--card-shadow);
           border: 1px solid var(--card-border);
           transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .custom-card:hover {
           transform: translateY(-2px);
           border-color: rgba(255,255,255,0.08);
        }
        .stat-box { font-weight: 700; color: #fff; }
        .text-accent { color: var(--accent); }
        .text-muted { color: var(--muted); }
        .btn-custom {
            background: var(--accent);
            color: #042028;
            padding: 10px 16px;
            border-radius: 10px;
            font-weight: 700;
            transition: 0.2s;
        }
        .btn-custom:hover { opacity: 0.9; }
        .btn-ghost {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.06);
            color: var(--muted);
        }
        input.custom-input, textarea.custom-input {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.06);
            background: transparent;
            color: inherit;
            margin-bottom: 12px;
        }
        input.custom-input:focus, textarea.custom-input:focus {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
        }
      `}</style>

      {/* Hero Section */}
      <main id="features" className="container scroll-mt-20 mx-auto px-4 py-8 max-w-[1100px]">
        <div className="hero-grid py-9">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-accent font-bold mb-3 uppercase tracking-wide text-sm">{t('hero.partnership_tag')}</div>
            <h1 className="text-4xl md:text-[38px] font-bold leading-[1.05] mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-muted text-lg mb-6 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="custom-card mb-6 text-left">
              <div className="flex gap-4 items-center mb-6 justify-center md:justify-start">
                <div>
                  <div className="font-bold text-lg">{t('hero.you_keep')}</div>
                  <div className="text-muted text-sm">{t('hero.service_fee')}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: t('features.channel_ownership'), desc: t('features.channel_ownership_desc') },
                  { title: t('features.flexible_work'), desc: t('features.flexible_work_desc') },
                  { title: t('features.growth_support'), desc: t('features.growth_support_desc') },
                  { title: t('features.no_hidden_fees'), desc: t('features.no_hidden_fees_desc') }
                ].map((f, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                    <h4 className="font-bold text-[15px] mb-1.5">{f.title}</h4>
                    <p className="text-[13px] text-muted leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="btn-custom"
              >
                {t('hero.cta_primary')}
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="btn-custom btn-ghost"
              >
                {t('hero.cta_secondary')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 py-12 border-t border-dashed border-[rgba(255,255,255,0.03)] mt-8">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">{t('how_it_works.title')}</h2>
            <div className="h-px bg-[rgba(255,255,255,0.03)] flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: t('how_it_works.apply'), desc: t('how_it_works.apply_desc') },
              { step: t('how_it_works.create'), desc: t('how_it_works.create_desc') },
              { step: t('how_it_works.earn'), desc: t('how_it_works.earn_desc') }
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="custom-card text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#7c3aed] flex items-center justify-center mx-auto mb-3 text-xl font-bold">{i + 1}</div>
                <h3 className="text-lg font-bold mb-2">{s.step}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-12 border-t border-dashed border-[rgba(255,255,255,0.03)]">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">{t('faq.title')}</h2>
            <div className="h-px bg-[rgba(255,255,255,0.03)] flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { q: t('faq.q1'), a: t('faq.a1') },
              { q: t('faq.q2'), a: t('faq.a2') },
              { q: t('faq.q3'), a: t('faq.a3') },
              { q: t('faq.q4'), a: t('faq.a4') }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="custom-card flex flex-col h-full hover:bg-[rgba(255,255,255,0.03)] transition-colors"
              >
                <h4 className="font-bold text-[15px] mb-2">{faq.q}</h4>
                <p className="text-[13px] text-muted">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-t border-dashed border-[rgba(255,255,255,0.03)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { number: '10K+', label: t('stats.active_creators') },
              { number: '99.5%', label: t('stats.earnings_retained') },
              { number: '50+', label: t('stats.countries') },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="custom-card text-center"
              >
                <div className="text-3xl font-bold text-[var(--accent)] mb-1">{stat.number}</div>
                <div className="text-sm text-[#9aa4b2]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>


      </main>

      <Footer />
      <ApplyFormModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </div>
  );
}
