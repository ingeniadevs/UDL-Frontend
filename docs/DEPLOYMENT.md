# Guía de Despliegue - Paso a Paso

Esta guía te llevará paso a paso para desplegar el frontend en Railway.

## ✅ Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta activa en [Railway](https://railway.app)
- [ ] Backend ya desplegado en Railway
- [ ] Base de datos PostgreSQL configurada
- [ ] Repositorio de GitHub con el código del frontend
- [ ] Git configurado en tu máquina local

## 📋 Paso 1: Preparar el Repositorio

### 1.1 Verificar Archivos Necesarios

Asegúrate de que tu repositorio tenga estos archivos:

```
✓ Dockerfile
✓ nginx.conf
✓ docker-entrypoint.sh
✓ package.json
✓ .dockerignore
✓ railway.json (opcional pero recomendado)
```

### 1.2 Commit y Push

```bash
git add .
git commit -m "Preparar para deploy en Railway"
git push origin main
```

## 🚂 Paso 2: Configurar en Railway

### 2.1 Acceder a tu Proyecto

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Abre el proyecto donde ya tienes el backend y la base de datos

### 2.2 Agregar Nuevo Servicio

1. Click en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Autoriza Railway a acceder a tu cuenta de GitHub (si aún no lo hiciste)
4. Selecciona el repositorio del frontend: `club-socios-vue`
5. Railway comenzará a detectar la configuración

### 2.3 Verificar Configuración de Build

Railway debería detectar automáticamente:
- ✅ **Builder**: Dockerfile
- ✅ **Dockerfile Path**: `Dockerfile`

Si no lo detecta:
1. Ve a **Settings** → **Build**
2. Configura manualmente:
   - Builder: **Dockerfile**
   - Dockerfile Path: **Dockerfile**
   - Build Command: *(dejar vacío)*

## 🔧 Paso 3: Configurar Variables de Entorno

### 3.1 Obtener URL del Backend

1. En tu proyecto Railway, ve al servicio del **backend**
2. En la sección **Settings** → **Domains**
3. Copia la URL generada (ejemplo: `https://club-socios-backend-production.up.railway.app`)

### 3.2 Configurar Build Variable en Frontend

⚠️ **IMPORTANTE**: Debe ser una **Build Variable**, no una variable de entorno normal.

1. Ve al servicio del **frontend** en Railway
2. Click en la pestaña **"Variables"**
3. Cambia a **"Build Variables"** (pestaña superior)
4. Click en **"+ New Variable"**
5. Agrega:

```
Key: VITE_API_URL
Value: https://club-socios-backend-production.up.railway.app/api
```

**⚠️ PUNTOS CLAVE:**
- **Build Variable**, NO Environment Variable
- Debe incluir `/api` al final
- Usa la URL completa incluyendo `https://`
- NO incluyas puerto (Railway maneja el enrutamiento)
- Esta variable se usa durante el **build** de la aplicación
- Asegúrate de copiar la URL exacta del backend

## 🌐 Paso 4: Configurar Dominio

### 4.1 Generar Dominio de Railway

1. En el servicio frontend, ve a **Settings** → **Networking**
2. Click en **"Generate Domain"**
3. Railway generará una URL como: `club-socios-frontend.up.railway.app`
4. Guarda esta URL para configurar CORS en el backend

### 4.2 Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. En **Settings** → **Domains**, click en **"Custom Domain"**
2. Ingresa tu dominio (ej: `app.miclub.com`)
3. Railway te dará los registros DNS para configurar:
   ```
   Type: CNAME
   Name: app
   Value: club-socios-frontend.up.railway.app
   ```
4. Configura estos registros en tu proveedor de DNS
5. Espera la propagación DNS (puede tardar hasta 24 horas)

## 🔐 Paso 5: Configurar CORS en Backend

### 5.1 Actualizar Backend

El backend debe permitir requests desde el frontend. Agrega la URL del frontend a la configuración de CORS:

