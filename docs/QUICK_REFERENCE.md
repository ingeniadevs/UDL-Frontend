# 🚀 Guía Rápida - Nueva Arquitectura

## ⚡ Configuración en Railway (v2.0+)

### 1️⃣ Build Variables (IMPORTANTE)

```
Railway Dashboard → Frontend Service → Variables → Build Variables
```

**Agregar**:
```bash
VITE_API_URL=https://tu-backend-production.up.railway.app/api
```

### 2️⃣ CORS en Backend

El backend debe aceptar requests desde el frontend:

```javascript
// Express
app.use(cors({
  origin: [
    'http://localhost:5001',
    'https://tu-frontend.up.railway.app'
  ],
  credentials: true
}))
```

### 3️⃣ Push y Deploy

```bash
git push origin main
# Railway rebuildeará automáticamente
```

---

## 📋 Checklist Rápido

### Railway Dashboard

- [ ] Variables → **Build Variables** (no Environment)
- [ ] `VITE_API_URL` configurada con `/api` al final
- [ ] Build Variable ✅ (tiene símbolo de martillo 🔨)
- [ ] Redeploy iniciado

### Backend

- [ ] CORS configurado con URL del frontend
- [ ] Backend accesible desde frontend
- [ ] Endpoints responden correctamente

### Verificación

- [ ] Frontend carga sin errores
- [ ] Login funciona
- [ ] DevTools → Network muestra llamadas al backend
- [ ] No hay errores de CORS

---

## 🔍 Verificación Rápida

### 1. En Railway Logs

```bash
# Durante el build deberías ver:
✓ VITE_API_URL is set
✓ building for production...
✓ built in XXXms
```

### 2. En el Navegador

```javascript
// DevTools → Console
console.log(import.meta.env.VITE_API_URL)
// undefined (en producción, compilado en el código)

// DevTools → Network
// Verifica que las requests vayan a:
// https://tu-backend.up.railway.app/api/...
```

### 3. Test de API

```bash
# Prueba el backend directamente
curl https://tu-backend.up.railway.app/api/health

# Si responde, el backend está ok
# Si falla el frontend, es problema de CORS
```

---

## 🐛 Solución Rápida de Problemas

### ❌ "Cannot read VITE_API_URL"

**Fix**: Asegúrate de que sea **Build Variable**, no Environment Variable

```
Variables → Build Variables → VITE_API_URL
```

### ❌ Error de CORS

**Fix**: Configura CORS en backend

```javascript
cors({
  origin: 'https://tu-frontend.up.railway.app'
})
```

### ❌ 404 en API calls

**Fix**: Verifica que `VITE_API_URL` incluya `/api`

```bash
# ✅ Correcto
VITE_API_URL=https://backend.com/api

# ❌ Incorrecto  
VITE_API_URL=https://backend.com
```

### ❌ Variable no se aplica

**Fix**: Railway no detecta cambios en variables, debes hacer **Redeploy manual**

```
Deployments → ⋯ → Redeploy
```

---

## 💡 Diferencias Clave vs v1.x

| Aspecto | v1.x (Proxy) | v2.0 (Directo) |
|---------|--------------|----------------|
| **Variable** | `BACKEND_URL` | `VITE_API_URL` |
| **Tipo** | Environment | **Build Variable** |
| **Cuándo** | Runtime | **Build time** |
| **Nginx** | Hace proxy | Solo archivos |
| **CORS** | No necesario | **Debe configurarse** |
| **Cambiar backend** | Redeploy | **Rebuild** |

---

## 📝 Comandos Útiles

### Desarrollo Local

```bash
# Opción 1: Proxy de Vite (sin config)
npm run dev

# Opción 2: Llamada directa
echo "VITE_API_URL=http://localhost:5055/api" > .env.local
npm run dev
```

### Docker Local

```bash
# Build
docker build --build-arg VITE_API_URL=https://backend.com/api -t frontend .

# Run
docker run -p 80:80 frontend
```

### Verificar Build

```bash
npm run build
# Debería completarse sin errores
# El código compilado tendrá la URL "horneada"
```

---

## 🔗 URLs de Referencia

```bash
# Frontend Railway
https://tu-frontend-production.up.railway.app

# Backend Railway
https://tu-backend-production.up.railway.app

# Build Variable debe apuntar a:
https://tu-backend-production.up.railway.app/api
                                          ^^^^
                                    Incluir /api
```

---

## 📚 Más Información

- **[Cambio de Arquitectura](ARCHITECTURE_CHANGE.md)** - Explicación completa del cambio
- **[Deployment](DEPLOYMENT.md)** - Guía paso a paso
- **[Railway](RAILWAY.md)** - Configuración detallada

---

**Versión**: 2.0.0  
**Última actualización**: Marzo 2026

**¿Problemas?** Consulta [ARCHITECTURE_CHANGE.md](ARCHITECTURE_CHANGE.md)
