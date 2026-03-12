# Guía de Deployment en Railway

## 📋 Prerequisitos

1. Cuenta en [Railway](https://railway.app)
2. Backend ya desplegado en Railway
3. Base de datos PostgreSQL configurada en Railway
4. Repositorio de GitHub con el código del frontend

## 🚂 Configuración Inicial en Railway

### 1. Crear Nuevo Servicio

1. Accede a tu proyecto en Railway (donde ya tienes el backend y la base de datos)
2. Click en **"+ New"** → **"GitHub Repo"**
3. Selecciona el repositorio del frontend
4. Railway detectará automáticamente el `Dockerfile`

### 2. Configurar Variables de Entorno

En el dashboard de Railway, ve a la pestaña **Variables** del servicio frontend y añade:

```bash
BACKEND_URL=https://tu-backend-production.up.railway.app
```

**⚠️ Importante**: 
- No incluyas el slash final en la URL
- Usa la URL pública generada por Railway para tu servicio backend (Puerto interno: 8080)
- Railway maneja automáticamente el enrutamiento HTTPS
- Puedes encontrar esta URL en el dashboard del servicio backend

### 3. Configurar el Puerto

Railway asignará automáticamente un puerto público. El contenedor escucha en el puerto 80 internamente.

No necesitas configurar variables de puerto adicionales.

### 4. Configurar Dominio (Opcional)

1. Ve a **Settings** → **Domains**
2. Click en **"Generate Domain"** para obtener una URL de Railway
3. O configura un dominio personalizado

## 🔧 Configuración del Servicio

### Settings Recomendados

**Build Settings:**
- ✅ Use Dockerfile: Habilitado automáticamente
- ✅ Root Directory: `/` (raíz del proyecto)

**Deploy Settings:**
- ✅ Auto Deploy: Habilitado (deploy automático en cada push)
- ✅ Build Watch Paths: `**` (todos los archivos)

**Health Check:**
- Path: `/` 
- Port: 80 (puerto del frontend)

**Nota sobre Puertos:**
- Frontend expone puerto 80 (nginx)
- Backend expone puerto 8080 (configuración interna)
- Railway maneja el enrutamiento HTTPS automáticamente
- En `BACKEND_URL` usa la URL completa (https://...), no incluyas el puerto

## 🔗 Conectar Frontend y Backend

### En el Backend

Si tu backend necesita configurar CORS, asegúrate de incluir la URL del frontend:

```javascript
// Ejemplo en Express
app.use(cors({
  origin: [
    'http://localhost:5001',
    'https://tu-frontend.up.railway.app',
    // Agrega tu dominio personalizado si lo tienes
  ],
  credentials: true
}));
```

### Verificar la Conexión

Configura la variable `BACKEND_URL` en el frontend con la URL del backend:

```
BACKEND_URL=https://club-socios-backend-production.up.railway.app
```

## 📦 Proceso de Deploy

### Deploy Automático

1. Haz push a la rama configurada (generalmente `main` o `master`)
2. Railway detectará el cambio
3. Iniciará el build usando el Dockerfile
4. Deploy automático al completar el build

### Deploy Manual

1. En el dashboard de Railway
2. Click en **"Deploy"** → **"Redeploy"**

## 🔍 Verificación del Deploy

### 1. Revisar Logs

En Railway, ve a **"Logs"** para ver:
- Build logs
- Container logs
- Nginx logs

### 2. Verificar que Nginx está Corriendo

En los logs deberías ver:
```
Configurando nginx con BACKEND_URL: https://...
Configuración de nginx completada
```

### 3. Probar la Aplicación

1. Abre la URL generada por Railway
2. Verifica que carga la interfaz
3. Intenta hacer login
4. Verifica que las llamadas API funcionan

## 🐛 Troubleshooting

### Error: Cannot connect to backend

**Síntomas**: La aplicación carga pero no puede comunicarse con el backend

**Soluciones**:
1. Verifica que `BACKEND_URL` esté configurada correctamente
2. Confirma que el backend está corriendo en Railway
3. Verifica los logs de nginx para ver la URL configurada
4. Asegúrate de que el backend tenga CORS configurado

### Error: 502 Bad Gateway

**Síntomas**: Nginx no puede conectarse al backend

**Soluciones**:
1. Verifica que la URL del backend sea correcta y accesible
2. Confirma que el backend está en el mismo proyecto de Railway
3. Revisa los logs del backend

### Error: Build Failed

**Síntomas**: El build falla en Railway

**Soluciones**:
1. Verifica que el `Dockerfile` esté en la raíz del proyecto
2. Revisa los logs de build para errores específicos
3. Prueba el build localmente: `docker build -t test .`

### La aplicación carga pero las rutas no funcionan

**Síntomas**: Solo funciona la ruta raíz, otras rutas dan 404

**Soluciones**:
1. Verifica que `nginx.conf` tenga la configuración SPA:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
2. Confirma que Nginx esté usando el archivo de configuración correcto

## 📊 Monitoreo

### Métricas en Railway

Railway proporciona métricas básicas:
- **CPU Usage**: Uso de CPU
- **Memory**: Uso de memoria  
- **Network**: Tráfico de red

### Logs

Tipos de logs disponibles:
- **Build Logs**: Durante el proceso de construcción
- **Deploy Logs**: Al desplegar el contenedor
- **Application Logs**: Logs de Nginx y la aplicación

## 🔄 Actualizaciones

### Actualizar Variables de Entorno

1. Ve a **Variables** en el dashboard
2. Modifica o añade variables
3. Railway redesplegará automáticamente

### Rollback

1. Ve a **Deployments** en el dashboard
2. Encuentra el deployment anterior que funcionaba
3. Click en **"Redeploy"**

## 💰 Costos

Railway ofrece:
- **Plan Gratuito**: $5 de crédito/mes
- **Plan Developer**: $20/mes

Este frontend típicamente consume:
- ~0.1 vCPU
- ~256MB RAM
- Muy poco tráfico de red (principalmente archivos estáticos)

## 🔐 Seguridad

### Variables de Entorno

- ✅ Nunca commitees archivos `.env` al repositorio
- ✅ Usa solo las variables necesarias
- ✅ Las variables en Railway son privadas y encriptadas

### Headers de Seguridad

El `nginx.conf` ya incluye configuraciones de seguridad básicas. Para mejorar:

```nginx
# Agregar a nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## ✅ Checklist Completo de Deploy

- [ ] Backend desplegado y funcionando en Railway
- [ ] Base de datos configurada y conectada al backend
- [ ] Variable `BACKEND_URL` configurada en el frontend
- [ ] CORS configurado en el backend incluyendo la URL del frontend
- [ ] Dominio generado o personalizado configurado
- [ ] Deploy exitoso sin errores en los logs
- [ ] Aplicación accesible desde la URL pública
- [ ] Login funciona correctamente
- [ ] Llamadas API funcionan
- [ ] Imágenes/uploads se cargan correctamente
- [ ] Rutas de navegación funcionan (SPA routing)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa esta guía completa
2. Consulta los logs en Railway
3. Verifica la configuración de variables
4. Contacta al equipo de desarrollo
