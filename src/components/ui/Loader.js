'use client';

import { motion } from 'framer-motion';

export default function Loader({ fullScreen = true, size = 'medium', text = 'Loading...' }) {
    const sizeClasses = {
        small: 'w-8 h-8 border-2',
        medium: 'w-12 h-12 border-4',
        large: 'w-16 h-16 border-4'
    };

    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
        : "flex flex-col items-center justify-center p-8";

    return (
        <div className={containerClasses}>
            <motion.div
                className={`${sizeClasses[size]} border-t-[var(--accent)] border-r-[var(--accent)] border-b-[var(--accent)]/30 border-l-[var(--accent)]/30 rounded-full`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {text && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-[var(--accent)] font-medium text-sm"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
}