```javascript
// En tu backend (ejemplo con Express)
const allowedOrigins = [
  'http://localhost:5001',                           // Desarrollo
  'https://club-socios-frontend.up.railway.app',    // Railway
  'https://app.miclub.com'                           // Dominio personalizado (si lo tienes)
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
```

### 5.2 Redesplegar Backend

Después de actualizar el código:
```bash
git commit -am "Configurar CORS para frontend"
git push
```

Railway redesplegará automáticamente el backend.

## 🚀 Paso 6: Deploy

### 6.1 Deploy Automático

Railway iniciará el deploy automáticamente cuando:
- Hagas push al repositorio
- Cambies variables de entorno
- Hagas un redeploy manual

### 6.2 Monitorear el Deploy

1. En el servicio frontend, ve a la pestaña **"Deployments"**
2. Verás el deployment en progreso con estas fases:
   ```
   ⏳ Building... → 🔨 Pushing... → 🚀 Deploying... → ✅ Success
   ```
3. Click en el deployment para ver los logs en tiempo real

### 6.3 Revisar Logs

Durante el build verás:
```
Building Docker image...
[1/2] STAGE 1: Building Vue app
[2/2] STAGE 2: Setting up Nginx
Successfully built image
Deploying...
Container started
```

Una vez desplegado verás:
```
Configurando nginx con BACKEND_URL: https://...
Configuración de nginx completada
nginx started
```

## ✅ Paso 7: Verificación

### 7.1 Verificar que el Servicio Está Activo

1. Ve a **"Deployments"** y confirma que el último deployment tiene estado **"Success"**
2. Verifica que no haya errores en los logs

### 7.2 Probar la Aplicación

1. Abre la URL del frontend (la que generaste en el Paso 4)
2. Deberías ver la página de login

**Checklist de verificación:**

- [ ] ✅ La página carga correctamente
- [ ] ✅ Los estilos se ven bien (CSS cargado)
- [ ] ✅ No hay errores en la consola del navegador
- [ ] ✅ Puedes hacer login con credenciales válidas
- [ ] ✅ Después del login, te redirige al dashboard
- [ ] ✅ Las llamadas API funcionan (verifica en Network tab)
- [ ] ✅ Puedes navegar entre diferentes secciones
- [ ] ✅ Las imágenes se cargan correctamente

### 7.3 Verificar Comunicación con Backend

Abre las DevTools del navegador (F12) y ve a la pestaña **Network**:

1. Intenta hacer login
2. Deberías ver requests a `/api/auth/login`
3. El status debería ser **200 OK** (o el código apropiado)
4. Verifica que no haya errores de CORS

Si hay errores de CORS:
```
Access to fetch at 'https://backend...' from origin 'https://frontend...' 
has been blocked by CORS policy
```

→ Vuelve al Paso 5 y configura CORS correctamente.

## 🐛 Troubleshooting

### Problema: Build Falla

**Síntomas**: El deployment falla en la fase de build

**Solución**:
1. Revisa los logs de build en Railway
2. Verifica que `Dockerfile` esté en la raíz del repo
3. Prueba el build localmente:
   ```bash
   docker build -t test .
   ```

### Problema: Container se Reinicia Constantemente

**Síntomas**: El deployment tiene estado "Success" pero luego se reinicia

**Solución**:
1. Revisa los logs del container
2. Verifica que `BACKEND_URL` esté configurado correctamente
3. Asegúrate de que el script `docker-entrypoint.sh` tenga permisos de ejecución

### Problema: Cannot Connect to Backend

**Síntomas**: La app carga pero no puede comunicarse con el backend

**Solución**:
1. Verifica que `BACKEND_URL` sea correcta:
   ```
   ✓ https://backend-production.up.railway.app
   ✗ http://backend-production.up.railway.app (sin https)
   ✗ https://backend-production.up.railway.app/ (con slash final)
   ```
2. Confirma que el backend esté activo
3. Verifica CORS en el backend
4. Revisa los logs de nginx:
   ```bash
   # En Railway, ve a los logs del frontend y busca:
   proxy_pass ${BACKEND_URL}/api/
   ```

### Problema: 404 en Rutas

