# Club Socios - Frontend

## 📋 Descripción

Frontend del sistema de gestión de Club de Socios desarrollado con Vue 3, Vite, PrimeVue y Pinia. Proporciona interfaces separadas para administradores y socios con funcionalidades completas de gestión.

## 🚀 Características

- **Autenticación**: Sistema de login separado para administradores y socios
- **Gestión de Socios**: CRUD completo de socios con perfiles detallados
- **Disciplinas**: Gestión y visualización de actividades deportivas
- **Reservas**: Sistema de reservas de espacios deportivos
- **Tienda**: Catálogo de productos y gestión de pedidos
- **Pagos**: Registro y seguimiento de pagos
- **Empleados y Espacios**: Gestión administrativa completa

## 🛠️ Tecnologías

- **Vue 3** - Framework JavaScript progresivo
- **Vite** - Build tool y dev server
- **Vue Router** - Navegación SPA
- **Pinia** - State management
- **PrimeVue** - Biblioteca de componentes UI
- **Axios** - Cliente HTTP
- **Nginx** - Servidor web para producción

## 📁 Estructura del Proyecto

```
club-socios-vue/
├── docs/                    # Documentación del proyecto
├── public/                  # Archivos públicos estáticos
│   └── images/             # Imágenes
├── src/
│   ├── assets/             # Recursos (CSS, imágenes)
│   ├── components/         # Componentes reutilizables
│   │   └── shared/         # Componentes compartidos
│   ├── layouts/            # Layouts de aplicación
│   ├── router/             # Configuración de rutas
│   ├── services/           # Servicios API
│   ├── stores/             # Stores Pinia
│   └── views/              # Vistas/páginas
│       ├── admin/          # Vistas del panel admin
│       ├── auth/           # Vistas de autenticación
│       └── socio/          # Vistas del panel socio
├── Dockerfile              # Configuración Docker
├── nginx.conf              # Configuración Nginx
├── docker-entrypoint.sh    # Script de inicio Docker
└── vite.config.js          # Configuración Vite
```

## 🔧 Desarrollo Local

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd club-socios-vue

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor de desarrollo estará disponible en `http://localhost:5001`

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 🐳 Docker

### Build Local

```bash
# Construir imagen
docker build -t club-socios-frontend .

# Ejecutar contenedor
docker run -p 80:80 -e BACKEND_URL=https://tu-backend.com club-socios-frontend
```

## ☁️ Deploy en Railway

Ver la guía completa de deploymentent en [docs/RAILWAY.md](./RAILWAY.md)

### Pasos Rápidos

1. Conectar repositorio a Railway
2. Configurar variable de entorno `BACKEND_URL`
3. Railway detectará automáticamente el Dockerfile
4. Deploy automático en cada push

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

- Los tokens se almacenan en `localStorage`
- Las requests incluyen automáticamente el token en el header `Authorization`
- Redirección automática al login si el token expira

## 🌐 Proxy y API

### Desarrollo
El proxy de Vite redirige las peticiones:
- `/api/*` → `http://localhost:5055/api/*` (backend local)
- `/uploads/*` → `http://localhost:5055/uploads/*`

### Producción (Railway)
Nginx actúa como reverse proxy usando la variable `BACKEND_URL`
- Backend expone puerto 8080 internamente
- Railway maneja el enrutamiento HTTPS automáticamente

## 📝 Rutas Principales

### Acceso Público
- `/login` - Login de socios
- `/admin/login` - Login de administradores

### Panel Socio
- `/socio/dashboard` - Dashboard del socio
- `/socio/perfil` - Perfil personal
- `/socio/disciplinas` - Disciplinas disponibles
- `/socio/reservas` - Gestión de reservas
- `/socio/tienda` - Tienda de productos
- `/socio/pedidos` - Mis pedidos
- `/socio/pagos` - Mis pagos

### Panel Admin
- `/admin/dashboard` - Dashboard administrativo
- `/admin/socios` - Gestión de socios
- `/admin/disciplinas` - Gestión de disciplinas
- `/admin/empleados` - Gestión de empleados
- `/admin/espacios` - Gestión de espacios
- `/admin/reservas` - Gestión de reservas
- `/admin/productos` - Gestión de productos
- `/admin/pedidos` - Gestión de pedidos
- `/admin/pagos` - Gestión de pagos

## 🎨 Componentes UI

El proyecto utiliza PrimeVue para componentes de interfaz:
- Tablas con DataTable
- Formularios con InputText, Dropdown, Calendar
- Modales con Dialog
- Notificaciones con Toast
- Confirmaciones con ConfirmDialog

## 📦 Build y Deployment

La aplicación se construye en dos etapas usando Docker multi-stage:

1. **Build Stage**: Compila el código Vue con Vite
2. **Production Stage**: Sirve la aplicación con Nginx

El archivo resultante es una imagen Docker optimizada de ~30MB.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Soporte

Para soporte y consultas, contactar al equipo de desarrollo.
