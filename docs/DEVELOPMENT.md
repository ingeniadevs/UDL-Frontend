# Guía de Desarrollo

## 🚀 Setup Inicial

### Prerrequisitos

- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior (incluido con Node.js)
- **Git**: Para control de versiones
- **Editor**: VS Code (recomendado) con extensiones Vue

### Extensiones VS Code Recomendadas

```json
{
  "recommendations": [
    "vue.volar",
    "vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd club-socios-vue

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:5001`

## 🔧 Configuración del Entorno

### Desarrollo Local con Backend

Para que el frontend se comunique con el backend local:

1. **Asegúrate de que el backend esté corriendo** en `http://localhost:5055`

2. **No necesitas configurar variables de entorno** - El proxy de Vite redirige automáticamente:
   - `/api/*` → `http://localhost:5055/api/*`
   - `/uploads/*` → `http://localhost:5055/uploads/*`

3. **Configuración del proxy** en `vite.config.js`:

```javascript
server: {
  port: 5001,
  proxy: {
    '/api': {
      target: 'http://localhost:5055',
      changeOrigin: true
    },
    '/uploads': {
      target: 'http://localhost:5055',
      changeOrigin: true
    }
  }
}
```

### Desarrollo con Backend Remoto

Si necesitas conectarte a un backend en Railway u otro servidor:

1. Modifica `vite.config.js`:

```javascript
server: {
  port: 5001,
  proxy: {
    '/api': {
      target: 'https://tu-backend.up.railway.app',
      changeOrigin: true,
      secure: false
    }
  }
}
```

## 📁 Estructura de Archivos

```
src/
├── assets/              # Recursos estáticos (CSS, imágenes)
│   └── main.css        # Estilos globales
│
├── components/         # Componentes reutilizables
│   └── shared/         # Componentes compartidos
│       ├── EmptyState.vue
│       ├── ImageUpload.vue
│       └── LoadingSpinner.vue
│
├── layouts/            # Layouts de la aplicación
│   ├── AdminLayout.vue
│   └── SocioLayout.vue
│
├── router/             # Configuración de rutas
│   └── index.js
│
├── services/           # Servicios de API
│   ├── api.js          # Cliente axios configurado
│   └── index.js       # Exportación de servicios
│
├── stores/             # Stores de Pinia
│   └── auth.js         # Store de autenticación
│
├── views/              # Vistas/Páginas
│   ├── admin/          # Vistas del panel admin
│   ├── auth/           # Vistas de autenticación
│   └── socio/          # Vistas del panel socio
│
├── App.vue             # Componente raíz
└── main.js             # Punto de entrada
```

## 🎨 Creando Componentes

### Estructura de un Componente

```vue
<template>
  <div class="mi-componente">
    <h1>{{ titulo }}</h1>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  titulo: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['click'])

// State
const contador = ref(0)

// Computed
const doble = computed(() => contador.value * 2)

// Methods
const handleClick = () => {
  contador.value++
  emit('click', contador.value)
}

// Lifecycle
onMounted(() => {
  console.log('Componente montado')
})
</script>

<style scoped>
.mi-componente {
  padding: 20px;
}
</style>
```

### Buenas Prácticas

1. **Usa `<script setup>`** para sintaxis más limpia
2. **Props tipados** con validación
3. **Emits declarados** explícitamente
4. **Composables** para lógica reutilizable
5. **Estilos scoped** para evitar conflictos

## 🌐 Trabajando con la API

### Crear un Servicio

```javascript
// src/services/sociosService.js
import api from './api'

export default {
  // Listar todos
  getAll() {
    return api.get('/socios')
  },

  // Obtener uno
  getById(id) {
    return api.get(`/socios/${id}`)
  },

  // Crear
  create(data) {
    return api.post('/socios', data)
  },

  // Actualizar
  update(id, data) {
    return api.put(`/socios/${id}`, data)
  },

  // Eliminar
  delete(id) {
    return api.delete(`/socios/${id}`)
  }
}
```

### Usar el Servicio en un Componente

```vue
<script setup>
import { ref, onMounted } from 'vue'
import sociosService from '@/services/sociosService'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const socios = ref([])
const loading = ref(false)

const fetchSocios = async () => {
  loading.value = true
  try {
    const response = await sociosService.getAll()
    socios.value = response.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los socios',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSocios()
})
</script>
```

## 🛣️ Rutas y Navegación

### Agregar una Nueva Ruta

```javascript
// src/router/index.js
{
  path: '/admin/nueva-vista',
  name: 'NuevaVista',
  component: () => import('@/views/admin/NuevaVistaView.vue'),
  meta: { requiresAuth: true, role: 'admin' }
}
```

### Navegación Programática

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// Navegar a una ruta
router.push('/admin/socios')

// Navegar con parámetros
router.push({ name: 'SocioDetail', params: { id: 123 } })

// Navegar con query
router.push({ path: '/admin/socios', query: { search: 'juan' } })

// Ir atrás
router.back()
```

### Router Links

```vue
<!-- Básico -->
<router-link to="/admin/socios">Socios</router-link>

<!-- Con nombre -->
<router-link :to="{ name: 'Socios' }">Socios</router-link>

<!-- Con parámetros -->
<router-link :to="{ name: 'SocioDetail', params: { id: socio.id } }">
  Ver Detalle
</router-link>
```

## 💾 State Management con Pinia

### Crear un Store

```javascript
// src/stores/socios.js
import { defineStore } from 'pinia'
import sociosService from '@/services/sociosService'