**Síntomas**: La ruta raíz funciona pero otras rutas dan 404

**Solución**:
1. Verifica que `nginx.conf` tenga:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
2. Redeploy el servicio

### Problema: Environment Variable No Se Aplica

**Síntomas**: Cambias `BACKEND_URL` pero no se refleja

**Solución**:
1. Después de cambiar variables, Railway redespliega automáticamente
2. Si no, haz un redeploy manual: **Deployments** → **Redeploy**
3. Espera a que complete el deployment
4. Verifica en los logs que muestre la nueva URL

## 📊 Paso 8: Monitoreo Post-Deploy

### 8.1 Métricas

Railway proporciona métricas básicas:

1. Ve a la pestaña **"Metrics"** en el servicio frontend
2. Monitorea:
   - **CPU Usage**: Debería estar < 50% en promedio
   - **Memory**: Nginx usa ~50-100MB típicamente
   - **Network**: Picos durante requests

### 8.2 Logs

Mantén los logs abiertos inicialmente:

1. Pestaña **"Logs"** en Railway
2. Filtra por tipo:
   - **Build**: Logs de construcción
   - **Deploy**: Logs de deployment
   - **Application**: Logs de nginx

### 8.3 Alertas

Configura notificaciones en Railway:

1. Ve a **Settings** → **Notifications**
2. Activa notificaciones para:
   - Deployment failures
   - Service restarts
   - High resource usage

## 🔄 Paso 9: CI/CD Automático

### 9.1 Deploy Automático

Railway está configurado para deploy automático en cada push:

```bash
# En tu máquina local
git add .
git commit -m "Nueva funcionalidad"
git push origin main

# Railway detectará el push y redesplegará automáticamente
```

### 9.2 Deploy Manual

Si necesitas redeplegar sin cambios en el código:

1. Ve a **Deployments**
2. Click en los tres puntos del último deployment
3. Selecciona **"Redeploy"**

### 9.3 Rollback

Si un deployment tiene problemas:

1. Ve a **Deployments**
2. Encuentra un deployment anterior que funcionaba
3. Click en los tres puntos → **"Redeploy"**

## 💰 Paso 10: Optimización de Costos

### 10.1 Plan Gratuito

Railway ofrece $5 de crédito gratis/mes:

- Frontend típicamente usa ~$2-3/mes
- Monitorea el uso en **Settings** → **Usage**

### 10.2 Optimizaciones

Para reducir costos:

1. **Reduce réplicas** si es un proyecto pequeño:
   - Settings → Deploy → **Replicas**: 1

2. **Sleep Mode** (para proyectos de desarrollo):
   - Railway puede poner servicios a dormir después de inactividad

## ✅ Checklist Final

Antes de considerar el deployment completo:

- [ ] Frontend desplegado y accesible
- [ ] Backend desplegado y accesible  
- [ ] Variable `BACKEND_URL` configurada
- [ ] CORS configurado en backend
- [ ] Login funciona correctamente
- [ ] API calls funcionan
- [ ] Navegación entre rutas funciona
- [ ] Imágenes/uploads se cargan
- [ ] No hay errores en consola
- [ ] No hay errores en logs de Railway
- [ ] Dominio configurado (Railway o personalizado)
- [ ] Deploy automático configurado
- [ ] Métricas normales (CPU, RAM, Network)

## 🎉 ¡Deployment Completado!

Tu frontend ahora está desplegado y funcionando en Railway.

### Próximos Pasos

- Monitorea las métricas regularmente
- Configura backups si es necesario
- Considera un dominio personalizado
- Implementa SSL/TLS (Railway lo hace automáticamente)
- Configura Analytics (Google Analytics, etc.)

### URLs Importantes

Guarda estas URLs:

```
Frontend: https://tu-frontend.up.railway.app
Backend:  https://tu-backend.up.railway.app
Admin:    https://tu-frontend.up.railway.app/admin/login
```

---

¿Problemas? Consulta la sección de **Troubleshooting** arriba o contacta al equipo de desarrollo.
