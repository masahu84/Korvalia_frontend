import { logout } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title = 'Panel de Administración', subtitle }: TopbarProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.isSuper ? 'Super Admin' : 'Admin'}</p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
