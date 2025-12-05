/**
 * Utilidades de autenticación
 */

import { post, get } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  isSuper: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Realiza login y guarda el token
 */
export async function login(email: string, password: string): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  console.log('Attempting login with:', { email });
  const response = await post<LoginResponse>('/auth/login', { email, password });
  console.log('Login response:', response);

  if (response.success && response.data) {
    // Guardar token en localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return {
      success: true,
      user: response.data.user,
    };
  }

  return {
    success: false,
    error: response.error || 'Error al iniciar sesión',
  };
}

/**
 * Cierra sesión
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/admin/login';
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token;
}

/**
 * Obtiene el usuario actual del localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Verifica la autenticación con el servidor
 */
export async function verifyAuth(): Promise<{
  success: boolean;
  user?: User;
}> {
  const response = await get<User>('/auth/me');

  if (response.success && response.data) {
    // Actualizar usuario en localStorage
    localStorage.setItem('user', JSON.stringify(response.data));

    return {
      success: true,
      user: response.data,
    };
  }

  // Si falla, limpiar localStorage
  logout();

  return {
    success: false,
  };
}

/**
 * Redirige a login si no está autenticado
 */
export function requireAuth(): void {
  if (!isAuthenticated()) {
    window.location.href = '/admin/login';
  }
}
