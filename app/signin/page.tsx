// app/verify/page.tsx
"use client";
import { Suspense } from 'react';
import SignInContent from './signinContent';

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading verification details...</div>}>
      <SignInContent />
    </Suspense>
  );
}