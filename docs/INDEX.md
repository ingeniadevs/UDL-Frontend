# 📚 Índice de Documentación

Bienvenido a la documentación del Club Socios Frontend. Esta guía te ayudará a navegar por toda la documentación disponible.

## ⚠️ Importante - Nueva Arquitectura v2.0

El frontend ahora llama **directamente** al backend sin proxy de nginx. 

**📖 Lee primero**: [Cambio de Arquitectura](ARCHITECTURE_CHANGE.md) | [Referencia Rápida](QUICK_REFERENCE.md)

---

## 🚀 Para Empezar

Si es tu primera vez con el proyecto, comienza aquí:

1. **[README Principal](README.md)** - Descripción general y características del proyecto
2. **[Referencia Rápida](QUICK_REFERENCE.md)** - ⭐ Configuración rápida v2.0
3. **[Guía de Desarrollo](DEVELOPMENT.md)** - Setup local y primeros pasos

## 📖 Documentación por Categoría

### ⚠️ Arquitectura v2.0 (Nuevo)

- **[Cambio de Arquitectura](ARCHITECTURE_CHANGE.md)** ⭐ **IMPORTANTE**
  - Explicación del cambio a llamada directa
  - Diferencias con v1.x
  - Guía de migración completa
  - Troubleshooting específico

- **[Referencia Rápida](QUICK_REFERENCE.md)**
  - Configuración en Railway
  - Checklist de verificación
  - Solución rápida de problemas
  - Comandos útiles

### 🏗️ Arquitectura y Estructura

- **[Arquitectura](ARCHITECTURE.md)**
  - Visión general del sistema
  - Estructura de componentes
  - Flujo de datos
  - Patrones de diseño utilizados
  - Seguridad y performance

### 💻 Desarrollo

- **[Guía de Desarrollo](DEVELOPMENT.md)**
  - Setup inicial y prerrequisitos
  - Configuración del entorno
  - Creación de componentes
  - Trabajo con la API
  - Debugging y troubleshooting
  - Convenciones de código
  - Git workflow

### ☁️ Deployment

- **[Guía de Railway](RAILWAY.md)**
  - Configuración en Railway
  - Variables de entorno
  - Troubleshooting común
  - Monitoreo y logs
  - Costos y optimización

- **[Guía de Deployment Paso a Paso](DEPLOYMENT.md)**
  - Checklist completo
  - Proceso detallado paso a paso
  - Verificación post-deployment
  - Solución de problemas comunes
  - CI/CD automático

### 🔌 API

- **[Referencia de API](API.md)**
  - Endpoints completos
  - Autenticación
  - Formatos de request/response
  - Códigos de error
  - Ejemplos de uso

- **[Configuración de Puertos](PORTS.md)**
  - Puertos en desarrollo local
  - Puertos en Railway
  - Configuración de Docker
  - Troubleshooting de conexiones
  - Mejores prácticas

## 🎯 Guías Rápidas

### Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor (asegúrate que el backend esté en localhost:5055)
npm run dev

# 3. Abrir navegador
http://localhost:5001
```

### Deploy en Railway

```bash
# 1. Push a GitHub
git push origin main

# 2. En Railway: Conectar repo → Configurar BACKEND_URL → Deploy automático
```

### Crear un Nuevo Componente

```vue
<!-- src/components/MiComponente.vue -->
<template>
  <div>{{ mensaje }}</div>
</template>

