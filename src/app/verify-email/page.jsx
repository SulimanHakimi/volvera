import { Suspense } from 'react';
import VerifyEmailPage from './verify-email-client';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
