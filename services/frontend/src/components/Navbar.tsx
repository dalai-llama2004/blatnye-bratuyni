import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../utils/api';

const Navbar: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = typeof window !== 'undefined' && api.isAuthenticated();

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--primary-color)',
            textDecoration: 'none',
          }}>
            Coworking Booking
          </Link>
          {isAuthenticated && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/zones" style={{
                color: router.pathname === '/zones' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}>
                Zones
              </Link>
              <Link href="/bookings" style={{
                color: router.pathname === '/bookings' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}>
                My Bookings
              </Link>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Link href="/admin" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                Admin
              </Link>
              <button onClick={handleLogout} className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
