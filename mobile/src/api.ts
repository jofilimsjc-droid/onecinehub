import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';
import type { CheckAuthResponse } from './types/api';

type ApiResult<T> = { ok: boolean; status: number; data: T };

type ApiOptions = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: Record<string, string>;
  body?: unknown;
};

// Use the root mobile API endpoint (token-based).
const MOBILE_API_URL = `${API_BASE_URL}/api-mobile.php`;

const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch {
    return null;
  }
};

const api = async <T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResult<T>> => {
  const token = await getToken();
  const url = `${MOBILE_API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Auth-Token': token } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, status: res.status, data };
  } catch (error: any) {
    // Network error
    return { ok: false, status: 0, data: { error: error.message || 'Network error' } as T };
  }
};

export const authApi = {
  login: async (emailOrUsername: string, password: string) => {
    try {
      const res = await fetch(`${MOBILE_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: emailOrUsername, password }),
      });
      const data = await res.json();
      return data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error. Please check your connection.' };
    }
  },
  register: async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      const res = await fetch(`${MOBILE_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          username,
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();
      return data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Cannot connect to server. Please check your internet connection.' };
    }
  },
  logout: async () => {
    const token = await getToken();
    if (token) {
      await fetch(`${MOBILE_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ action: 'logout' }),
      }).catch(() => {});
    }
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  requestPasswordReset: async (email: string) => {
    try {
      const res = await fetch(`${MOBILE_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_password_reset', email }),
      });
      const data = await res.json();
      return data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error. Please check your connection.' };
    }
  },

  resetPasswordWithOtp: async (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    try {
      const res = await fetch(`${MOBILE_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password_with_otp',
          email,
          otp,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();
      return data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error. Please check your connection.' };
    }
  },
};

export const getMovies = () => api<any[]>('?action=get_movies');
export const getCinemas = () => api<any[]>('?action=get_cinemas');
export const getSchedules = (movieId?: number) => api<any[]>(movieId ? `?action=get_schedules&movie_id=${movieId}` : '?action=get_schedules');
export const getTrailers = () => api<any[]>('?action=get_trailers');
export const checkAuth = () => api<CheckAuthResponse>('?action=check_auth');

export const toggleFavorite = (movieId: number) =>
  api<{ success: boolean; favorited: boolean; message?: string }>('?action=toggle_favorite', {
    method: 'POST',
    body: { movie_id: movieId },
  });

export const getOccupiedSeats = (movieId: number, branch: string, date: string, time: string) =>
  api<string[]>(
    `?action=get_occupied_seats&movie_id=${movieId}&branch=${encodeURIComponent(branch)}&date=${date}&time=${encodeURIComponent(time)}`,
  );

export const createBooking = (booking: {
  movie_id: number;
  cinema_id: number;
  branch: string;
  date: string;
  time: string;
  seats: string[];
  total_price: number;
  payment_method: string;
}) =>
  api<{ success: boolean; tx_number?: string; message?: string }>('?action=create_booking', {
    method: 'POST',
    body: booking,
  });

export const getNotifications = () => api<any[]>('?action=get_notifications');

export const markNotificationRead = (notificationId: number) =>
  api<{ success: boolean }>('?action=mark_notification_read', {
    method: 'POST',
    body: { notification_id: notificationId },
  });

export const markAllNotificationsRead = () =>
  api<{ success: boolean }>('?action=mark_all_notifications_read', {
    method: 'POST',
  });

export const updateProfile = (username: string, email: string, phone: string) =>
  api<{ success: boolean; message: string; user?: any }>('?action=update_profile', {
    method: 'POST',
    body: { username, email, phone },
  });

export const changePassword = (currentPassword: string, newPassword: string, confirmPassword: string) =>
  api<{ success: boolean; message: string }>('?action=change_password', {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword },
  });

