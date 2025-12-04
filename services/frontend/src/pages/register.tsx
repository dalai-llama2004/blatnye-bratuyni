import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Input from '../components/Input';
import api from '../utils/api';

const Register: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setMessage({
        type: 'success',
        text: 'Registration successful! Please check your email for confirmation code.',
      });

      setTimeout(() => {
        router.push(`/confirm?email=${encodeURIComponent(formData.email)}`);
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Register - Coworking Booking">
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingTop: '2rem' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
            Register to book your coworking space
          </p>

          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              id="name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              disabled={loading}
            />

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

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={loading}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: '500' }}>
              Login here
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
