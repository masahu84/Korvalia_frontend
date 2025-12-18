/**
 * API wrapper con autenticación JWT
 */

// Para el admin, necesitamos la URL completa con /api
const API_BASE_URL = import.meta.env.PUBLIC_API_URL
  ? `${import.meta.env.PUBLIC_API_URL}/api`
  : 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Obtiene el token JWT del localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

/**
 * Guarda el token JWT en localStorage
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_token', token);
}

/**
 * Elimina el token JWT del localStorage
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
}

/**
 * Wrapper de fetch con autenticación automática
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  const fetchHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // Añadir token si se requiere autenticación
  if (requiresAuth) {
    const token = getToken();
    if (token) {
      fetchHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Si el body es FormData, no establecer Content-Type (el navegador lo hará automáticamente)
  if (!(restOptions.body instanceof FormData)) {
    if (typeof restOptions.body === 'object') {
      fetchHeaders['Content-Type'] = 'application/json';
      restOptions.body = JSON.stringify(restOptions.body);
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers: fetchHeaders,
  });

  // Manejar errores de autenticación
  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new Error('No autorizado');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en la petición');
  }

  return response.json();
}

/**
 * Métodos HTTP
 */
export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: data }),

  put: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body: data }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: data }),
};