<script setup>
import { ref } from 'vue'
const mensaje = ref('Hola Mundo')
</script>
```

### Agregar una Nueva Ruta

```javascript
// src/router/index.js
{
  path: '/nueva-ruta',
  component: () => import('@/views/NuevaVista.vue'),
  meta: { requiresAuth: true, role: 'admin' }
}
```

## 📋 Checklists

### Antes de Hacer Push

- [ ] El código funciona localmente
- [ ] No hay errores en consola
- [ ] Las llamadas API funcionan
- [ ] Los estilos se ven correctos
- [ ] Commit message es descriptivo

### Antes de Deploy a Producción

- [ ] Tests pasan (cuando estén implementados)
- [ ] Build local exitoso (`npm run build`)
- [ ] Revisión de código completada
- [ ] Documentación actualizada
- [ ] CHANGELOG actualizado

### Post-Deploy

- [ ] Aplicación carga correctamente
- [ ] Login funciona
- [ ] API calls funcionan
- [ ] No hay errores en logs
- [ ] Métricas normales

## 🔍 Buscar Información

### ¿Cómo hacer...?

| Necesito... | Ver documento |
|------------|---------------|
| **Configurar Railway con nueva arquitectura** | **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** ⭐ |
| **Entender el cambio de arquitectura** | **[ARCHITECTURE_CHANGE.md](ARCHITECTURE_CHANGE.md)** |
| Configurar el proyecto localmente | [DEVELOPMENT.md](DEVELOPMENT.md#setup-inicial) |
| Desplegar en Railway | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Ver endpoints disponibles | [API.md](API.md) |
| Entender la arquitectura | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Configuración de puertos | [PORTS.md](PORTS.md) |
| Crear componentes | [DEVELOPMENT.md](DEVELOPMENT.md#creando-componentes) |
| Trabajar con rutas | [DEVELOPMENT.md](DEVELOPMENT.md#rutas-y-navegación) |
| Usar Pinia stores | [DEVELOPMENT.md](DEVELOPMENT.md#state-management-con-pinia) |
| Configurar variables de entorno | [QUICK_REFERENCE.md](QUICK_REFERENCE.md) |
| Solucionar problemas comunes | [ARCHITECTURE_CHANGE.md](ARCHITECTURE_CHANGE.md#troubleshooting) |
| Ver cambios del proyecto | [CHANGELOG.md](../CHANGELOG.md) |

### Por Tecnología

| Tecnología | Documento |
|-----------|-----------|
| Vue 3 | [DEVELOPMENT.md](DEVELOPMENT.md) |
| Vite | [DEVELOPMENT.md](DEVELOPMENT.md) |
| Vue Router | [DEVELOPMENT.md](DEVELOPMENT.md#rutas-y-navegación) |
| Pinia | [DEVELOPMENT.md](DEVELOPMENT.md#state-management-con-pinia) |
| PrimeVue | [DEVELOPMENT.md](DEVELOPMENT.md#componentes-primevue) |
| Axios | [DEVELOPMENT.md](DEVELOPMENT.md#trabajando-con-la-api) |
| Nginx | [ARCHITECTURE.md](ARCHITECTURE.md#configuración-de-nginx) |
| Docker | [RAILWAY.md](RAILWAY.md#configuración-del-servicio) |
| Railway | [RAILWAY.md](RAILWAY.md), [DEPLOYMENT.md](DEPLOYMENT.md) |

## 🆘 Soporte y Ayuda

### Problemas Comunes

1. **El servidor no inicia**
   - Ver [DEVELOPMENT.md - Troubleshooting](DEVELOPMENT.md#troubleshooting-común)

2. **Error al hacer build**
   - Ver [RAILWAY.md - Troubleshooting](RAILWAY.md#error-build-failed)

3. **No se conecta al backend**
   - Ver [RAILWAY.md - Cannot connect to backend](RAILWAY.md#error-cannot-connect-to-backend)

4. **Errores de CORS**
   - Ver [DEPLOYMENT.md - Configurar CORS](DEPLOYMENT.md#51-actualizar-backend)

5. **404 en rutas**
   - Ver [RAILWAY.md - Rutas no funcionan](RAILWAY.md#la-aplicación-carga-pero-las-rutas-no-funcionan)

### Recursos Externos

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [Vue Router Docs](https://router.vuejs.org/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [PrimeVue Docs](https://primevue.org/)
- [Railway Docs](https://docs.railway.app/)

### Contacto

Para soporte adicional, contacta al equipo de desarrollo.

## 📝 Contribuir a la Documentación

Si encuentras algo que falta o que podría mejorar:

1. Identifica qué documento necesita actualización
2. Haz los cambios necesarios
3. Actualiza este índice si agregaste nueva documentación
4. Commit con mensaje descriptivo: `docs: actualizar guía de deployment`
5. Crea PR para revisión

## 🗂️ Estructura de Archivos de Documentación

```
docs/
├── INDEX.md                # Este archivo - índice de toda la documentación
├── QUICK_REFERENCE.md      # ⭐ Referencia rápida v2.0
├── ARCHITECTURE_CHANGE.md  # ⭐ Explicación del cambio de arquitectura
├── README.md               # Descripción general del proyecto
├── QUICKSTART.md           # Guía rápida de deployment en Railway
├── ARCHITECTURE.md         # Arquitectura y diseño del sistema
├── DEVELOPMENT.md          # Guía de desarrollo local
├── RAILWAY.md              # Guía de Railway (referencia técnica)
├── DEPLOYMENT.md           # Guía paso a paso de deployment
├── API.md                  # Referencia de API del backend
└── PORTS.md                # Configuración de puertos (desarrollo y producción)
```

## 🔄 Mantenimiento de la Documentación

Esta documentación debe actualizarse cuando:

- Se agregan nuevas features
- Se cambia la arquitectura
- Se modifican configuraciones
- Se descubren soluciones a problemas comunes
- Se actualizan dependencias importantes

## 🔌 Referencia Técnica - Configuración v2.0

### Variables de Entorno

**v2.0 - Llamada Directa**:
- **Variable**: `VITE_API_URL` (Build Variable)
- **Valor**: `https://backend.../api` (incluir `/api`)
- **Cuándo**: Build time (se "hornea" en el código)
- **Dónde**: Railway → Variables → **Build Variables**

**v1.x - Proxy** (deprecated):
- ~~`BACKEND_URL`~~ (ya no se usa)

### Desarrollo Local
- **Frontend**: Puerto 5001 (Vite dev server)
- **Backend**: Puerto 5055 (configurable en vite.config.js)
- **Proxy**: Vite redirige `/api` al backend (o usa `VITE_API_URL` directamente)

### Producción (Railway)
- **Frontend**: Puerto 80 interno (Nginx) → Railway lo expone vía HTTPS
- **Backend**: Puerto 8080 interno → Railway lo expone vía HTTPS
- **Configuración**: `VITE_API_URL` en Build Variables
- **Llamada**: JavaScript → Backend directamente (sin proxy de nginx)

### CORS Requerido
```javascript
// Backend debe configurar CORS
cors({
  origin: 'https://tu-frontend.up.railway.app',
  credentials: true
})
```

Última actualización: Marzo 2026 - **Arquitectura v2.0**
