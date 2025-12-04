import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Coworking Booking System' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Book your coworking space easily" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem 0' }}>
          <div className="container">
            {children}
          </div>
        </main>
        <footer style={{
          backgroundColor: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
          padding: '1.5rem 0',
          marginTop: 'auto',
        }}>
          <div className="container text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <p>© 2024 Coworking Booking System. Innopolis University Distributed Systems Course.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
