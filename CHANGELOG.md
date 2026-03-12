# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.1] - 2026-03-12

### 🔧 Actualizado

#### Documentación
- Actualizada configuración de puertos para Railway
  - Backend configurado para usar puerto 8080 (interno)
  - Aclarado que Railway maneja enrutamiento HTTPS automáticamente
  - Documentado en todos los archivos de configuración y guías
- Agregada sección de referencia técnica de puertos en [INDEX.md](docs/INDEX.md)
- Actualizados ejemplos de Docker para usar puerto 8080 del backend
- Aclarado que `BACKEND_URL` no debe incluir el puerto

#### Configuración
- `.env.example` - Actualizado comentario sobre puerto Docker (8080)
- `docker-entrypoint.sh` - Agregado comentario sobre puerto interno de Railway
- Documentación completa actualizada con referencias correctas al puerto 8080

## [1.0.0] - 2024-03-12

### ✨ Agregado

#### Infraestructura
- Configuración completa para deployment en Railway
- Dockerfile multi-stage optimizado para producción
- Script `docker-entrypoint.sh` para configuración dinámica de nginx
- Archivo `railway.json` para configuración del servicio
- Soporte para variables de entorno dinámicas

#### Documentación
- README principal con guía de inicio rápido
- Documentación completa en carpeta `docs/`
  - `README.md` - Descripción general del proyecto
  - `RAILWAY.md` - Guía de deployment en Railway
  - `DEPLOYMENT.md` - Guía paso a paso de deployment
  - `ARCHITECTURE.md` - Arquitectura del sistema
  - `DEVELOPMENT.md` - Guía de desarrollo local
  - `API.md` - Referencia completa de API
- Archivo `.env.example` documentando variables necesarias

#### Funcionalidades Core

##### Autenticación
- Sistema de login para socios (número de socio + contraseña)
- Sistema de login para administradores (usuario + contraseña)
- Autenticación con JWT
- Guards de navegación para protección de rutas
- Auto-redirect en token expirado
- Persistencia de sesión en localStorage

##### Panel de Socios
- Dashboard con resumen de actividades
- Vista de perfil con edición de datos personales
- Subida de foto de perfil
- Visualización de disciplinas disponibles
- Sistema de reservas de espacios
- Tienda de productos del club
- Historial de pedidos
- Historial de pagos

##### Panel Administrativo
- Dashboard con estadísticas generales
- CRUD completo de socios
  - Listado con búsqueda y filtros
  - Vista detallada de cada socio
  - Creación y edición de socios
  - Gestión de estado (activo/inactivo/suspendido)
- CRUD de disciplinas deportivas
- CRUD de empleados
- CRUD de espacios deportivos
- Gestión de reservas
  - Visualización de todas las reservas
  - Confirmación/cancelación de reservas
- CRUD de productos
  - Subida de imágenes de productos
  - Gestión de stock y precios
- Gestión de pedidos
  - Visualización de todos los pedidos
  - Cambio de estados
- Gestión de pagos
  - Registro de pagos
  - Seguimiento de vencimientos

##### Componentes Compartidos
- `LoadingSpinner` - Indicador de carga
- `EmptyState` - Estado vacío para listas sin datos
- `ImageUpload` - Componente de subida de imágenes

##### Layouts
- `AdminLayout` - Layout para panel administrativo
- `SocioLayout` - Layout para panel de socios

#### Integración y Servicios
- Cliente Axios configurado con interceptores
- Servicios organizados por módulo
- Manejo centralizado de errores
- Retry automático en errores de red
- Store de autenticación con Pinia

#### Optimizaciones
- Lazy loading de rutas
- Code splitting automático
- Compresión Gzip en nginx
- Cache de assets estáticos
- Build optimizado con Vite

### 🔧 Configurado

#### Desarrollo
- Vite como build tool y dev server
- Hot Module Replacement (HMR)
- Proxy configurado para desarrollo local
  - `/api` → `http://localhost:5055/api`
  - `/uploads` → `http://localhost:5055/uploads`

#### Producción
- Nginx como servidor web
- Reverse proxy dinámico usando `BACKEND_URL`
- Headers de seguridad
- HTTPS ready
- SPA routing configurado

#### Tooling
- ESLint para linting (configurado con Vue plugin)
- Prettier para formateo de código
- Vue DevTools compatible

### 🎨 UI/UX

#### Biblioteca de Componentes
- PrimeVue 3.48.0 como biblioteca principal
- PrimeIcons para iconografía
- PrimeFlex para utilidades CSS
- Tema configurado y personalizable

#### Componentes Utilizados
- DataTable con paginación y búsqueda
- Dialog para modales
- Toast para notificaciones
- ConfirmDialog para confirmaciones
- Calendar para selección de fechas
- Dropdown para selectores
- InputText, InputNumber, Textarea para formularios
- Button con variantes y iconos
- FileUpload para subida de archivos

### 🔐 Seguridad

- Autenticación basada en JWT
- Protección de rutas mediante guards
- Tokens con expiración
- Headers de seguridad en nginx
- Sanitización de inputs (Vue default)
- HTTPS en producción
- Variables de entorno para configuración sensible

### 📦 Dependencias

#### Producción
- vue: ^3.4.0
- vue-router: ^4.2.5
- pinia: ^2.1.7
- primevue: ^3.48.0
- primeicons: ^6.0.1
- primeflex: ^3.3.1
- axios: ^1.6.5

#### Desarrollo
- @vitejs/plugin-vue: ^5.0.0
- vite: ^5.0.10

---

## [Unreleased]

### 🚧 Planeado

- [ ] Tests unitarios con Vitest
- [ ] Tests E2E con Playwright
- [ ] PWA support con Workbox
- [ ] Internacionalización (i18n)
- [ ] Dark mode
- [ ] Notificaciones push
- [ ] Export a PDF/Excel en reportes
- [ ] Dashboard con gráficos (Chart.js)
- [ ] Drag & drop para ordenar elementos
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Calendario interactivo para reservas
- [ ] Chat en tiempo real (soporte)
- [ ] Sistema de notificaciones en tiempo real

### 🐛 Conocidos

Ninguno reportado actualmente.

---

## Guía de Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nuevas funcionalidades compatibles con versiones anteriores  
- **PATCH** (0.0.X): Correcciones de bugs compatibles con versiones anteriores

## Tipos de Cambios

- **✨ Agregado** (`Added`): Nuevas funcionalidades
- **🔧 Cambiado** (`Changed`): Cambios en funcionalidades existentes
- **❌ Deprecado** (`Deprecated`): Funcionalidades que se eliminarán pronto
- **🗑️ Eliminado** (`Removed`): Funcionalidades eliminadas
- **🐛 Corregido** (`Fixed`): Correcciones de bugs
- **🔐 Seguridad** (`Security`): Correcciones de vulnerabilidades
