# Referencia de API

## 🔗 Base URL

- **Desarrollo**: `http://localhost:5055/api`
- **Producción**: `https://tu-backend.up.railway.app/api`

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login y debe incluirse en todas las requests subsecuentes.

---

## 📋 Endpoints

### 🔑 Autenticación

#### Login de Socio

```http
POST /api/auth/login
```

**Body:**
```json
{
  "numero_socio": "12345",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "numero_socio": "12345",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "rol": "socio"
    }
  }
}
```

#### Login de Administrador

```http
POST /api/auth/admin/login
```

**Body:**
```json
{
  "username": "admin",
  "password": "adminpass"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "rol": "admin"
    }
  }
}
```

#### Obtener Usuario Actual

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero_socio": "12345",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "rol": "socio"
  }
}
```

---

### 👥 Socios

#### Listar Socios

```http
GET /api/socios
Authorization: Bearer <token>
```

**Query Parameters:**
- `estado` (opcional): `activo` | `inactivo` | `suspendido`
- `search` (opcional): Búsqueda por nombre, apellido o email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero_socio": "12345",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "telefono": "1234567890",
      "direccion": "Calle 123",
      "fecha_nacimiento": "1990-01-01",
      "fecha_alta": "2024-01-01",
      "estado": "activo",
      "foto_url": "/uploads/socios/foto.jpg"
    }
  ]
}
```

#### Obtener Socio

```http
GET /api/socios/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero_socio": "12345",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "telefono": "1234567890",
    "direccion": "Calle 123",
    "fecha_nacimiento": "1990-01-01",
    "fecha_alta": "2024-01-01",
    "estado": "activo",
    "foto_url": "/uploads/socios/foto.jpg"
  }
}
```

#### Crear Socio

```http
POST /api/socios
Authorization: Bearer <token>
```

**Body:**
```json
{
  "numero_socio": "12346",
  "nombre": "María",
  "apellido": "González",
  "email": "maria@example.com",
  "password": "password123",
  "telefono": "0987654321",
  "direccion": "Avenida 456",
  "fecha_nacimiento": "1995-05-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "numero_socio": "12346",
    "nombre": "María",
    "apellido": "González",
    "email": "maria@example.com"
  },
  "message": "Socio creado exitosamente"
}
```

#### Actualizar Socio

```http
PUT /api/socios/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "telefono": "1111111111",
  "direccion": "Nueva Dirección 789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "telefono": "1111111111",
    "direccion": "Nueva Dirección 789"
  },
  "message": "Socio actualizado exitosamente"
}
```

#### Eliminar Socio

```http
DELETE /api/socios/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Socio eliminado exitosamente"
}
```

---

### 🏃 Disciplinas

#### Listar Disciplinas

```http
GET /api/disciplinas
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Fútbol",
      "descripcion": "Fútbol 11 profesional",
      "instructor": "Carlos López",
      "horarios": "Lunes y Miércoles 18:00-20:00",
      "cupo_maximo": 22,
      "estado": "activo"
    }
  ]
}
```

#### Crear Disciplina

```http
POST /api/disciplinas
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Tenis",
  "descripcion": "Clases de tenis para principiantes",
  "instructor": "Ana Martínez",
  "horarios": "Martes y Jueves 16:00-18:00",
  "cupo_maximo": 8
}
```

---

### 📅 Reservas

#### Listar Reservas

```http
GET /api/reservas
Authorization: Bearer <token>
```

**Query Parameters:**
- `socio_id` (opcional): Filtrar por socio
- `espacio_id` (opcional): Filtrar por espacio
- `fecha` (opcional): Filtrar por fecha (YYYY-MM-DD)
- `estado` (opcional): `pendiente` | `confirmada` | `cancelada`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "socio_id": 1,
      "espacio_id": 1,
      "fecha": "2024-02-01",
      "hora_inicio": "10:00",
      "hora_fin": "12:00",
      "estado": "confirmada",
      "socio": {
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "espacio": {
        "nombre": "Cancha de Fútbol 1"
      }
    }
  ]
}
```

#### Crear Reserva

```http
POST /api/reservas
Authorization: Bearer <token>
```

**Body:**
```json
{
  "espacio_id": 1,
  "fecha": "2024-02-15",
  "hora_inicio": "14:00",
  "hora_fin": "16:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "espacio_id": 1,
    "fecha": "2024-02-15",
    "hora_inicio": "14:00",
    "hora_fin": "16:00",
    "estado": "pendiente"
  },
  "message": "Reserva creada exitosamente"
}
```

#### Cancelar Reserva

```http
DELETE /api/reservas/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Reserva cancelada exitosamente"
}
```

---

### 🏢 Espacios

#### Listar Espacios

```http
GET /api/espacios
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Cancha de Fútbol 1",
      "tipo": "Fútbol",
      "capacidad": 22,
      "descripcion": "Cancha de césped sintético",
      "estado": "disponible",
      "precio_hora": 50.00
    }
  ]
}
```

#### Crear Espacio

```http
POST /api/espacios
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Cancha de Tenis 1",
  "tipo": "Tenis",
  "capacidad": 4,
  "descripcion": "Cancha de tenis con iluminación",
  "precio_hora": 30.00
}
```

---

### 👨‍💼 Empleados

#### Listar Empleados

```http
GET /api/empleados
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Carlos",
      "apellido": "López",
      "email": "carlos@club.com",
      "puesto": "Instructor",
      "telefono": "1234567890",
      "fecha_ingreso": "2023-01-15",
      "estado": "activo"
    }
  ]
}
```

---

### 🛒 Productos

#### Listar Productos

```http
GET /api/productos
Authorization: Bearer <token>
```

**Query Parameters:**
- `categoria` (opcional): Filtrar por categoría
- `disponible` (opcional): `true` | `false`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Camiseta Oficial",
      "descripcion": "Camiseta oficial del club",
      "precio": 45.00,
      "stock": 50,
      "categoria": "Indumentaria",
      "imagen_url": "/uploads/productos/camiseta.jpg",
      "disponible": true
    }
  ]
}
```

