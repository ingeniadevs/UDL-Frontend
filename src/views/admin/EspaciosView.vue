<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Espacios</h1>
      <Button label="Nuevo Espacio" icon="pi pi-plus" @click="openNew" />
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="card mb-4">
      <div class="flex flex-wrap align-items-center gap-3">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="searchTerm" placeholder="Buscar espacios..." />
        </span>
        <Dropdown 
          v-model="selectedTipo" 
          :options="tiposEspacio" 
          placeholder="Todos los tipos"
          showClear
        />
        <Dropdown 
          v-model="selectedStatus" 
          :options="estadoOptions" 
          optionLabel="label"
          optionValue="value"
          placeholder="Todos los estados"
          showClear
        />
        <div class="flex align-items-center gap-2 ml-auto">
          <span class="text-gray-400 text-sm">{{ filteredEspacios.length }} espacios</span>
        </div>
      </div>
    </div>

    <!-- Espacios Grid -->
    <div v-if="loading" class="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>

    <div v-else-if="filteredEspacios.length === 0" class="card text-center py-6">
      <i class="pi pi-building text-4xl text-gray-400 mb-3"></i>
      <p class="text-gray-400 mb-3">No se encontraron espacios</p>
      <Button label="Crear primer espacio" icon="pi pi-plus" @click="openNew" />
    </div>

    <div v-else class="grid">
      <div v-for="esp in filteredEspacios" :key="esp.id" class="col-12 sm:col-6 lg:col-4 xl:col-3">
        <div class="espacio-card h-full flex flex-column" :class="{ 'inactive': !esp.activo }">
          <!-- Espacio Image -->
          <div class="espacio-image-container relative">
            <img 
              v-if="esp.imagen" 
              :src="esp.imagen" 
              :alt="esp.nombre"
              class="espacio-image"
            />
            <div v-else class="espacio-placeholder">
              <i class="pi pi-building"></i>
            </div>
            
            <!-- Badges -->
            <div class="espacio-badges">
              <Tag v-if="esp.requiereAprobacion" severity="warning" value="⚡ Requiere Aprobación" />
              <Tag v-if="!esp.activo" severity="danger" value="Inactivo" />
            </div>

            <!-- Quick Actions Overlay -->
            <div class="espacio-actions-overlay">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-success"
                @click="editEspacio(esp)"
                v-tooltip.top="'Editar'"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-rounded p-button-danger"
                @click="confirmDelete(esp)"
                v-tooltip.top="'Eliminar'"
              />
            </div>
          </div>

          <!-- Espacio Info -->
          <div class="espacio-body flex-1 flex flex-column">
            <div class="flex align-items-center justify-content-between mb-2">
              <Tag :severity="getTipoSeverity(esp.tipo)" :value="esp.tipo" />
              <Tag 
                :severity="esp.activo ? 'success' : 'danger'"
                :value="esp.activo ? 'Activo' : 'Inactivo'"
              />
            </div>
            
            <h4 class="espacio-title">{{ esp.nombre }}</h4>
            <p class="espacio-description flex-1">{{ esp.descripcion || 'Sin descripción' }}</p>
            
            <div class="espacio-details mb-2">
              <div class="detail-item">
                <i class="pi pi-clock"></i>
                <span>{{ esp.horaApertura }} - {{ esp.horaCierre }}</span>
              </div>
              <div class="detail-item">
                <i class="pi pi-stopwatch"></i>
                <span>{{ esp.duracionTurno }} min/turno</span>
              </div>
              <div v-if="esp.capacidad" class="detail-item">
                <i class="pi pi-users"></i>
                <span>{{ esp.capacidad }} personas</span>
              </div>
            </div>

            <!-- Price -->
            <div class="espacio-price">
              ${{ esp.precioPorHora?.toLocaleString() }}/hora
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="espacio-footer">
            <Button 
              label="Editar" 
              icon="pi pi-pencil" 
              class="p-button-sm p-button-outlined flex-1"
              @click="editEspacio(esp)"
            />
            <Button 
              :icon="esp.activo ? 'pi pi-eye-slash' : 'pi pi-eye'" 
              class="p-button-sm p-button-outlined"
              :class="esp.activo ? 'p-button-warning' : 'p-button-success'"
              @click="toggleActivo(esp)"
              v-tooltip.top="esp.activo ? 'Desactivar' : 'Activar'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog 
      v-model:visible="espacioDialog" 
      :header="isEditing ? 'Editar Espacio' : 'Nuevo Espacio'" 
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="flex flex-column gap-4 pt-3">
        <div class="grid">
          <div class="col-12 md:col-6">
            <label for="nombre" class="font-medium text-gray-300">Nombre *</label>
            <InputText id="nombre" v-model="espacio.nombre" class="w-full mt-2" :class="{ 'p-invalid': submitted && !espacio.nombre }" />
            <small v-if="submitted && !espacio.nombre" class="p-error">El nombre es requerido</small>
          </div>
          <div class="col-12 md:col-6">
            <label for="tipo" class="font-medium text-gray-300">Tipo *</label>
            <Dropdown 
              id="tipo"
              v-model="espacio.tipo" 
              :options="tiposEspacio" 
              placeholder="Seleccione un tipo"
              class="w-full mt-2"
              :class="{ 'p-invalid': submitted && !espacio.tipo }"
            />
            <small v-if="submitted && !espacio.tipo" class="p-error">El tipo es requerido</small>
          </div>
        </div>

        <div class="field">
          <label for="descripcion" class="font-medium text-gray-300">Descripción</label>
          <Textarea id="descripcion" v-model="espacio.descripcion" rows="2" class="w-full mt-2" />
        </div>

        <div class="field">
          <label class="font-medium text-gray-300 mb-2 block">Imagen del Espacio</label>
          <ImageUpload v-model="espacio.imagen" placeholder="Subir imagen del espacio" />
        </div>

        <div class="grid">
          <div class="col-12 md:col-6">
            <label for="precio" class="font-medium text-gray-300">Precio por Hora *</label>
            <InputNumber id="precio" v-model="espacio.precioPorHora" mode="currency" currency="USD" class="w-full mt-2" />
          </div>
          <div class="col-12 md:col-6">
            <label for="capacidad" class="font-medium text-gray-300">Capacidad</label>
            <InputNumber id="capacidad" v-model="espacio.capacidad" class="w-full mt-2" />
          </div>
        </div>

        <div class="grid">
          <div class="col-12 md:col-4">
            <label for="horaApertura" class="font-medium text-gray-300">Hora Apertura</label>
            <InputText id="horaApertura" v-model="espacio.horaApertura" class="w-full mt-2" placeholder="08:00" />
          </div>
          <div class="col-12 md:col-4">
            <label for="horaCierre" class="font-medium text-gray-300">Hora Cierre</label>
            <InputText id="horaCierre" v-model="espacio.horaCierre" class="w-full mt-2" placeholder="22:00" />
          </div>
          <div class="col-12 md:col-4">
            <label for="duracion" class="font-medium text-gray-300">Duración Turno (min)</label>
            <InputNumber id="duracion" v-model="espacio.duracionTurno" class="w-full mt-2" :min="15" :step="15" />
          </div>
        </div>

        <div class="grid">
          <div class="col-12 md:col-6" v-if="isEditing">
            <label for="activo" class="font-medium text-gray-300">Estado</label>
            <div class="flex align-items-center gap-2 mt-2">
              <InputSwitch id="activo" v-model="espacio.activo" />
              <span class="text-gray-300">{{ espacio.activo ? 'Activo' : 'Inactivo' }}</span>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <label for="aprobacion" class="font-medium text-gray-300">Requiere Aprobación</label>
            <div class="flex align-items-center gap-2 mt-2">
              <InputSwitch id="aprobacion" v-model="espacio.requiereAprobacion" />
              <span class="text-gray-300">{{ espacio.requiereAprobacion ? 'Sí' : 'No' }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveEspacio" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { espaciosService } from '@/services'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import ImageUpload from '@/components/shared/ImageUpload.vue'

const toast = useToast()
const confirm = useConfirm()

const espacios = ref([])
const loading = ref(false)
const espacioDialog = ref(false)
const submitted = ref(false)
const saving = ref(false)
const isEditing = ref(false)

// Filters
const searchTerm = ref('')
const selectedTipo = ref(null)
const selectedStatus = ref(null)

const estadoOptions = ref([
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false }
])

