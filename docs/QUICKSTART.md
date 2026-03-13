# ⚡ Configuración Rápida - Railway

Guía ultra-rápida para desarrolladores que ya conocen Railway y solo necesitan los pasos esenciales.

## 🎯 TL;DR

```bash
# 1. Build Variable en Railway (NO Environment Variable)
VITE_API_URL=https://tu-backend.up.railway.app/api

# 2. Push a GitHub
git push origin main

# ✅ Listo - Railway despliega automáticamente
```

## 📋 Checklist Mínimo

### Pre-requisitos
- [ ] Backend en Railway funcionando
- [ ] URL del backend copiada
- [ ] Repo en GitHub

### En Railway
- [ ] Nuevo servicio desde GitHub repo
- [ ] Variable `BACKEND_URL` configurada
- [ ] Generar dominio

### Verificación
- [ ] Deploy exitoso
- [ ] App carga
- [ ] Login funciona
- [ ] API calls funcionan

## 🔧 Configuración

### 1. Railway - Nuevo Servicio

```
+ New → GitHub Repo → Seleccionar repo → ✓
```

### 2. Variables de Entorno

```bash
VITE_API_URL=https://club-socios-backend-production.up.railway.app/api
```

**⚠️ IMPORTANTE:**
- Debe ser **Build Variable**, no Environment Variable
- Debe incluir `/api` al final
- Railway Dashboard → Variables → Cambiar a pestaña "Build Variables"

### 3. Dominio

```
Settings → Domains → Generate Domain
```

### 4. CORS en Backend

```javascript
const cors = require('cors')

app.use(cors({
  origin: [
    'http://localhost:5001',
    'https://tu-frontend.up.railway.app'
  ],
  credentials: true
}))
```

## 🚀 Deploy

### Automático
```bash
git push origin main
```

### Manual
```
Railway Dashboard → Deployments → Redeploy
```

## ✅ Verificación Rápida

```bash
# 1. Abrir URL del frontend
https://tu-frontend.up.railway.app

# 2. Abrir DevTools (F12) → Console
# No debe haber errores

# 3. Hacer login
# Debe funcionar

# 4. Network tab
# Requests a /api deben ser 200 OK
```

## 🐛 Troubleshooting Rápido

### Build falla
```bash
# Verificar Dockerfile en raíz
ls -la Dockerfile

# Test local
docker build -t test .
```

### No conecta a backend
```bash
# Verificar variable
echo $BACKEND_URL

# Debe ser: https://backend.up.railway.app
# NO: http://... ❌
# NO: https://.../  (con slash) ❌
```

### CORS errors
```javascript
// Backend debe incluir frontend URL en CORS
origin: ['https://tu-frontend.up.railway.app']
```

### 404 en rutas
```nginx
# nginx.conf debe tener:
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📊 Comandos Útiles

### Ver logs
```
Railway Dashboard → Logs
```

### Revisar variables
```
Railway Dashboard → Variables
```

### Métricas
```
Railway Dashboard → Metrics
```

### Redeploy
```
Deployments → ⋯ → Redeploy
```

## 🔗 URLs Importantes

```bash
# Frontend
https://club-socios-frontend.up.railway.app

# Backend (en variable BACKEND_URL)
https://club-socios-backend.up.railway.app

# Admin Login
https://club-socios-frontend.up.railway.app/admin/login
```

## 💡 Tips

1. **URL correcta**: Siempre HTTPS, sin slash final
2. **CORS**: Configurar en backend después de generar dominio
3. **Logs**: Verificar que muestre la BACKEND_URL correcta
4. **Cache**: Hard refresh (Ctrl+Shift+R) si algo no se ve actualizado
5. **Secrets**: Nunca commitear `.env` files

## 📱 Acceso Rápido

| Acción | Comando/URL |
|--------|-------------|
| Deploy | `git push` |
| Ver logs | Railway Dashboard → Logs |
| Redeploy | Deployments → Redeploy |
| Variables | Settings → Variables |
| Dominio | Settings → Domains |
| Métricas | Metrics tab |

## 🎓 Documentación Completa

Si necesitas más detalles:

- **[Guía Paso a Paso](DEPLOYMENT.md)** - Deploy completo con explicaciones
- **[Railway Docs](RAILWAY.md)** - Troubleshooting y optimización
- **[Development](DEVELOPMENT.md)** - Setup local
- **[API Reference](API.md)** - Endpoints del backend

---

**¿Todo funcionando?** ✅ 

Ahora puedes desarrollar localmente y hacer push para deploy automático.

**¿Problemas?** 🐛

Consulta [RAILWAY.md](RAILWAY.md#troubleshooting) para soluciones detalladas.
