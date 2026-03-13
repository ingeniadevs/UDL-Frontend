# Club Socios - Frontend Vue.js

> **⚠️ Arquitectura v2.0** - El frontend ahora llama directamente al backend sin proxy de nginx.  
> **📖 Importante**: Lee [docs/ARCHITECTURE_CHANGE.md](docs/ARCHITECTURE_CHANGE.md) o [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)

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

### Deploy en Railway (v2.0)

**Build Variable** (IMPORTANTE: debe ser Build Variable):
```bash
VITE_API_URL=https://tu-backend.up.railway.app/api
```

Railway detectará automáticamente el `Dockerfile` y desplegará la aplicación.

**📖 Guía completa**: [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)

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
No se requieren variables de entorno. El proxy de Vite redirige automáticamente a `http://localhost:5055`

O puedes crear `.env.local`:
```bash
VITE_API_URL=http://localhost:5055/api
```

### Producción (Railway)
**Build Variable** (importante: debe ser Build Variable, no Environment Variable):
```bash
VITE_API_URL=https://tu-backend.up.railway.app/api
# Nota: Debe incluir /api al final
```

## 🐳 Docker

```bash
# Build (pasar URL del backend)
docker build --build-arg VITE_API_URL=https://backend.com/api -t club-socios-frontend .

# Run
docker run -p 80:80 club-socios-frontend
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview de la build

## 📄 Licencia

Proyecto privado y confidencial.

## 🆘 Soporte

Consulta la [documentación completa](docs/) para más información o contacta al equipo de desarrollo.
