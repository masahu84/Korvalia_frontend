# Panel de Administración - Korvalia

Panel de administración independiente para la gestión de la inmobiliaria Korvalia.

## 🏗️ Estructura

```
src/admin/
├── layouts/
│   ├── AdminLayout.astro       # Layout principal del admin
│   └── AuthLayout.astro         # Layout para login/reset-password
├── pages/
│   ├── index.astro              # Redirección automática
│   ├── login.astro              # Página de login
│   ├── reset-password.astro     # Restablecer contraseña
│   ├── dashboard.astro          # Dashboard principal
│   ├── hero.astro               # Configuración del Hero
│   ├── logo.astro               # Gestión del logo
│   ├── account.astro            # Configuración de cuenta
│   └── properties/
│       ├── index.astro          # Listado de propiedades
│       ├── new.astro            # Nueva propiedad
│       └── [id].astro           # Editar propiedad
├── components/
│   ├── AdminSidebar.tsx         # Sidebar de navegación
│   ├── AdminTopbar.tsx          # Barra superior
│   ├── LoginForm.tsx            # Formulario de login
│   ├── Dashboard.tsx            # Dashboard con estadísticas
│   ├── HeroForm.tsx             # Formulario del Hero
│   ├── LogoForm.tsx             # Formulario del Logo
│   ├── PropertyTable.tsx        # Tabla de propiedades
│   ├── PropertyForm.tsx         # Formulario CRUD propiedades
│   └── AccountSettings.tsx      # Configuración de cuenta
└── lib/
    ├── api.ts                   # Wrapper de API con JWT
    ├── auth.ts                  # Funciones de autenticación
    └── upload.ts                # Utilidades de subida de archivos
```

## 🚀 Características

### Autenticación
- ✅ Login con JWT
- ✅ Logout
- ✅ Cambio de contraseña
- ✅ Restablecimiento de contraseña
- ✅ Protección de rutas

### Dashboard
- ✅ Estadísticas de propiedades
- ✅ Total de alquileres/ventas
- ✅ Propiedades destacadas
- ✅ Última propiedad creada
- ✅ Acciones rápidas

### Gestión de Hero
- ✅ Editar título y subtítulo
- ✅ Subir múltiples imágenes (slider)
- ✅ Previsualización de imágenes
- ✅ Eliminar imágenes

### Gestión de Logo
- ✅ Subir nuevo logo
- ✅ Previsualización
- ✅ Vista del logo actual

### Gestión de Propiedades
- ✅ Listado completo
- ✅ Crear nueva propiedad
- ✅ Editar propiedades existentes
- ✅ Eliminar propiedades
- ✅ Subida múltiple de imágenes
- ✅ Campos completos (operación, tipo, precio, ciudad, etc.)
- ✅ Amenities (ascensor, garaje, terraza, piscina, etc.)
- ✅ Coordenadas opcionales
- ✅ Marcar como destacada

## 🎨 Diseño

El panel admin tiene un diseño completamente independiente:

- **Colores principales:**
  - Fondo: `#F2F2F2`
  - Sidebar: `#1F2937`
  - Tarjetas: `#FFFFFF`
  - Primario: `#3B82F6`
  - Peligro: `#EF4444`

- **Layout:**
  - Sidebar fijo a la izquierda
  - Topbar sticky
  - Contenedor central con max-width de 1200px
  - Sin header ni footer público

## 🔐 Seguridad

- Token JWT almacenado en localStorage
- Verificación automática en cada página protegida
- Redirección a login si no está autenticado
- Logout al detectar token inválido (401)

## 📡 Endpoints del Backend

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obtener usuario autenticado
- `POST /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña

### Propiedades
- `GET /api/properties` - Listar propiedades
- `GET /api/properties/:id` - Obtener propiedad
- `POST /api/properties` - Crear propiedad
- `PUT /api/properties/:id` - Actualizar propiedad
- `DELETE /api/properties/:id` - Eliminar propiedad

### Configuración
- `GET /api/settings` - Obtener configuración
- `PUT /api/settings` - Actualizar configuración

### Upload
- `POST /api/upload` - Subir imagen única
- `POST /api/upload/multiple` - Subir múltiples imágenes

## 🔧 Variables de Entorno

Asegúrate de tener configurado en el frontend:

```env
PUBLIC_API_URL=http://localhost:3000/api
```

## 📝 Notas Importantes

1. **Independencia total:** El admin NO comparte estilos ni componentes con la web pública
2. **Responsividad:** Diseñado principalmente para desktop (panel de gestión)
3. **Validación:** Validación tanto en frontend como backend
4. **Imágenes:** Máximo 5MB por imagen, formatos JPG, PNG, WEBP, GIF
5. **Token:** El token expira según configuración del backend (por defecto 7 días)

## 🚀 Uso

1. Accede a `/admin`
2. Inicia sesión con tus credenciales
3. Gestiona todas las secciones desde el sidebar
4. Para cerrar sesión, usa el menú del topbar

---

**Desarrollado para Korvalia** 🏡
