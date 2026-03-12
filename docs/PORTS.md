# 🔌 Configuración de Puertos - Referencia Rápida

Esta guía proporciona una referencia rápida de todos los puertos utilizados en el proyecto.

## 📊 Resumen de Puertos

| Entorno | Componente | Puerto | Notas |
|---------|------------|--------|-------|
| **Desarrollo Local** | Frontend (Vite) | 5001 | Configurable en vite.config.js |
| **Desarrollo Local** | Backend | 5055 | Proxy configurado en vite.config.js |
| **Railway** | Frontend (Nginx) | 80 (interno) | Railway expone vía HTTPS automáticamente |
| **Railway** | Backend | 8080 (interno) | Railway expone vía HTTPS automáticamente |
| **Docker Local** | Frontend (Nginx) | 80 (interno) | Mapear con `-p 80:80` o `-p 3000:80` |
| **Docker Local** | Backend | 8080 (interno) | Usar en BACKEND_URL como `http://backend:8080` |

## 🏠 Desarrollo Local

### Frontend
```bash
# Vite dev server
npm run dev
# Escucha en: http://localhost:5001
```

### Backend
```bash
# Tu backend debe estar corriendo en:
http://localhost:5055
```

### Proxy de Vite
El archivo `vite.config.js` redirige automáticamente:
```javascript
server: {
  port: 5001,
  proxy: {
    '/api': {
      target: 'http://localhost:5055',  // ← Puerto del backend local
      changeOrigin: true
    },
    '/uploads': {
      target: 'http://localhost:5055',
      changeOrigin: true
    }
  }
}
```

## ☁️ Railway (Producción)

### Frontend
- **Puerto interno**: 80 (Nginx)
- **Acceso público**: Railway genera URL con HTTPS automático
  - Ejemplo: `https://club-socios-frontend.up.railway.app`
- **No necesitas** configurar puerto en variables de entorno

### Backend
- **Puerto interno**: 8080
- **Acceso público**: Railway genera URL con HTTPS automático
  - Ejemplo: `https://club-socios-backend.up.railway.app`
- **Variable en frontend**: `BACKEND_URL=https://club-socios-backend.up.railway.app`
  - ⚠️ **NO incluir** el puerto 8080 en la URL
  - ⚠️ **Railway maneja** el enrutamiento automáticamente

### ¿Por qué no incluir el puerto?

Railway usa un reverse proxy que:
1. Recibe requests HTTPS en puerto 443 (estándar)
2. Las redirige al contenedor en el puerto interno (8080)
3. Retorna la respuesta vía HTTPS

**Incorrecto** ❌:
```bash
BACKEND_URL=https://backend.up.railway.app:8080  # NO hacer esto
BACKEND_URL=http://backend.up.railway.app         # NO usar HTTP
```

**Correcto** ✅:
```bash
BACKEND_URL=https://backend.up.railway.app
```

## 🐳 Docker Local

### Con docker-compose

```yaml
version: '3.8'
services:
  backend:
    image: club-socios-backend
    ports:
      - "8080:8080"  # Expone puerto 8080
    environment:
      - PORT=8080
  
  frontend:
    image: club-socios-frontend
    ports:
      - "80:80"      # Expone puerto 80 de nginx
    environment:
      - BACKEND_URL=http://backend:8080  # Referencia interna
    depends_on:
      - backend
```

### Con docker run

```bash
# Backend
docker run -d --name backend -p 8080:8080 club-socios-backend

# Frontend
docker run -d --name frontend -p 80:80 \
  -e BACKEND_URL=http://backend:8080 \
  --link backend:backend \
  club-socios-frontend
```

## 🔍 Verificación de Configuración

### Desarrollo Local

```bash
# 1. Backend corriendo
curl http://localhost:5055/api/health
# Debería responder

# 2. Frontend corriendo
# Abrir http://localhost:5001
# Verificar en DevTools que las requests a /api funcionan
```

### Railway

```bash
# 1. Backend
curl https://tu-backend.up.railway.app/api/health
# Debería responder con 200 OK

# 2. Frontend
# Abrir https://tu-frontend.up.railway.app
# Verificar en DevTools:
#   - Network tab: requests a /api
#   - No debe haber errores de CORS
#   - Status 200 OK
```

## 🐛 Troubleshooting de Puertos

### Error: "Cannot connect to backend"

**Development:**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:5055/api/health

# Verificar proxy en vite.config.js
# Debe apuntar a localhost:5055
```

**Railway:**
```bash
# Verificar variable BACKEND_URL
echo $BACKEND_URL
# Debe ser: https://backend.up.railway.app
# NO debe incluir :8080
```

### Error: "ECONNREFUSED" en desarrollo

```bash
# El backend no está corriendo en el puerto esperado
# Solución:
1. Inicia el backend en puerto 5055
2. O cambia vite.config.js para apuntar al puerto correcto
```

### Error: "502 Bad Gateway" en Railway

```bash
# Posibles causas:
1. BACKEND_URL mal configurada
2. Backend no está corriendo
3. Backend no escucha en puerto 8080

# Verificar logs del backend en Railway:
# Debe mostrar: "Server listening on port 8080"
```

### Error: Puerto 80 ya en uso (Docker local)

```bash
# Mapear a otro puerto
docker run -p 3000:80 -e BACKEND_URL=http://backend:8080 frontend

# Acceder en: http://localhost:3000
```

## 📝 Cambiar Puertos

### Cambiar puerto de desarrollo del frontend

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3000,  // Cambiar de 5001 a 3000
    proxy: {
      // ... resto de la configuración
    }
  }
})
```

### Cambiar puerto de backend local en desarrollo

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 5001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Si tu backend corre en 3000
        changeOrigin: true
      }
    }
  }
})
```

### Cambiar puerto interno de Docker

**Frontend (Nginx):**
```nginx
# nginx.conf
server {
    listen 8081;  # Cambiar de 80 a 8081
    # ... resto de la configuración
}
```

```bash
# Ejecutar con:
docker run -p 80:8081 frontend
```

**Backend:**
- El puerto lo define tu aplicación backend
- En Railway, debe ser 8080 para mantener consistencia

## 🔐 Mejores Prácticas

1. **Desarrollo Local**
   - ✅ Usa puertos > 1024 para no requerir permisos de admin
   - ✅ Documenta los puertos en el README
   - ✅ Usa variables de entorno cuando sea posible

2. **Railway**
   - ✅ Usa URLs completas con HTTPS
   - ✅ NO incluyas puertos en las URLs públicas
   - ✅ Deja que Railway maneje el enrutamiento
   - ✅ Verifica la configuración en los logs

3. **Docker**
   - ✅ Expón puertos explícitamente en Dockerfile
   - ✅ Documenta qué puerto usa cada servicio
   - ✅ Usa docker-compose para orquestar múltiples servicios

4. **Seguridad**
   - ✅ En producción, todo debe ser HTTPS
   - ✅ No expongas puertos innecesarios
   - ✅ Usa firewalls en servidores propios

## 📚 Referencias

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Configuración de desarrollo local
- **[RAILWAY.md](RAILWAY.md)** - Deployment en Railway
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura del sistema
- **[vite.config.js](../vite.config.js)** - Configuración de Vite y proxy

---

**Última actualización**: Marzo 2026

¿Tienes dudas sobre puertos? Consulta la documentación principal o contacta al equipo de desarrollo.
