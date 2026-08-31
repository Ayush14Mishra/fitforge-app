'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function authMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('popup-closed')) return 'The Google sign-in window was closed.';
  if (code.includes('operation-not-allowed')) return 'This sign-in method is still being activated. Try again shortly.';
  return 'Sign-in could not be completed. Please try again.';
}

export default function AuthScreen() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const google = async () => {
    setBusy(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (nextError) {
      setError(authMessage(nextError));
    } finally {
      setBusy(false);
    }
  };

  return <main className="auth-page">
    <section className="auth-story">
      <button className="brand" type="button"><span className="brand-mark">F</span><span>FITFORGE <sup>2.0</sup></span></button>
      <div>
        <span className="eyebrow">PERSONALISED COACHING · BUILT AROUND YOU</span>
        <h1>Train with purpose.<br /><em>Progress with Time</em></h1>
        <p>Structured home and gym plans, private check-ins, saved progress and direct premium coaching in one focused system.</p>
      </div>
      <div className="auth-proof"><span>01</span><p><strong>Your plan</strong><br />Matched to experience and equipment.</p><span>02</span><p><strong>Your progress</strong><br />Saved securely across every session.</p></div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <span className="pill">MEMBER ACCESS</span>
        <h2>Welcome to FitForge.</h2>
        <p className="lead">Sign in to continue your coaching journey.</p>
        <button className="google-button" onClick={google} disabled={busy} type="button">
          <span className="google-mark">G</span>{busy ? 'Connecting…' : 'Continue with Google'}<b>→</b>
        </button>
        {error && <p className="error-banner" role="alert">{error}</p>}
        <div className="auth-divider"><span>SECURE MEMBER ACCESS</span></div>
        <div className="free-auth-note"><span>✓</span><p><strong>No password to remember.</strong><br />Use any Google account to securely access your plan and saved progress.</p></div>
        <p className="auth-fineprint">Free, private access · Protected by Firebase Authentication</p>
      </div>
    </section>
  </main>;
}
