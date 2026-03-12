# Arquitectura del Sistema

## 🏗️ Visión General

El sistema Club Socios está construido con una arquitectura moderna de tres capas:

```
┌─────────────────────────────────────────────────┐
│          Frontend (Vue.js + Nginx)              │
│  - Interfaz de usuario                          │
│  - Autenticación JWT                            │
│  - State management (Pinia)                     │
└────────────────┬────────────────────────────────┘
                 │ HTTPS/REST API
┌────────────────▼────────────────────────────────┐
│          Backend (Node.js/Express)              │
│  - API RESTful                                  │
│  - Lógica de negocio                            │
│  - Autenticación y autorización                 │
└────────────────┬────────────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────────────┐
│          Base de Datos (PostgreSQL)             │
│  - Almacenamiento de datos                      │
│  - Relaciones e integridad                      │
└─────────────────────────────────────────────────┘
```

## 🎨 Frontend - Arquitectura de Componentes

### Estructura de Capas

```
┌─────────────────────────────────────────┐
│            Views (Páginas)              │
│  Vistas específicas de cada módulo      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           Layouts                       │
│  AdminLayout | SocioLayout              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Components (Reutilizables)         │
│  LoadingSpinner | ImageUpload | etc     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Services (Comunicación API)        │
│  api.js con interceptors                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Stores (State Management)          │
│  Pinia stores para estado global        │
└─────────────────────────────────────────┘
```

### Flujo de Datos

```
Usuario Interactúa
       ↓
  View Component
       ↓
  Método/Evento
       ↓
  Service API ←→ Store (Pinia)
       ↓
  Actualiza UI
```

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

```
1. Usuario envía credenciales
       ↓
2. Backend valida y genera JWT
       ↓
3. Frontend almacena token en localStorage
       ↓
4. Requests subsiguientes incluyen token en header
       ↓
5. Backend valida token en cada request
```

### Interceptores Axios

```javascript
// Request Interceptor
Token desde localStorage → Authorization Header

// Response Interceptor  
401 Unauthorized → Logout automático → Redirect a /login
```

## 🛣️ Sistema de Rutas

### Protección de Rutas

```javascript
Router Guards
    ↓
¿Usuario autenticado? → No → Redirect a login
    ↓ Sí
¿Rol correcto? → No → Redirect a dashboard apropiado
    ↓ Sí
Permitir acceso
```

### Estructura de Rutas

```
/
├── /login (público)
├── /admin/login (público)
│
├── /socio/* (requiere auth socio)
│   ├── /dashboard
│   ├── /perfil
│   ├── /disciplinas
│   ├── /reservas
│   ├── /tienda
│   ├── /pedidos
│   └── /pagos
│
└── /admin/* (requiere auth admin)
    ├── /dashboard
    ├── /socios
    ├── /disciplinas
    ├── /empleados
    ├── /espacios
    ├── /reservas
    ├── /productos
    ├── /pedidos
    └── /pagos
```

## 📦 Gestión de Estado

### Store de Autenticación (Pinia)

```javascript
State:
- user: Datos del usuario actual
- token: JWT token
- isAuthenticated: Boolean

Actions:
- login(credentials)
- logout()
- checkAuth()
- updateProfile(data)
```

### Persistencia

- **localStorage**: Token JWT, datos básicos del usuario
- **Session**: Estado temporal de la aplicación

## 🎯 Patrones de Diseño Utilizados

### 1. Single Page Application (SPA)
- Carga inicial de la aplicación
- Navegación sin recargas de página
- Vue Router maneja el historial

### 2. Component-Based Architecture
- Componentes reutilizables
- Props para comunicación padre → hijo
- Events para comunicación hijo → padre
- Slots para contenido flexible

### 3. Service Layer Pattern
- Servicios abstraen comunicación con API
- Centralizan lógica de peticiones HTTP
- Facilitan testing y mantenimiento

### 4. Repository Pattern (implícito)
- Stores Pinia actúan como repositorios
- Centralizan acceso a datos
- Cache y sincronización de estado

## 🔄 Flujo de Datos Completo

### Ejemplo: Crear una Reserva

```
1. Usuario completa formulario en ReservasView.vue
       ↓
2. View llama a método local handleSubmit()
       ↓
3. Método usa service: await reservasService.create(data)
       ↓
4. Service hace POST a /api/reservas con axios
       ↓
5. Interceptor añade Authorization header
       ↓
6. Request llega al backend
       ↓
7. Backend valida, procesa y responde
       ↓
8. Response interceptor verifica status
       ↓
9. Service retorna datos al componente
       ↓
10. Componente actualiza UI y/o store
       ↓
11. Usuario ve confirmación
```

## 🚀 Build y Deployment

### Desarrollo

```
Vite Dev Server
    ↓
Hot Module Replacement (HMR)
    ↓
Proxy a Backend Local (/api → localhost:5055)
```

### Producción

