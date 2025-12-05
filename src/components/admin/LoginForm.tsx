import { useState, type FormEvent } from 'react';
import { login } from '../../lib/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      console.log('Login result:', result);

      if (result.success) {
        // Redirigir al dashboard
        window.location.href = '/admin/dashboard';
      } else {
        setError(result.error || 'Error al iniciar sesión');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión con el servidor');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-brand-primary/10 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-brand-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold font-heading text-brand-primary">Korvalia Admin</h1>
            <p className="text-brand-secondary mt-2">Inicia sesión para continuar</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="admin@korvalia.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white py-3 px-4 rounded-lg font-button font-medium hover:bg-brand-primary/90 focus:ring-4 focus:ring-brand-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Usuario por defecto: <span className="font-mono font-medium">admin@korvalia.com</span>
            </p>
            <p className="text-xs text-gray-600 text-center mt-1">
              Contraseña: <span className="font-mono font-medium">admin123</span>
            </p>
          </div>
        </div>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-white hover:text-blue-100 text-sm font-medium transition-colors"
          >
            ← Volver al sitio web
          </a>
        </div>
      </div>
    </div>
  );
}
