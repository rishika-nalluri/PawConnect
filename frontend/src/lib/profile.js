import { api } from './api';

// Profile of the signed-in account (served by the backend's /profiles/me).
export async function loadProfile() {
  return api('/profiles/me');
}
