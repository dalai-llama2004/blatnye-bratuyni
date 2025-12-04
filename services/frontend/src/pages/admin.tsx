import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Input from '../components/Input';
import api from '../utils/api';

interface Zone {
  id: string;
  name: string;
  address: string;
  places_count: number;
}

const Admin: React.FC = () => {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [showCloseZoneForm, setShowCloseZoneForm] = useState<string | null>(null);

  const [zoneForm, setZoneForm] = useState({
    name: '',
    address: '',
    places_count: 0,
  });

  const [placeForm, setPlaceForm] = useState({
    zone_id: '',
    name: '',
  });

  const [closeZoneForm, setCloseZoneForm] = useState({
    reason: '',
    from: '',
    to: '',
  });

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadZones();
  }, []);

  const loadZones = async () => {
    setLoading(true);
    try {
      const data = await api.getZones();
      setZones(data);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load zones',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createZone(zoneForm);
      setMessage({ type: 'success', text: 'Zone created successfully!' });
      setShowZoneForm(false);
      setZoneForm({ name: '', address: '', places_count: 0 });
      loadZones();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create zone',
      });
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) {
      return;
    }
    try {
      await api.deleteZone(zoneId);
      setMessage({ type: 'success', text: 'Zone deleted successfully!' });
      loadZones();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete zone',
      });
    }
  };

  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPlace(placeForm);
      setMessage({ type: 'success', text: 'Place created successfully!' });
      setShowPlaceForm(false);
      setPlaceForm({ zone_id: '', name: '' });
      loadZones();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create place',
      });
    }
  };

  const handleCloseZone = async (e: React.FormEvent, zoneId: string) => {
    e.preventDefault();
    try {
      await api.closeZone(zoneId, closeZoneForm);
      setMessage({ type: 'success', text: 'Zone closed for maintenance!' });
      setShowCloseZoneForm(null);
      setCloseZoneForm({ reason: '', from: '', to: '' });
      loadZones();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to close zone',
      });
    }
  };

  return (
    <Layout title="Admin Panel - Coworking Booking">
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem' }}>
          Admin Panel
        </h1>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setShowZoneForm(!showZoneForm)}
            className="btn btn-primary"
          >
            {showZoneForm ? 'Cancel' : 'Create Zone'}
          </button>
          <button
            onClick={() => setShowPlaceForm(!showPlaceForm)}
            className="btn btn-secondary"
          >
            {showPlaceForm ? 'Cancel' : 'Create Place'}
          </button>
        </div>

        {/* Create Zone Form */}
        {showZoneForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Create New Zone
            </h2>
            <form onSubmit={handleCreateZone}>
              <Input
                label="Zone Name"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                placeholder="Main Building"
                required
              />
              <Input
                label="Address"
                value={zoneForm.address}
                onChange={(e) => setZoneForm({ ...zoneForm, address: e.target.value })}
                placeholder="123 Campus Street"
                required
              />
              <Input
                label="Number of Places"
                type="number"
                value={zoneForm.places_count.toString()}
                onChange={(e) => setZoneForm({ ...zoneForm, places_count: parseInt(e.target.value) || 0 })}
                placeholder="10"
                required
              />
              <button type="submit" className="btn btn-primary">
                Create Zone
              </button>
            </form>
          </div>
        )}

        {/* Create Place Form */}
        {showPlaceForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Create New Place
            </h2>
            <form onSubmit={handleCreatePlace}>
              <div className="form-group">
                <label className="form-label">Select Zone</label>
                <select
                  value={placeForm.zone_id}
                  onChange={(e) => setPlaceForm({ ...placeForm, zone_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                  }}
                  required
                >
                  <option value="">Select a zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Place Name"
                value={placeForm.name}
                onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                placeholder="Desk A-01"
                required
              />
              <button type="submit" className="btn btn-primary">
                Create Place
              </button>
            </form>
          </div>
        )}

        {/* Zones List */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Manage Zones
        </h2>

        {loading ? (
          <div className="spinner" />
        ) : zones.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No zones available. Create one to get started.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {zones.map((zone) => (
              <div key={zone.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {zone.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      📍 {zone.address}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {zone.places_count} places
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setShowCloseZoneForm(showCloseZoneForm === zone.id ? null : zone.id)}
                      className="btn btn-warning"
                      style={{ fontSize: '0.875rem' }}
                    >
                      {showCloseZoneForm === zone.id ? 'Cancel' : 'Close for Maintenance'}
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.875rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Close Zone Form */}
                {showCloseZoneForm === zone.id && (
                  <form
                    onSubmit={(e) => handleCloseZone(e, zone.id)}
                    style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}
                  >
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                      Close Zone for Maintenance
                    </h4>
                    <Input
                      label="Reason"
                      value={closeZoneForm.reason}
                      onChange={(e) => setCloseZoneForm({ ...closeZoneForm, reason: e.target.value })}
                      placeholder="Renovation work"
                      required
                    />
                    <Input
                      label="From"
                      type="datetime-local"
                      value={closeZoneForm.from}
                      onChange={(e) => setCloseZoneForm({ ...closeZoneForm, from: e.target.value })}
                      required
                    />
                    <Input
                      label="To"
                      type="datetime-local"
                      value={closeZoneForm.to}
                      onChange={(e) => setCloseZoneForm({ ...closeZoneForm, to: e.target.value })}
                      required
                    />
                    <button type="submit" className="btn btn-warning">
                      Close Zone
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
