import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Input from '../components/Input';
import api from '../utils/api';

const Confirm: React.FC = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Please enter the confirmation code' });
      return;
    }

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email is missing' });
      return;
    }

    setLoading(true);
    try {
      await api.confirmEmail({ email, code });
      setMessage({
        type: 'success',
        text: 'Email confirmed successfully! Redirecting to zones...',
      });

      setTimeout(() => {
        router.push('/zones');
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Confirmation failed. Please check your code.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Confirm Email - Coworking Booking">
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingTop: '2rem' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>
            Confirm Your Email
          </h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
            We've sent a confirmation code to your email address. Please enter it below.
          </p>

          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="john.doe@example.com"
            />

            <Input
              id="code"
              name="code"
              type="text"
              label="Confirmation Code"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Confirming...' : 'Confirm Email'}
            </button>
          </form>

          <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Didn't receive a code?{' '}
            <a href="/register" style={{ color: 'var(--primary-color)', fontWeight: '500' }}>
              Try registering again
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Confirm;
