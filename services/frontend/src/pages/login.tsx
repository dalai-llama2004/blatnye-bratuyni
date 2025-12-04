import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Input from '../components/Input';
import api from '../utils/api';

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.login({
        email: formData.email,
        password: formData.password,
      });

      setMessage({
        type: 'success',
        text: 'Login successful! Redirecting...',
      });

      setTimeout(() => {
        router.push('/zones');
      }, 1000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Login failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login - Coworking Booking">
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingTop: '2rem' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
            Login to your account
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
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={loading}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
            />

            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <a href="/recover" style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: 'var(--primary-color)', fontWeight: '500' }}>
              Register here
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
