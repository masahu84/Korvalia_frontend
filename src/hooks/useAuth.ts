import { useState, useEffect } from 'react';
import { getCurrentUser, verifyAuth, type User } from '../lib/auth';

/**
 * Hook para manejar la autenticación
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación al montar
    const checkAuth = async () => {
      const currentUser = getCurrentUser();

      if (currentUser) {
        setUser(currentUser);

        // Verificar con el servidor
        const result = await verifyAuth();
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
