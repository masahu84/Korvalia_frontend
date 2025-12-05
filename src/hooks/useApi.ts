import { useState, useCallback } from 'react';
import type { ApiResponse } from '../lib/api';

/**
 * Hook para manejar peticiones a la API con estado
 */
export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();

        if (response.success && response.data) {
          setData(response.data);
          setLoading(false);
          return true;
        } else {
          setError(response.error || 'Error en la petición');
          setLoading(false);
          return false;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMsg);
        setLoading(false);
        return false;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
