/**
 * Utilidades de autenticación
 */

import { api, getToken, setToken, removeToken } from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      name: string;
    };
  };
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ResetPasswordData {
  email: string;
  newPassword: string;
}

/**
 * Inicia sesión y guarda el token
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', credentials, {
    requiresAuth: false,
  });

  if (response.data?.token) {
    setToken(response.data.token);
  }

  return response;
}

/**
 * Cierra sesión y elimina el token
 */
export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token;
}

/**
 * Obtiene los datos del usuario autenticado
 */
export async function getAuthenticatedUser() {
  return api.get('/auth/me');
}

/**
 * Cambia la contraseña del usuario autenticado
 */
export async function changePassword(data: ChangePasswordData) {
  return api.post('/auth/change-password', data);
}

/**
 * Restablece la contraseña (sin autenticación)
 */
export async function resetPassword(data: ResetPasswordData) {
  return api.post('/auth/reset-password', data, {
    requiresAuth: false,
  });
}

/**
 * Redirige al login si no está autenticado (solo en el cliente)
 */
export function requireAuth(): boolean {
  if (typeof window === 'undefined') return false;

  if (!isAuthenticated()) {
    window.location.href = '/admin/login';
    return false;
  }

  return true;
}