```
Build Process:
1. Vite compila Vue → JavaScript optimizado
2. Tree-shaking elimina código no usado
3. Minificación de assets
4. Code splitting para lazy loading
    ↓
Docker Multi-Stage Build:
1. Stage 1: Build con Node.js
2. Stage 2: Servir con Nginx
    ↓
Deployment (Railway):
- Nginx sirve archivos estáticos
- Nginx hace proxy a /api → Backend (puerto 8080)
- Railway maneja HTTPS automáticamente
- Compresión Gzip
- Cache de assets
```

## 🔧 Configuración de Nginx

### Responsabilidades

1. **Servidor de archivos estáticos**
   - Sirve JS, CSS, HTML, imágenes
   - Cache de assets estáticos

2. **Reverse Proxy**
   - `/api/*` → Backend API
   - `/uploads/*` → Backend archivos

3. **SPA Support**
   - Todas las rutas → `index.html`
   - Vue Router maneja navegación

4. **Optimizaciones**
   - Compresión Gzip
   - Cache headers
   - HTTP/2 support

## 📊 Diagrama de Componentes Principales

```
App.vue
  ├── Router View
      │
      ├── AdminLayout.vue
      │     ├── Navbar
      │     ├── Sidebar
      │     └── Router View (contenido)
      │           ├── DashboardView.vue
      │           ├── SociosView.vue
      │           │     ├── LoadingSpinner
      │           │     ├── EmptyState
      │           │     └── PrimeVue Components
      │           └── ...
      │
      └── SocioLayout.vue
            ├── Navbar
            ├── Sidebar
            └── Router View (contenido)
                  ├── DashboardView.vue
                  ├── PerfilView.vue
                  │     └── ImageUpload
                  └── ...
```

## 🔌 Integración con Backend

### Endpoints Principales

```
Auth:
POST   /api/auth/login          - Login socios
POST   /api/auth/admin/login    - Login admin
GET    /api/auth/me             - Usuario actual

Socios:
GET    /api/socios              - Listar socios
POST   /api/socios              - Crear socio
GET    /api/socios/:id          - Ver socio
PUT    /api/socios/:id          - Actualizar socio
DELETE /api/socios/:id          - Eliminar socio

Reservas:
GET    /api/reservas            - Listar reservas
POST   /api/reservas            - Crear reserva
PUT    /api/reservas/:id        - Actualizar reserva
DELETE /api/reservas/:id        - Cancelar reserva

... (similar para otros recursos)
```

### Formato de Responses

```javascript
// Success
{
  success: true,
  data: {...},
  message: "Operación exitosa"
}

// Error
{
  success: false,
  error: "Mensaje de error",
  details: {...}
}
```

## 🔄 Estado de la Aplicación

### Ciclo de Vida

```
1. Carga inicial → App.vue mounted
2. Router intercepta URL
3. Verifica autenticación (beforeEach guard)
4. Carga componente apropiado
5. Componente fetches datos necesarios
6. Renderiza UI
7. Usuario interactúa → actualiza estado
8. Reactivity system actualiza UI automáticamente
```

## 🎨 Temas y Estilos

### Estructura de Estilos

```
PrimeVue Theme (base)
    ↓
PrimeFlex (utilidades)
    ↓
assets/main.css (customización)
    ↓
Scoped styles en componentes
```

## 🧪 Testing Strategy (Recomendado)

```
Unit Tests
    ↓ Services, Stores
Integration Tests
    ↓ Components + Services
E2E Tests
    ↓ Flujos completos de usuario
```

## 📈 Escalabilidad

### Consideraciones

1. **Code Splitting**: Lazy loading de rutas
2. **Asset Optimization**: Compresión de imágenes
3. **CDN**: Para archivos estáticos (recomendado)
4. **Cache Strategy**: Service Workers (futuro)
5. **API Pagination**: Para listados grandes
6. **Infinite Scroll**: En lugar de paginación tradicional

## 🔐 Seguridad

### Medidas Implementadas

1. **Autenticación JWT**: Tokens con expiración
2. **HTTPS Only**: En producción
3. **CORS**: Configurado en backend
4. **XSS Protection**: Vue sanitiza por defecto
5. **Route Guards**: Protección de rutas
6. **Input Validation**: Cliente y servidor
7. **Secure Headers**: Configurados en Nginx

### Vulnerabilidades Mitigadas

- ✅ XSS (Cross-Site Scripting)
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ Inyección SQL (backend)
- ✅ Autenticación débil
- ✅ Exposición de datos sensibles

## 🚦 Performance

### Optimizaciones Aplicadas

1. **Lazy Loading**: Rutas cargadas bajo demanda
2. **Minificación**: JS/CSS minificados
3. **Gzip**: Compresión de assets
4. **Cache**: Headers de cache optimizados
5. **Tree Shaking**: Eliminación de código no usado
6. **Vue Devtools**: Solo en desarrollo

### Métricas Objetivo

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle Size: < 500KB (gzipped)

---

Esta arquitectura proporciona:
- ✅ Separación de responsabilidades
- ✅ Mantenibilidad
- ✅ Escalabilidad
- ✅ Seguridad
- ✅ Performance
