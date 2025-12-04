import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import api from '../utils/api';

interface Zone {
  id: string;
  name: string;
  address: string;
  places_count: number;
  status?: string;
}

interface Place {
  id: string;
  zone_id: string;
  name: string;
  status?: string;
}

interface Slot {
  id: string;
  place_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const Zones: React.FC = () => {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadZones();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      loadPlaces(selectedZone.id);
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedPlace && selectedDate) {
      loadSlots(selectedPlace.id, selectedDate);
    }
  }, [selectedPlace, selectedDate]);

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

  const loadPlaces = async (zoneId: string) => {
    setLoading(true);
    try {
      const data = await api.getPlacesByZone(zoneId);
      setPlaces(data);
      setSelectedPlace(null);
      setSlots([]);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load places',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (placeId: string, date: string) => {
    setLoading(true);
    try {
      const data = await api.getSlotsByPlace(placeId, date);
      setSlots(data);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load slots',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId: string) => {
    if (!selectedPlace) return;

    try {
      await api.createBooking({
        place_id: selectedPlace.id,
        slot_id: slotId,
      });

      setMessage({
        type: 'success',
        text: 'Booking created successfully!',
      });

      // Reload slots to update availability
      loadSlots(selectedPlace.id, selectedDate);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create booking',
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout title="Zones - Coworking Booking">
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem' }}>
          Book Your Coworking Space
        </h1>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
          {/* Zones List */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Select Zone
            </h2>
            {loading && zones.length === 0 ? (
              <div className="spinner" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="card"
                    onClick={() => setSelectedZone(zone)}
                    style={{
                      cursor: 'pointer',
                      border: selectedZone?.id === zone.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      padding: '1rem',
                    }}
                  >
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {zone.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {zone.address}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      {zone.places_count} places
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Places List */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Select Place
            </h2>
            {!selectedZone ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Please select a zone first
              </p>
            ) : places.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No places available in this zone
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {places.map((place) => (
                  <div
                    key={place.id}
                    className="card"
                    onClick={() => setSelectedPlace(place)}
                    style={{
                      cursor: 'pointer',
                      border: selectedPlace?.id === place.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      padding: '1rem',
                    }}
                  >
                    <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                      {place.name}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slots List */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Available Slots
            </h2>
            {!selectedPlace ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Please select a place first
              </p>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">
                    Select Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  {slots.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No slots available for this date
                    </p>
                  ) : (
                    slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="card"
                        style={{
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: slot.is_available ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: slot.is_available ? 'var(--secondary-color)' : 'var(--text-secondary)' }}>
                            {slot.is_available ? 'Available' : 'Occupied'}
                          </p>
                        </div>
                        {slot.is_available && (
                          <button
                            onClick={() => handleBookSlot(slot.id)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            Book
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Zones;