const tiposEspacio = ref([
  'Cancha de Pádel',
  'Cancha de Tenis',
  'Cancha de Fútbol',
  'Cancha de Básquet',
  'Piscina',
  'Gimnasio',
  'Salón de Eventos',
  'Quincho',
  'Otro'
])

const espacio = ref({})

const filteredEspacios = computed(() => {
  let result = espacios.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(e => 
      e.nombre?.toLowerCase().includes(term) ||
      e.descripcion?.toLowerCase().includes(term)
    )
  }

  if (selectedTipo.value) {
    result = result.filter(e => e.tipo === selectedTipo.value)
  }

  if (selectedStatus.value !== null) {
    result = result.filter(e => e.activo === selectedStatus.value)
  }

  return result
})

function getTipoSeverity(tipo) {
  const severities = {
    'Cancha de Pádel': 'info',
    'Cancha de Tenis': 'success',
    'Cancha de Fútbol': 'warning',
    'Cancha de Básquet': 'contrast',
    'Piscina': 'info',
    'Gimnasio': 'secondary',
    'Salón de Eventos': 'contrast',
    'Quincho': 'warning'
  }
  return severities[tipo] || 'secondary'
}

async function loadEspacios() {
  loading.value = true
  try {
    espacios.value = await espaciosService.getAll()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los espacios', life: 3000 })
  } finally {
    loading.value = false
  }
}

