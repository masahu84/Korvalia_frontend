# Panel Admin - Korvalia

Panel de administración completo para gestionar la inmobiliaria Korvalia.

## ✨ Características Implementadas

✅ **Autenticación JWT** - Login seguro con tokens
✅ **Dashboard** - Estadísticas y acciones rápidas
✅ **CRUD Propiedades** - Gestión completa con imágenes
✅ **CRUD Ciudades** - Gestión de ubicaciones
✅ **Configuración** - Hero section y datos de empresa
✅ **Upload de Imágenes** - Múltiples archivos con preview
✅ **Protección de Rutas** - Middleware de autenticación
✅ **UI Profesional** - Sidebar + Topbar responsive

## 📁 Estructura

```
src/
├── components/admin/
│   ├── AdminLayout.tsx       # Layout principal
│   ├── Sidebar.tsx           # Menú lateral
│   ├── Topbar.tsx            # Barra superior
│   ├── LoginForm.tsx         # Formulario de login
│   ├── Dashboard.tsx         # Dashboard con stats
│   ├── PropertyList.tsx      # Lista de propiedades
│   ├── PropertyForm.tsx      # Formulario de propiedad
│   ├── UploadImage.tsx       # Componente de upload
│   ├── CityManager.tsx       # Gestión de ciudades
│   └── SettingsForm.tsx      # Configuración
├── pages/admin/
│   ├── login.astro           # Página de login
│   ├── dashboard.astro       # Dashboard
│   ├── properties/
│   │   ├── index.astro       # Lista
│   │   ├── new.astro         # Nueva
│   │   └── [id].astro        # Editar
│   ├── cities.astro          # Ciudades
│   └── settings.astro        # Configuración
├── lib/
│   ├── api.ts                # Cliente API
│   └── auth.ts               # Autenticación
└── hooks/
    ├── useAuth.ts            # Hook de auth
    └── useApi.ts             # Hook de API
```

## 🚀 Instalación y Uso

### 1. Configurar Variables de Entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env`:

```env
PUBLIC_API_URL=http://localhost:4000/api
```

### 2. Instalar Dependencias (si no está hecho)

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

El panel estará disponible en: `http://localhost:4321/admin/login`

## 🔐 Acceso al Panel

**URL**: `/admin/login`

**Credenciales por defecto** (después de ejecutar el seed del backend):
- Email: `admin@korvalia.com`
- Contraseña: `admin123`

⚠️ **Importante**: Cambia la contraseña después del primer login.

## 📋 Funcionalidades del Panel

### 🏠 Dashboard
- **Estadísticas**: Total de propiedades, ventas, alquileres, destacadas
- **Últimas propiedades**: Las 5 más recientes
- **Acciones rápidas**: Links directos a crear propiedad, ciudades y settings

### 🏘️ Propiedades

**Listar**: `/admin/properties`
- Vista en tarjetas con imagen, título, precio, ubicación
- Filtro por título
- Badges de estado y destacada
- Acciones: Editar y Eliminar

**Crear**: `/admin/properties/new`
- Información básica: título, descripción, operación, tipo, precio
- Ubicación: ciudad, dirección
- Características: habitaciones, baños, m²
- Amenidades: ascensor, parking, piscina, terraza, jardín, amueblado, mascotas
- Estado: destacada
- Upload múltiple de imágenes (hasta 20)

**Editar**: `/admin/properties/[id]`
- Editar todos los campos de la propiedad
- **Nota**: Para editar imágenes existentes, por ahora elimina y crea de nuevo

### 🏙️ Ciudades

**URL**: `/admin/cities`
- Listar todas las ciudades con contador de propiedades
- Crear nueva ciudad (nombre + provincia)
- Eliminar ciudad (si no tiene propiedades asociadas)
- Auto-generación de slug

### ⚙️ Configuración

**URL**: `/admin/settings`

**Hero Section**:
- Título principal
- Subtítulo
- Imagen de fondo (upload)

**Información de Contacto**:
- Teléfono
- Email
- Dirección

**Redes Sociales**:
- Instagram
- Facebook
- WhatsApp

## 🎨 Componentes Reutilizables

### AdminLayout
Layout principal que envuelve todas las páginas admin.
```tsx
<AdminLayout
  title="Título"
  subtitle="Subtítulo"
  currentPath="/admin/dashboard"
>
  {children}
</AdminLayout>
```

### UploadImage
Componente para subir imágenes con preview.
```tsx
<UploadImage
  multiple={true}
  maxFiles={20}
  onFilesChange={(files) => setFiles(files)}
/>
```

## 🔒 Protección de Rutas

Todas las páginas admin (excepto `/admin/login`) están protegidas:

1. El `AdminLayout` verifica autenticación al montar
2. Si no hay token, redirige a `/admin/login`
3. El token se guarda en `localStorage`

## 📡 Integración con Backend

El panel consume la API del backend:

### Endpoints Utilizados

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Verificar usuario
- `GET /api/properties` - Listar propiedades
- `POST /api/properties` - Crear propiedad
- `PUT /api/properties/:id` - Actualizar propiedad
- `DELETE /api/properties/:id` - Eliminar propiedad
- `GET /api/cities` - Listar ciudades
- `POST /api/cities` - Crear ciudad
- `DELETE /api/cities/:id` - Eliminar ciudad
- `GET /api/settings` - Obtener configuración
- `PUT /api/settings` - Actualizar configuración

### Autenticación
Todas las peticiones (excepto login) incluyen el header:
```
Authorization: Bearer <token>
```

## 🎯 Próximas Mejoras Sugeridas

- [ ] Paginación en lista de propiedades
- [ ] Búsqueda avanzada con más filtros
- [ ] Gestión de imágenes existentes (reordenar, eliminar)
- [ ] Previsualización de la propiedad
- [ ] Gráficos en el dashboard
- [ ] Exportar datos a Excel/CSV
- [ ] Notificaciones push
- [ ] Gestión de usuarios admin
- [ ] Logs de actividad
- [ ] Backup automático

## 🐛 Solución de Problemas

### Error "Token no proporcionado"
- Verifica que hayas iniciado sesión
- Revisa que `localStorage` tenga el token
- El token podría haber expirado (duración: 7 días)

### Error "Network request failed"
- Verifica que el backend esté corriendo en `http://localhost:4000`
- Revisa la variable `PUBLIC_API_URL` en `.env`
- Comprueba la consola del navegador

### Las imágenes no se muestran
- Verifica que el backend tenga las carpetas `uploads/properties` y `uploads/settings`
- Comprueba que el backend sirva archivos estáticos con `app.use('/uploads', express.static('uploads'))`

## 📝 Notas Técnicas

- **Framework**: Astro + React
- **Estilos**: Tailwind CSS
- **Estado**: React Hooks (useState, useEffect)
- **Peticiones**: Fetch API con helpers personalizados
- **Autenticación**: JWT en localStorage
- **Upload**: FormData con Multer (backend)

---

**Panel Admin completamente funcional y listo para usar! 🎉**
