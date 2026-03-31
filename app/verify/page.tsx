"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Phone, KeyRound, Loader2 } from 'lucide-react';

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
    // Only initialize when loading is finished and the user actually needs to verify
    if (!loading && user && !profile?.isVerified) {
      // Initialize the invisible reCAPTCHA to prevent bot abuse
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
      // Format nicely (Default to +1 if they didn't provide a country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
      const appVerifier = window.recaptchaVerifier;
      
      // Link the phone credential to the EXISTING Google Auth account!
      const confirmationResult = await linkWithPhoneNumber(user, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      
      setStep(2);
      setStatus('idle');
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      setErrorMessage(error.message || "Failed to send verification code. Please check your number.");
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
      
      // Success! Update their Firestore profile to officially mark them as Verified.
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isVerified: true,
        phoneNumber: result.user.phoneNumber
      });
      
      setStatus('success');
      setTimeout(() => {
        router.push('/stats');
      }, 2000);
    } catch (error: any) {
      console.error("Error verifying code:", error);
      setErrorMessage("Invalid code. Please try again.");
      setStatus('error');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-official)' }}>Loading...</div>;

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-official)' }}>Please log in to verify your account.</div>;
  }

  if (profile?.isVerified) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '24px', textAlign: 'center', fontFamily: 'var(--font-official)' }}>
        <ShieldCheck size={64} color="var(--accent-viridian)" style={{ margin: '0 auto 16px' }} />
        <h2>You are verified!</h2>
        <p style={{ opacity: 0.8, marginBottom: '24px' }}>Your account is securely linked and protected from spam.</p>
        <Link href="/stats" style={{ padding: '12px 24px', backgroundColor: 'var(--bg-card)', color: 'var(--ink-main)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600 }}>Return to Stats</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '24px', fontFamily: 'var(--font-official)' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/stats" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--ink-main)', textDecoration: 'none', fontWeight: 600, marginBottom: '16px' }}>
          <ChevronLeft size={20} /> Back
        </Link>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'var(--ink-main)' }}>Verify Identity</h1>
        <p style={{ color: 'var(--ink-light)', margin: 0, fontSize: '15px', lineHeight: 1.5 }}>Link your phone number to prove you are human. We will never spam you.</p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-ink)', boxShadow: 'var(--shadow-ink)' }}>
        {step === 1 ? (
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Mobile Number</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-paper)', padding: '0 12px' }}>
                <Phone size={18} color="var(--ink-light)" />
                <input type="tel" placeholder="+1 555 123 4567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required disabled={status === 'loading'} style={{ width: '100%', padding: '12px', border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', fontFamily: 'var(--font-mono)' }} />
              </div>
            </div>
            <button type="submit" disabled={status === 'loading'} style={{ padding: '14px', backgroundColor: 'var(--ink-main)', color: 'var(--bg-paper)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '16px', fontWeight: 700, cursor: status === 'loading' ? 'wait' : 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}>{status === 'loading' ? 'Sending SMS...' : 'Send Code'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Verification Code</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-paper)', padding: '0 12px' }}>
                <KeyRound size={18} color="var(--ink-light)" />
                <input type="text" placeholder="123456" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required disabled={status === 'loading' || status === 'success'} style={{ width: '100%', padding: '12px', border: 'none', background: 'transparent', outline: 'none', fontSize: '18px', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }} />
              </div>
            </div>
            <button type="submit" disabled={status === 'loading' || status === 'success'} style={{ padding: '14px', backgroundColor: status === 'success' ? 'var(--accent-viridian)' : 'var(--ink-main)', color: 'var(--bg-paper)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }}>{status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified! 🎉' : 'Confirm Code'}</button>
          </form>
        )}
        {errorMessage && <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--wash-crimson)', color: 'var(--accent-crimson)', borderRadius: 'var(--radius-sm)', fontSize: '13px', textAlign: 'center' }}>{errorMessage}</div>}
      </div>
      {/* This invisible div is REQUIRED by Firebase to process the mathematical reCAPTCHA proof */}
      <div id="recaptcha-container"></div>
    </div>
  );
}