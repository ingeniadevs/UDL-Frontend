# 🔄 Cambio de Arquitectura - Llamada Directa al Backend

## 📋 Resumen del Cambio

El frontend ahora llama **directamente** al backend sin usar nginx como proxy intermediario.

### ❌ Arquitectura Anterior

```
Usuario → Frontend (Nginx) → Nginx Proxy → Backend
                    ↓
          /api → proxy a backend
```

### ✅ Arquitectura Nueva

```
Usuario → Frontend (Nginx solo archivos estáticos)
         ↓
    JavaScript → Backend directamente
```

---

## 🔧 Cambios Técnicos Realizados

### 1. **nginx.conf** - Simplificado

**Antes**: Nginx hacía proxy de `/api` y `/uploads` al backend

**Ahora**: Nginx solo sirve archivos estáticos y maneja SPA routing

```nginx
# Solo sirve HTML, CSS, JS
# SPA routing para Vue Router
# Cache de assets estáticos
```

### 2. **Dockerfile** - Build Variables

**Añadido**:
```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

La URL del backend se "hornea" en el código durante el build.

### 3. **src/services/api.js** - BaseURL Dinámica

**Antes**:
```javascript
baseURL: '/api'  // Proxy relativo
```

**Ahora**:
```javascript
baseURL: import.meta.env.VITE_API_URL || '/api'
```

### 4. **docker-entrypoint.sh** - Eliminado

Ya no se necesita porque nginx no requiere configuración dinámica en runtime.

---

## ⚙️ Configuración en Railway

### Variables de Entorno

Railway tiene dos tipos de variables:

#### 🏗️ **Build Variables** (lo que necesitas)

Se usan durante el **build** de la aplicación:

```bash
# En Railway Dashboard → Service → Variables → Build Variables
VITE_API_URL=https://tu-backend.up.railway.app/api
```

⚠️ **IMPORTANTE**: 
- Debe incluir `/api` al final
- Debe ser una **Build Variable**, no una variable normal
- Se usa en tiempo de compilación

#### 🚀 **Environment Variables** (ya no necesario)

Variables en runtime (ya NO necesitas `BACKEND_URL`):

```bash
# ❌ Ya no necesario
# BACKEND_URL=https://...
```

### Configuración Paso a Paso

1. **Railway Dashboard** → Tu servicio frontend
2. **Variables** → Cambiar a **"Build Variables"** (pestaña superior)
3. **Add Variable**:
   ```
   Key: VITE_API_URL
   Value: https://tu-backend-production.up.railway.app/api
   ```
4. **Redeploy** el servicio

---

## 🔍 Desarrollo Local

### Opción 1: Usando Proxy de Vite (Recomendado)

Sin configurar nada, el proxy en `vite.config.js` redirige:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5055',
    changeOrigin: true
  }
}
```

**Uso**:
```bash
npm run dev
# Frontend: http://localhost:5001
# Backend debe estar en: http://localhost:5055
```

### Opción 2: Llamada Directa

Crear archivo `.env.local`:

```bash
VITE_API_URL=http://localhost:5055/api
```

**Uso**:
```bash
npm run dev
# El frontend llamará directamente a localhost:5055/api
```

---

## 🐳 Docker Local

### Build con Variable

```bash
docker build \
  --build-arg VITE_API_URL=https://tu-backend.com/api \
  -t club-socios-frontend .
```

### Run

```bash
docker run -p 80:80 club-socios-frontend
# Ya no necesita -e BACKEND_URL
```

### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      args:
        VITE_API_URL: http://backend:8080/api
    ports:
      - "80:80"
```

---

## ✅ Checklist de Migración

### En el Código

- [x] `nginx.conf` - Removidas secciones de proxy
- [x] `Dockerfile` - Agregado ARG VITE_API_URL
- [x] `docker-entrypoint.sh` - Ya no necesario (puede eliminarse)
- [x] `src/services/api.js` - Usa VITE_API_URL
- [x] `.env.example` - Actualizado con VITE_API_URL

### En Railway

- [ ] Ir a Variables → **Build Variables**
- [ ] Agregar `VITE_API_URL=https://tu-backend.../api`
- [ ] Eliminar `BACKEND_URL` (ya no necesaria)
- [ ] Redeploy del servicio
- [ ] Verificar que funcione

### CORS en Backend

- [ ] Configurar CORS para aceptar requests del frontend
- [ ] Debe incluir la URL del frontend de Railway

```javascript
// Ejemplo en Express
app.use(cors({
  origin: [
    'http://localhost:5001',
    'https://tu-frontend.up.railway.app'
  ],
  credentials: true
}))
```

---

## 🐛 Troubleshooting

### Error: "VITE_API_URL is not defined"

**Causa**: Variable no configurada como Build Variable

**Solución**:
1. Railway Dashboard → Variables
2. Cambiar a pestaña **"Build Variables"**
3. Agregar `VITE_API_URL`
4. Redeploy

### Error: CORS

**Causa**: Backend no acepta requests del frontend

**Solución**: Configurar CORS en backend con la URL del frontend

### Error: 404 en API calls

**Causa**: `VITE_API_URL` mal configurada

**Verificar**:
- ✅ Debe terminar en `/api`
- ✅ Debe ser HTTPS en producción
- ✅ Debe ser la URL pública del backend

```bash
# ✅ Correcto
VITE_API_URL=https://backend.up.railway.app/api

# ❌ Incorrecto
VITE_API_URL=https://backend.up.railway.app
VITE_API_URL=https://backend.up.railway.app/api/
```

---

## 📊 Comparación

| Aspecto | Antes (Proxy) | Ahora (Directo) |
|---------|---------------|-----------------|
| **Configuración** | Runtime (BACKEND_URL) | Build time (VITE_API_URL) |
| **Nginx** | Proxy complejo | Solo archivos estáticos |
| **Cambiar backend** | Redeploy rápido | Rebuild completo |
| **CORS** | No necesario | Debe configurarse |
| **Performance** | 1 hop extra | Directo al backend |
| **Complejidad** | Media | Simple |

---

## 🎯 Ventajas del Cambio

✅ **Nginx más simple** - Solo sirve archivos estáticos
✅ **Menos capas** - Llamada directa al backend
✅ **Más estándar** - Arquitectura típica de SPA
✅ **Mejor debugging** - URLs visibles en DevTools
✅ **CORS explícito** - Seguridad más clara

## ⚠️ Consideraciones

⚠️ **Cambiar backend requiere rebuild** - No solo redeploy
⚠️ **CORS necesario** - Debe configurarse en backend
⚠️ **URL visible** - La URL del backend es visible en el código compilado

---

## 📚 Archivos Afectados

```
✏️ Modificados:
├── nginx.conf          # Simplificado, sin proxy
├── Dockerfile          # ARG VITE_API_URL
├── src/services/api.js # baseURL dinámica
└── .env.example        # Documentación actualizada

❌ Removido:
└── docker-entrypoint.sh # Ya no necesario

📝 Documentación:
├── docs/README.md
├── docs/RAILWAY.md
├── docs/DEPLOYMENT.md
└── docs/ARCHITECTURE.md
```

---

## 🔄 Rollback (Si es necesario)

Si necesitas volver a la arquitectura anterior:

```bash
git revert HEAD
git push origin main
```

O restaura desde el commit anterior al cambio.

---

**Última actualización**: Marzo 2026

¿Dudas? Consulta la documentación actualizada o contacta al equipo de desarrollo.
