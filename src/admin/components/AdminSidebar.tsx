/**
 * Sidebar del panel de administración
 */

import { useState, useEffect } from 'react';

interface SidebarProps {
  currentPath?: string;
}

interface NavItem {
  name: string;
  path: string;
  icon: string;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  {
    name: 'Viviendas',
    path: '/admin/properties',
    icon: '🏠',
    subItems: [
      { name: 'Listado', path: '/admin/properties', icon: '📋' },
      { name: 'Ciudades', path: '/admin/properties/cities', icon: '🌍' },
    ]
  },
  { name: 'Home', path: '/admin/settings/home', icon: '🏡' },
  { name: 'Propiedades', path: '/admin/settings/properties', icon: '🔍' },
  { name: 'Sobre Korvalia', path: '/admin/settings/about', icon: 'ℹ️' },
  { name: 'Contacto', path: '/admin/settings/contact', icon: '📧' },
  { name: 'Datos Empresa', path: '/admin/company', icon: '🏢' },
  { name: 'Mi Cuenta', path: '/admin/account', icon: '⚙️' },
];

export default function AdminSidebar({ currentPath = '' }: SidebarProps) {
  const [activePath, setActivePath] = useState(currentPath);
  const [expandedItems, setExpandedItems] = useState<string[]>(['/admin/properties']);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname);
    }
  }, []);

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return activePath === path;
    }
    return activePath.startsWith(path);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  return (
    <aside className="admin-sidebar">
      <div style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            Korvalia
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Panel de Administración</p>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.path} style={{ marginBottom: '0.25rem' }}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.path)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive(item.path) ? 'white' : '#d1d5db',
                        backgroundColor: isActive(item.path) ? '#3b82f6' : 'transparent',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.path)) {
                          e.currentTarget.style.backgroundColor = '#374151';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.path)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>
                        {expandedItems.includes(item.path) ? '▼' : '▶'}
                      </span>
                    </button>
                    {expandedItems.includes(item.path) && (
                      <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.25rem', marginLeft: '1rem' }}>
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path} style={{ marginBottom: '0.25rem' }}>
                            <a
                              href={subItem.path}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isActive(subItem.path) ? 'white' : '#9ca3af',
                                backgroundColor: isActive(subItem.path) ? '#2563eb' : 'transparent',
                                transition: 'all 0.2s',
                                fontSize: '0.8125rem',
                                fontWeight: '400',
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive(subItem.path)) {
                                  e.currentTarget.style.backgroundColor = '#374151';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive(subItem.path)) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <span style={{ fontSize: '1rem' }}>{subItem.icon}</span>
                              <span>{subItem.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <a
                    href={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive(item.path) ? 'white' : '#d1d5db',
                      backgroundColor: isActive(item.path) ? '#3b82f6' : 'transparent',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.backgroundColor = '#374151';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #374151' }}>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
          © 2025 Korvalia
        </p>
      </div>
    </aside>
  );
}
