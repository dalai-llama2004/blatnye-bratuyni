import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Input from '../components/Input';
import api from '../utils/api';

const Recover: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      await api.recoverPassword({ email });
      setMessage({
        type: 'success',
        text: 'Recovery code sent! Please check your email. Redirecting...',
      });

      setTimeout(() => {
        router.push(`/reset?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send recovery code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Recover Password - Coworking Booking">
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingTop: '2rem' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>
            Recover Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
            Enter your email address and we'll send you a recovery code
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
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Sending...' : 'Send Recovery Code'}
            </button>
          </form>

          <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Remember your password?{' '}
            <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: '500' }}>
              Login here
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Recover;
