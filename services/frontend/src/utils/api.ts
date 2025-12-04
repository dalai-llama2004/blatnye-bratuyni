import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 errors
    // Note: Using window.location.href instead of Next.js router because
    // interceptors run outside React component context and don't have access to router
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Auth API
  async register(data: { name: string; email: string; password: string }) {
    const response = await this.client.post('/users/register', data);
    return response.data;
  }

  async confirmEmail(data: { email: string; code: string }) {
    const response = await this.client.post('/users/confirm', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/users/login', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async recoverPassword(data: { email: string }) {
    const response = await this.client.post('/users/recover', data);
    return response.data;
  }

  async resetPassword(data: { email: string; code: string; password: string }) {
    const response = await this.client.post('/users/reset', data);
    return response.data;
  }

  async logout() {
    this.clearToken();
  }

  // Zones API
  async getZones() {
    const response = await this.client.get('/zones');
    return response.data;
  }

  async getZoneById(id: string) {
    const response = await this.client.get(`/zones/${id}`);
    return response.data;
  }

  async getPlacesByZone(zoneId: string) {
    const response = await this.client.get(`/zones/${zoneId}/places`);
    return response.data;
  }

  // Places API
  async getPlaceById(id: string) {
    const response = await this.client.get(`/places/${id}`);
    return response.data;
  }

  async getSlotsByPlace(placeId: string, date: string) {
    const response = await this.client.get(`/places/${placeId}/slots`, {
      params: { date },
    });
    return response.data;
  }

  // Bookings API
  async createBooking(data: { place_id: string; slot_id: string }) {
    const response = await this.client.post('/bookings', data);
    return response.data;
  }

  async cancelBooking(bookingId: string) {
    const response = await this.client.post('/bookings/cancel', {
      booking_id: bookingId,
    });
    return response.data;
  }

  async extendBooking(bookingId: string) {
    const response = await this.client.post(`/bookings/${bookingId}/extend`);
    return response.data;
  }

  async getBookingHistory(params?: {
    status?: string;
    from?: string;
    to?: string;
    zone_id?: string;
  }) {
    const response = await this.client.get('/bookings/history', { params });
    return response.data;
  }

  // Admin API
  async createZone(data: { name: string; address: string; places_count: number }) {
    const response = await this.client.post('/admin/zones', data);
    return response.data;
  }

  async updateZone(id: string, data: { name?: string; address?: string }) {
    const response = await this.client.put(`/admin/zones/${id}`, data);
    return response.data;
  }

  async closeZone(id: string, data: { reason: string; from: string; to: string }) {
    const response = await this.client.post(`/admin/zones/${id}/close`, data);
    return response.data;
  }

  async deleteZone(id: string) {
    const response = await this.client.delete(`/admin/zones/${id}`);
    return response.data;
  }

  async createPlace(data: { zone_id: string; name: string }) {
    const response = await this.client.post('/admin/places', data);
    return response.data;
  }

  async deletePlace(id: string) {
    const response = await this.client.delete(`/admin/places/${id}`);
    return response.data;
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;
