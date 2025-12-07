/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                bg: '#0f1724',
                card: '#0b1220',
                'card-hover': '#111827',
                accent: '#06b6d4',
                'accent-hover': '#0891b2',
                border: 'rgba(255,255,255,0.03)',
            },
        },
    },
    plugins: [],
}