#### Crear Producto

```http
POST /api/productos
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
nombre: Camiseta Oficial
descripcion: Camiseta oficial del club
precio: 45.00
stock: 50
categoria: Indumentaria
imagen: [archivo]
```

---

### 📦 Pedidos

#### Listar Pedidos

```http
GET /api/pedidos
Authorization: Bearer <token>
```

**Query Parameters:**
- `socio_id` (opcional): Filtrar por socio
- `estado` (opcional): `pendiente` | `confirmado` | `enviado` | `entregado` | `cancelado`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "socio_id": 1,
      "fecha": "2024-01-15",
      "total": 90.00,
      "estado": "confirmado",
      "items": [
        {
          "producto_id": 1,
          "cantidad": 2,
          "precio_unitario": 45.00,
          "producto": {
            "nombre": "Camiseta Oficial"
          }
        }
      ]
    }
  ]
}
```

#### Crear Pedido

```http
POST /api/pedidos
Authorization: Bearer <token>
```

**Body:**
```json
{
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 3,
      "cantidad": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "total": 120.00,
    "estado": "pendiente"
  },
  "message": "Pedido creado exitosamente"
}
```

---

### 💰 Pagos

#### Listar Pagos

```http
GET /api/pagos
Authorization: Bearer <token>
```

**Query Parameters:**
- `socio_id` (opcional): Filtrar por socio
- `tipo` (opcional): `cuota` | `reserva` | `pedido`
- `estado` (opcional): `pendiente` | `pagado` | `vencido`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "socio_id": 1,
      "tipo": "cuota",
      "concepto": "Cuota Mensual Enero 2024",
      "monto": 100.00,
      "fecha_vencimiento": "2024-01-31",
      "fecha_pago": "2024-01-15",
      "estado": "pagado",
      "metodo_pago": "transferencia"
    }
  ]
}
```

#### Registrar Pago

```http
POST /api/pagos
Authorization: Bearer <token>
```

**Body:**
```json
{
  "socio_id": 1,
  "tipo": "cuota",
  "concepto": "Cuota Mensual Febrero 2024",
  "monto": 100.00,
  "fecha_vencimiento": "2024-02-29",
  "metodo_pago": "transferencia"
}
```

---

## 📤 Subida de Archivos

### Subir Imagen

```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
file: [archivo]
tipo: socios | productos | otros
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/socios/1234567890-foto.jpg",
    "filename": "1234567890-foto.jpg"
  }
}
```

**Acceso a archivos:**
- URL completa: `http://backend.com/uploads/socios/foto.jpg`
- El frontend usa el proxy: `/uploads/socios/foto.jpg`

---

## ❌ Manejo de Errores

Todos los endpoints pueden retornar estos códigos de error:

### 400 Bad Request

```json
{
  "success": false,
  "error": "Datos inválidos",
  "details": {
    "field": "email",
    "message": "Email inválido"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "No autorizado",
  "message": "Token inválido o expirado"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Acceso denegado",
  "message": "No tienes permisos para realizar esta acción"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "No encontrado",
  "message": "El recurso solicitado no existe"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Error del servidor",
  "message": "Ha ocurrido un error inesperado"
}
```

---

## 🔄 Paginación

Los endpoints que retornan listas pueden soportar paginación:

```http
GET /api/socios?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 🔍 Búsqueda y Filtros

Muchos endpoints soportan búsqueda:

```http
GET /api/socios?search=juan&estado=activo
GET /api/productos?categoria=Indumentaria&disponible=true
GET /api/reservas?fecha=2024-02-01&estado=confirmada
```

---

## 📊 Estadísticas (Dashboard)

### Dashboard Admin

```http
GET /api/dashboard/admin
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_socios": 150,
    "socios_activos": 140,
    "reservas_hoy": 12,
    "ingresos_mes": 15000.00,
    "pedidos_pendientes": 5
  }
}
```

### Dashboard Socio

```http
GET /api/dashboard/socio
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "proximas_reservas": [...],
    "pagos_pendientes": [...],
    "disciplinas_inscrito": [...],
    "pedidos_recientes": [...]
  }
}
```

---

## 🧪 Testing de API

### Usar con cURL

```bash
# Login
curl -X POST http://localhost:5055/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"numero_socio":"12345","password":"password123"}'

# Request con token
curl http://localhost:5055/api/socios \
  -H "Authorization: Bearer <token>"
```

### Usar con Postman

1. Crea una colección "Club Socios"
2. Agrega variable `{{baseUrl}}` = `http://localhost:5055/api`
3. Agrega variable `{{token}}` (se actualiza después del login)
4. Crea requests para cada endpoint

---

## 📝 Notas Importantes

1. **Todos los timestamps** están en formato ISO 8601
2. **Las fechas** están en formato `YYYY-MM-DD`
3. **Los montos** son números decimales con 2 decimales
4. **Los tokens JWT** expiran después de 24 horas
5. **Las imágenes** se suben al servidor y se retorna la URL relativa

---

## 🔐 Seguridad

- ✅ Todas las rutas protegidas requieren autenticación
- ✅ Los passwords nunca se retornan en las responses
- ✅ Los tokens incluyen información del usuario encriptada
- ✅ CORS está configurado para aceptar solo orígenes permitidos
- ✅ Rate limiting en endpoints sensibles
