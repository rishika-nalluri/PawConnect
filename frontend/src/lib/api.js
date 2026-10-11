import { supabase } from '../supabaseClient';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the Spring Boot API with the signed-in user's Supabase access token.
 * Request and response bodies use snake_case, which the backend is configured for.
 */
export async function api(path, { method = 'GET', body } = {}) {
  if (!BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL is not set. See frontend/.env.example.', 0);
  }
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Render's free tier sleeps when idle, so the first request can fail while the service wakes.
    throw new ApiError('Could not reach the PawConnect server. It may be waking up; try again in a minute.', 0);
  }

  if (res.status === 204) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status);
  }
  return json;
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}
