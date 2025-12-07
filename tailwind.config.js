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
                bg: '#0a0a0f',
                card: '#1a1a2e',
                'card-hover': '#252538',
                accent: '#667eea',
                'accent-hover': '#764ba2',
                border: '#2d2d44',
            },
        },
    },
    plugins: [],
}