export const useSociosStore = defineStore('socios', {
  state: () => ({
    socios: [],
    selectedSocio: null,
    loading: false
  }),

  getters: {
    sociosActivos: (state) => state.socios.filter(s => s.estado === 'activo'),
    totalSocios: (state) => state.socios.length
  },

  actions: {
    async fetchSocios() {
      this.loading = true
      try {
        const response = await sociosService.getAll()
        this.socios = response.data.data
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    selectSocio(id) {
      this.selectedSocio = this.socios.find(s => s.id === id)
    }
  }
})
```

### Usar el Store

```vue
<script setup>
import { onMounted } from 'vue'
import { useSociosStore } from '@/stores/socios'
import { storeToRefs } from 'pinia'

const sociosStore = useSociosStore()

// Refs reactivas del state
const { socios, loading, sociosActivos } = storeToRefs(sociosStore)

// Actions
const { fetchSocios, selectSocio } = sociosStore

onMounted(() => {
  fetchSocios()
})
</script>
```

## 🎨 Componentes PrimeVue

### DataTable

```vue
<template>
  <DataTable 
    :value="socios" 
    :paginator="true" 
    :rows="10"
    :loading="loading"
    responsiveLayout="scroll"
  >
    <Column field="numero_socio" header="N° Socio" :sortable="true"></Column>
    <Column field="nombre" header="Nombre" :sortable="true"></Column>
    <Column field="email" header="Email"></Column>
    <Column header="Acciones">
      <template #body="slotProps">
        <Button 
          icon="pi pi-pencil" 
          class="p-button-rounded p-button-text"
          @click="editSocio(slotProps.data)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
</script>
```

### Dialog (Modal)

```vue
<template>
  <Button label="Abrir Modal" @click="visible = true" />
  
  <Dialog 
    v-model:visible="visible" 
    header="Título del Modal"
    :style="{ width: '50vw' }"
    :modal="true"
  >
    <p>Contenido del modal</p>
    
    <template #footer>
      <Button label="Cancelar" @click="visible = false" class="p-button-text" />
      <Button label="Guardar" @click="handleSave" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const visible = ref(false)

const handleSave = () => {
  // Lógica de guardado
  visible.value = false
}
</script>
```

### Toast (Notificaciones)

```vue
<script setup>
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Éxito',
    detail: 'Operación completada',
    life: 3000
  })
}

const showError = () => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'No se pudo completar la operación',
    life: 3000
  })
}
</script>
```

## 🧪 Debugging

### Vue DevTools

1. Instala la extensión de navegador
2. Abre DevTools → pestaña Vue
3. Inspecciona componentes, rutas, stores

### Console Logging

```javascript
// Desarrollo
if (import.meta.env.DEV) {
  console.log('Solo en desarrollo', data)
}

// Producción
if (import.meta.env.PROD) {
  // Logging a servicio externo
}
```

### Network Debugging

```javascript
// En api.js ya hay interceptores que logean requests
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method.toUpperCase(), config.url)
    return config
  }
)
```

## 📝 Convenciones de Código

### Nomenclatura

```javascript
// Componentes: PascalCase
MiComponente.vue

// Archivos JS: camelCase
sociosService.js

// Stores: camelCase con 'use'
useSociosStore.js

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = '/api'

// Variables y funciones: camelCase
const miVariable = 'valor'
function miFuncion() {}
```

### Organización de Imports

```javascript
// 1. Vue core
import { ref, computed, onMounted } from 'vue'

// 2. Vue ecosystem (router, store)
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 3. Librerías externas
import { useToast } from 'primevue/usetoast'

// 4. Componentes
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

// 5. Services y utilidades
import sociosService from '@/services/sociosService'
```

## 🔄 Git Workflow

### Branches

```bash
main          # Producción
develop       # Desarrollo
feature/*     # Nuevas funcionalidades
bugfix/*      # Correcciones
hotfix/*      # Correcciones urgentes en producción
```

### Commits

```bash
# Formato
tipo(scope): mensaje

# Ejemplos
feat(socios): agregar filtro por estado
fix(auth): corregir redirect después de login
docs(readme): actualizar instrucciones de instalación
style(layout): mejorar espaciado en navbar
refactor(api): simplificar manejo de errores
```

### Pull Requests

1. Crear branch desde `develop`
2. Hacer commits descriptivos
3. Actualizar documentación si es necesario
4. Crear PR hacia `develop`
5. Esperar code review
6. Hacer merge

## 🚀 Build y Deploy

### Build Local

```bash
# Construir para producción
npm run build

# Preview de la build
npm run preview
```

### Build con Docker

```bash
# Construir imagen
docker build -t club-socios-frontend .

# Ejecutar (backend en Railway/Docker usa puerto 8080)
docker run -p 80:80 -e BACKEND_URL=http://backend:8080 club-socios-frontend
```

## 🐛 Troubleshooting Común

### El servidor no inicia

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Errores de TypeScript/Vue

```bash
# Reiniciar el servidor de desarrollo
# Ctrl+C y luego
npm run dev
```

### Problemas con el proxy

Verifica en `vite.config.js` que el target apunte al backend correcto:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5055',  // Confirma este puerto
    changeOrigin: true
  }
}
```

### CORS Errors

El backend debe tener configurado CORS para aceptar requests desde `http://localhost:5001`

## 📚 Recursos

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [PrimeVue](https://primevue.org/)
- [Axios](https://axios-http.com/)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la consola del navegador
2. Revisa la terminal donde corre el servidor
3. Consulta esta documentación
4. Contacta al equipo de desarrollo
