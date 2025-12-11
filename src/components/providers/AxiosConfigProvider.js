'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AxiosConfigProvider({ children }) {
    const router = useRouter();

    useEffect(() => {
        // Add a response interceptor
        const interceptor = axios.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                // Check if the error is due to an expired token (401 Unauthorized)
                if (error.response && error.response.status === 401) {
                    // Prevent infinite loop if the error comes from logout itself
                    if (error.config.url.includes('/logout')) {
                        return Promise.reject(error);
                    }

                    console.log('Session expired or invalid token. Logging out...');

                    // 1. Clear local storage
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('user');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');

                        // Dispatch event so other components (like Header) can update state immediately
                        window.dispatchEvent(new Event('user-auth-change'));
                    }

                    // 2. Sign out using NextAuth
                    // We use redirect: false to manually handle navigation after
                    await signOut({ redirect: false });

                    // 3. Redirect to login page
                    router.push('/login');
                }
                return Promise.reject(error);
            }
        );

        // Cleanup the interceptor when the component unmounts
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [router]);

    return <>{children}</>;
}
