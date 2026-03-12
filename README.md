# Club Socios - Frontend Vue.js

Sistema de gestión de Club de Socios desarrollado con Vue 3, Vite, y PrimeVue.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5001`

### Deploy en Railway

Configurar variable de entorno:
```
BACKEND_URL=https://tu-backend.up.railway.app
```

Railway detectará automáticamente el `Dockerfile` y desplegará la aplicación.

## 📚 Documentación Completa

- **[Guía Completa](docs/README.md)** - Descripción general del proyecto
- **[Railway Deployment](docs/RAILWAY.md)** - Guía completa de deployment en Railway
- **[Arquitectura](docs/ARCHITECTURE.md)** - Arquitectura del sistema
- **[Desarrollo](docs/DEVELOPMENT.md)** - Guía de desarrollo local
- **[API Reference](docs/API.md)** - Referencia de endpoints del backend

## 🛠️ Stack Tecnológico

- **Vue 3** - Framework JavaScript
- **Vite** - Build tool
- **Vue Router** - Navegación
- **Pinia** - State management
- **PrimeVue** - Componentes UI
- **Axios** - Cliente HTTP
- **Nginx** - Servidor web (producción)

## 📁 Estructura

```
club-socios-vue/
├── docs/              # Documentación completa
├── src/               # Código fuente
│   ├── components/    # Componentes reutilizables
│   ├── views/         # Vistas/páginas
│   ├── router/        # Configuración de rutas
│   ├── services/      # Servicios API
│   └── stores/        # Stores Pinia
├── Dockerfile         # Configuración Docker
└── nginx.conf         # Configuración Nginx
```

## 🔐 Autenticación

El sistema tiene dos tipos de usuarios:

- **Socios**: Login en `/login` con número de socio y contraseña
- **Administradores**: Login en `/admin/login` con usuario y contraseña

## 🌐 Variables de Entorno

### Desarrollo
No se requieren variables de entorno. El proxy de Vite redirige automáticamente a `http://localhost:5055` (puerto configurable en vite.config.js)

### Producción (Railway)
```bash
BACKEND_URL=https://tu-backend.up.railway.app
# Nota: Backend expone puerto 8080 internamente, Railway maneja el enrutamiento
```

## 🐳 Docker

```bash
# Build
docker build -t club-socios-frontend .

# Run
docker run -p 80:80 -e BACKEND_URL=https://backend.com club-socios-frontend
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview de la build

## 📄 Licencia

Proyecto privado y confidencial.

## 🆘 Soporte

Consulta la [documentación completa](docs/) para más información o contacta al equipo de desarrollo.
