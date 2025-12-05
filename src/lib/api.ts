/**
 * Cliente API para comunicación con el backend
 */

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Obtiene el token JWT del localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Realiza una petición a la API
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Agregar token si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Agregar Content-Type solo si no es FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error en la petición',
        details: data.details,
      };
    }

    return data;
  } catch (error) {
    console.error('Error en la petición:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Helper GET
 */
export async function get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'GET' });
}

/**
 * Helper POST
 */
export async function post<T = any>(
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  const body = data instanceof FormData ? data : JSON.stringify(data);

  return request<T>(endpoint, {
    method: 'POST',
    body,
  });
}

/**
 * Helper PUT
 */
export async function put<T = any>(
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  const body = data instanceof FormData ? data : JSON.stringify(data);

  return request<T>(endpoint, {
    method: 'PUT',
    body,
  });
}

/**
 * Helper DELETE
 */
export async function del<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'DELETE' });
}

/**
 * Helper para upload de archivos
 */
export async function upload<T = any>(
  endpoint: string,
  files: File | File[],
  fieldName: string = 'images',
  additionalData?: Record<string, any>
): Promise<ApiResponse<T>> {
  const formData = new FormData();

  // Agregar archivos
  if (Array.isArray(files)) {
    files.forEach((file) => {
      formData.append(fieldName, file);
    });
  } else {
    formData.append(fieldName, files);
  }

  // Agregar datos adicionales
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return post<T>(endpoint, formData);
}
