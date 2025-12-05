/**
 * Utilidades de subida de archivos
 */

import { apiFetch } from './api';

interface UploadResponse {
  data: {
    url: string;
    filename: string;
  };
}

/**
 * Sube una imagen al servidor
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiFetch<UploadResponse>('/upload', {
    method: 'POST',
    body: formData,
  });

  return response.data.url;
}

/**
 * Sube múltiples imágenes al servidor
 */
export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await apiFetch<{ data: { urls: string[] } }>('/upload/multiple', {
    method: 'POST',
    body: formData,
  });

  return response.data.urls;
}

/**
 * Valida que un archivo sea una imagen válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'El archivo debe ser una imagen (JPG, PNG, WEBP o GIF)',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'La imagen no puede superar los 5MB',
    };
  }

  return { valid: true };
}

/**
 * Convierte un archivo a base64 para previsualización
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
