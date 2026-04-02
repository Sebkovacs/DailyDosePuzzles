"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Phone, KeyRound } from 'lucide-react';
import styles from './page.module.css';

// Extend window object to store Firebase instances globally
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

export default function VerifyPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!loading && user && !profile?.isVerified) {
      if (typeof window !== 'undefined' && !window.recaptchaVerifier && auth && document.getElementById('recaptcha-container')) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
    }
  }, [loading, user, profile?.isVerified]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await linkWithPhoneNumber(user, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;

      setStep(2);
      setStatus('idle');
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      setErrorMessage(error.message || 'Failed to send verification code. Please check your number.');
      setStatus('error');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !window.confirmationResult) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await window.confirmationResult.confirm(verificationCode);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isVerified: true,
        phoneNumber: result.user.phoneNumber,
      });

      setStatus('success');
      setTimeout(() => {
        router.push('/stats');
      }, 2000);
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setErrorMessage('Invalid code. Please try again.');
      setStatus('error');
    }
  };

  if (loading) return <div className={styles.loadingState}>Loading...</div>;

  if (!user) {
    return <div className={styles.loadingState}>Please log in to verify your account.</div>;
  }

  if (profile?.isVerified) {
    return (
      <div className={styles.centerState}>
        <ShieldCheck size={64} className={styles.successIcon} />
        <h2>You are verified!</h2>
        <p className={styles.successText}>Your account is securely linked and protected from spam.</p>
        <Link href="/stats" className={styles.successLink}>Return to Stats</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/stats" className={styles.backLink}>
          <ChevronLeft size={20} /> Back
        </Link>
        <h1 className={styles.title}>Verify Identity</h1>
        <p className={styles.subtitle}>Link your phone number to prove you are human. We will never spam you.</p>
      </div>

      <div className={styles.card}>
        {step === 1 ? (
          <form onSubmit={handleSendCode} className={styles.form}>
            <div>
              <label className={styles.label}>Mobile Number</label>
              <div className={styles.inputWrap}>
                <Phone size={18} className={styles.inputIcon} />
                <input
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  className={styles.input}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`${styles.submitButton} ${status === 'loading' ? styles.submitButtonLoading : ''}`}
            >
              {status === 'loading' ? 'Sending SMS...' : 'Send Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className={styles.form}>
            <div>
              <label className={styles.label}>Verification Code</label>
              <div className={styles.inputWrap}>
                <KeyRound size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  disabled={status === 'loading' || status === 'success'}
                  className={`${styles.input} ${styles.codeInput}`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`${styles.submitButton} ${status === 'loading' ? styles.submitButtonLoading : ''} ${status === 'success' ? styles.submitButtonSuccess : ''}`}
            >
              {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Confirm Code'}
            </button>
          </form>
        )}
        {errorMessage && <div className={styles.errorBox}>{errorMessage}</div>}
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
}