function openNew() {
  espacio.value = { 
    precioPorHora: 0, 
    activo: true, 
    requiereAprobacion: false,
    horaApertura: '08:00',
    horaCierre: '22:00',
    duracionTurno: 60,
    imagen: null
  }
  submitted.value = false
  isEditing.value = false
  espacioDialog.value = true
}

function editEspacio(data) {
  espacio.value = { ...data }
  isEditing.value = true
  submitted.value = false
  espacioDialog.value = true
}

function hideDialog() {
  espacioDialog.value = false
  submitted.value = false
}

async function saveEspacio() {
  submitted.value = true

  if (!espacio.value.nombre || !espacio.value.tipo) {
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await espaciosService.update(espacio.value.id, {
        nombre: espacio.value.nombre,
        tipo: espacio.value.tipo,
        descripcion: espacio.value.descripcion,
        capacidad: espacio.value.capacidad,
        precioPorHora: espacio.value.precioPorHora || 0,
        horaApertura: espacio.value.horaApertura || '08:00',
        horaCierre: espacio.value.horaCierre || '22:00',
        duracionTurno: espacio.value.duracionTurno || 60,
        activo: espacio.value.activo,
        requiereAprobacion: espacio.value.requiereAprobacion,
        imagen: espacio.value.imagen
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Espacio actualizado', life: 3000 })
    } else {
      await espaciosService.create({
        nombre: espacio.value.nombre,
        tipo: espacio.value.tipo,
        descripcion: espacio.value.descripcion,
        capacidad: espacio.value.capacidad,
        precioPorHora: espacio.value.precioPorHora || 0,
        horaApertura: espacio.value.horaApertura || '08:00',
        horaCierre: espacio.value.horaCierre || '22:00',
        duracionTurno: espacio.value.duracionTurno || 60,
        requiereAprobacion: espacio.value.requiereAprobacion,
        imagen: espacio.value.imagen
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Espacio creado', life: 3000 })
    }
    hideDialog()
    await loadEspacios()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al guardar el espacio', 
      life: 3000 
    })
  } finally {
    saving.value = false
  }
}

async function toggleActivo(esp) {
  try {
    await espaciosService.update(esp.id, {
      ...esp,
      activo: !esp.activo
    })
    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: `Espacio ${esp.activo ? 'desactivado' : 'activado'}`, 
      life: 3000 
    })
    await loadEspacios()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado', life: 3000 })
  }
}

function confirmDelete(data) {
  confirm.require({
    message: `¿Está seguro de eliminar el espacio "${data.nombre}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await espaciosService.delete(data.id)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Espacio eliminado', life: 3000 })
        await loadEspacios()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el espacio', life: 3000 })
      }
    }
  })
}

onMounted(() => {
  loadEspacios()
})
</script>

<style scoped>
.espacio-card {
  background: linear-gradient(145deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 40, 0.95));
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.espacio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(99, 102, 241, 0.4);
}

.espacio-card.inactive {
  opacity: 0.7;
}

.espacio-image-container {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.espacio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.espacio-card:hover .espacio-image {
  transform: scale(1.05);
}

.espacio-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
}

.espacio-placeholder i {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.3);
}

.espacio-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.espacio-actions-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.espacio-card:hover .espacio-actions-overlay {
  opacity: 1;
}

.espacio-body {
  padding: 1rem;
}

.espacio-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0.5rem 0;
  line-height: 1.3;
}

.espacio-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.espacio-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.detail-item i {
  font-size: 0.7rem;
}

.espacio-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
  margin-top: 0.5rem;
}

.espacio-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
