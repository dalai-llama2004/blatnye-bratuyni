import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import api from '../utils/api';

const Home: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = typeof window !== 'undefined' && api.isAuthenticated();

  return (
    <Layout title="Coworking Booking System">
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingTop: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', lineHeight: '1.2' }}>
          Book Your Coworking Space
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Simple, modern, and efficient workspace booking system for campus coworking spaces
        </p>

        {isAuthenticated ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/zones')}
              className="btn btn-primary"
              style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}
            >
              Browse Zones
            </button>
            <button
              onClick={() => router.push('/bookings')}
              className="btn btn-secondary"
              style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}
            >
              My Bookings
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/register')}
              className="btn btn-primary"
              style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/login')}
              className="btn btn-secondary"
              style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}
            >
              Login
            </button>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-3" style={{ marginTop: '4rem', textAlign: 'left' }}>
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏢</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Multiple Zones
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Access coworking spaces across different campus locations
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Flexible Booking
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Book by hour, extend or cancel bookings easily
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Real-time Availability
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              See available slots instantly and book in seconds
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div style={{ marginTop: '4rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{
                minWidth: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
              }}>
                1
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Register & Verify
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Create an account and verify your email address
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{
                minWidth: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
              }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Browse & Select
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Choose your preferred zone, place, and time slot
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{
                minWidth: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
              }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Book & Enjoy
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Confirm your booking and start working in your reserved space
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
