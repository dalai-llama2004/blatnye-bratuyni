import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import api from '../utils/api';

interface Booking {
  id: string;
  user_id: string;
  slot_id: string;
  place_id: string;
  place_name: string;
  zone_name: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
}

const Bookings: React.FC = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const data = await api.getBookingHistory(params);
      setBookings(data);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load bookings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.cancelBooking(bookingId);
      setMessage({
        type: 'success',
        text: 'Booking cancelled successfully!',
      });
      loadBookings();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to cancel booking',
      });
    }
  };

  const handleExtendBooking = async (bookingId: string) => {
    try {
      await api.extendBooking(bookingId);
      setMessage({
        type: 'success',
        text: 'Booking extended successfully!',
      });
      loadBookings();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to extend booking',
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'var(--secondary-color)';
      case 'cancelled':
        return 'var(--danger-color)';
      case 'completed':
        return 'var(--text-secondary)';
      default:
        return 'var(--text-primary)';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  return (
    <Layout title="My Bookings - Coworking Booking">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>My Bookings</h1>
          <button
            onClick={() => router.push('/zones')}
            className="btn btn-primary"
          >
            New Booking
          </button>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          {(['all', 'active', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'none',
                borderBottom: filter === status ? '2px solid var(--primary-color)' : 'none',
                color: filter === status ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: filter === status ? '600' : '400',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="spinner" />
        ) : filteredBookings.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '1rem' }}>
              No bookings found
            </p>
            <button
              onClick={() => router.push('/zones')}
              className="btn btn-primary"
            >
              Make Your First Booking
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {booking.place_name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      📍 {booking.zone_name}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      🕐 {formatDateTime(booking.start_time)} - {formatDateTime(booking.end_time)}
                    </p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          backgroundColor: getStatusColor(booking.status) + '20',
                          color: getStatusColor(booking.status),
                          fontWeight: '500',
                          textTransform: 'capitalize',
                        }}
                      >
                        {booking.status}
                      </span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    {booking.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleExtendBooking(booking.id)}
                          className="btn btn-success"
                          style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                        >
                          Extend
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn btn-danger"
                          style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookings;
