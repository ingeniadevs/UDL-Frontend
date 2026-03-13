<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Gestión de Pedidos</h1>
      <div class="flex align-items-center gap-2">
        <Tag severity="info" :value="`${pedidos.length} pedidos`" />
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="flex flex-wrap align-items-center gap-3">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="searchTerm" placeholder="Buscar por socio..." />
        </span>
        <Dropdown 
          v-model="selectedEstado" 
          :options="estadosOptions" 
          optionLabel="label"
          optionValue="value"
          placeholder="Todos los estados"
          showClear
        />
        <Dropdown 
          v-model="selectedEstadoPago" 
          :options="estadosPagoOptions" 
          optionLabel="label"
          optionValue="value"
          placeholder="Estado de pago"
          showClear
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="card text-center py-6">
      <i class="pi pi-exclamation-triangle text-4xl text-red-400 mb-3"></i>
      <p class="text-red-400 mb-3">{{ errorMessage }}</p>
      <Button label="Reintentar" icon="pi pi-refresh" @click="loadPedidos" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPedidos.length === 0" class="card text-center py-6">
      <i class="pi pi-shopping-cart text-4xl text-gray-400 mb-3"></i>
      <p class="text-gray-400">No hay pedidos para mostrar</p>
    </div>

    <!-- Pedidos List -->
    <div v-else class="grid">
      <div v-for="pedido in filteredPedidos" :key="pedido.id" class="col-12 lg:col-6 xl:col-4">
        <div class="pedido-card">
          <!-- Header -->
          <div class="pedido-header">
            <div class="flex align-items-center gap-2">
              <Avatar :label="pedido.nombreSocio?.charAt(0)" shape="circle" class="avatar-red" />
              <div>
                <h4 class="pedido-socio">{{ pedido.nombreSocio }}</h4>
                <span class="pedido-numero">Socio #{{ pedido.numeroSocio }}</span>
              </div>
            </div>
            <div class="flex flex-column align-items-end gap-1">
              <Tag :severity="getEstadoSeverity(pedido.estado)" :value="pedido.estado" />
              <Tag :severity="getEstadoPagoSeverity(pedido.estadoPago)" :value="pedido.estadoPago" size="small" />
            </div>
          </div>

          <!-- Items -->
          <div class="pedido-items">
            <div v-for="item in pedido.items" :key="item.id" class="pedido-item">
              <span class="item-cantidad">{{ item.cantidad }}x</span>
              <span class="item-nombre">{{ item.nombreProducto }}</span>
              <span v-if="item.talla" class="item-talla">({{ item.talla }})</span>
              <span class="item-precio ml-auto">${{ item.subtotal.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="pedido-footer">
            <div class="pedido-info">
              <div class="flex align-items-center gap-2 mb-2">
                <i class="pi pi-calendar text-gray-400"></i>
                <span class="text-gray-400 text-sm">{{ formatDate(pedido.fechaPedido) }}</span>
              </div>
              <div class="pedido-total">
                Total: <span>${{ pedido.total.toLocaleString() }}</span>
              </div>
            </div>
            <div class="pedido-actions">
              <Button 
                icon="pi pi-eye" 
                class="p-button-rounded p-button-text"
                @click="viewPedido(pedido)"
                v-tooltip.top="'Ver detalle'"
              />
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text p-button-success"
                @click="editPedido(pedido)"
                v-tooltip.top="'Actualizar estado'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Dialog -->
    <Dialog 
      v-model:visible="detailDialog" 
      header="Detalle del Pedido" 
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedPedido" class="pedido-detail">
        <div class="detail-section">
          <h4 class="detail-title">Información del Socio</h4>
          <div class="grid">
            <div class="col-6">
              <label>Nombre:</label>
              <p>{{ selectedPedido.nombreSocio }}</p>
            </div>
            <div class="col-6">
              <label>N° Socio:</label>
              <p>{{ selectedPedido.numeroSocio }}</p>
            </div>
            <div class="col-6">
              <label>Email:</label>
              <p>{{ selectedPedido.emailSocio }}</p>
            </div>
            <div class="col-6">
              <label>Teléfono:</label>
              <p>{{ selectedPedido.telefono || 'No registrado' }}</p>
            </div>
          </div>
        </div>

        <Divider />

        <div class="detail-section">
          <h4 class="detail-title">Productos</h4>
          <DataTable :value="selectedPedido.items" class="p-datatable-sm">
            <Column field="nombreProducto" header="Producto" />
            <Column field="talla" header="Talla" />
            <Column field="cantidad" header="Cant." style="width: 60px" />
            <Column header="Precio" style="width: 100px">
              <template #body="{ data }">
                ${{ data.precio.toLocaleString() }}
              </template>
            </Column>
            <Column header="Subtotal" style="width: 100px">
              <template #body="{ data }">
                ${{ data.subtotal.toLocaleString() }}
              </template>
            </Column>
          </DataTable>
          <div class="text-right mt-3">
            <span class="text-xl font-bold text-primary">Total: ${{ selectedPedido.total.toLocaleString() }}</span>
          </div>
        </div>

        <Divider />

        <div class="detail-section">
          <h4 class="detail-title">Estado del Pedido</h4>
          <div class="grid">
            <div class="col-6">
              <label>Estado:</label>
              <Tag :severity="getEstadoSeverity(selectedPedido.estado)" :value="selectedPedido.estado" />
            </div>
            <div class="col-6">
              <label>Pago:</label>
              <Tag :severity="getEstadoPagoSeverity(selectedPedido.estadoPago)" :value="selectedPedido.estadoPago" />
            </div>
            <div class="col-6">
              <label>Fecha Pedido:</label>
              <p>{{ formatDate(selectedPedido.fechaPedido) }}</p>
            </div>
            <div class="col-6">
              <label>Fecha Entrega:</label>
              <p>{{ selectedPedido.fechaEntrega ? formatDate(selectedPedido.fechaEntrega) : 'Sin definir' }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedPedido.observaciones" class="detail-section mt-3">
          <h4 class="detail-title">Observaciones</h4>
          <p class="text-gray-300">{{ selectedPedido.observaciones }}</p>
        </div>
      </div>
    </Dialog>

    <!-- Edit Estado Dialog -->
    <Dialog 
      v-model:visible="editDialog" 
      header="Actualizar Estado del Pedido" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div v-if="selectedPedido" class="flex flex-column gap-4 pt-3">
        <div class="field">
          <label class="font-medium text-gray-300">Estado del Pedido *</label>
          <Dropdown 
            v-model="editForm.estado" 
            :options="estadosOptions" 
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="font-medium text-gray-300">Estado del Pago</label>
          <Dropdown 
            v-model="editForm.estadoPago" 
            :options="estadosPagoOptions" 
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="font-medium text-gray-300">Método de Pago</label>
          <Dropdown 
            v-model="editForm.metodoPago" 
            :options="metodosPago" 
            placeholder="Seleccionar método"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="font-medium text-gray-300">Fecha de Entrega</label>
          <Calendar 
            v-model="editForm.fechaEntrega" 
            dateFormat="dd/mm/yy"
            class="w-full"
            showIcon
          />
        </div>

        <div class="field">
          <label class="font-medium text-gray-300">Observaciones</label>
          <Textarea v-model="editForm.observaciones" rows="3" class="w-full" />
        </div>

        <Message v-if="editForm.estado === 'Confirmado' && selectedPedido.estado === 'Pendiente'" severity="warn" :closable="false">
          <i class="pi pi-exclamation-triangle mr-2"></i>
          Al confirmar el pedido se descontará el stock de los productos.
        </Message>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="editDialog = false" />
        <Button label="Guardar" icon="pi pi-check" @click="saveEstado" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { pedidosService } from '@/services'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

const toast = useToast()

const pedidos = ref([])
const loading = ref(false)
const errorMessage = ref('')
const searchTerm = ref('')
const selectedEstado = ref(null)
const selectedEstadoPago = ref(null)
const detailDialog = ref(false)
const editDialog = ref(false)
const selectedPedido = ref(null)
const saving = ref(false)

const editForm = ref({
  estado: '',
  estadoPago: '',
  metodoPago: '',
  fechaEntrega: null,
  observaciones: ''
})

const estadosOptions = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Confirmado', value: 'Confirmado' },
  { label: 'En Preparación', value: 'EnPreparacion' },
  { label: 'Enviado', value: 'Enviado' },
  { label: 'Entregado', value: 'Entregado' },
  { label: 'Cancelado', value: 'Cancelado' }
]

const estadosPagoOptions = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Pagado', value: 'Pagado' },
  { label: 'Vencido', value: 'Vencido' },
  { label: 'Cancelado', value: 'Cancelado' }
]

const metodosPago = ['Efectivo', 'Transferencia', 'Tarjeta', 'MercadoPago']

const filteredPedidos = computed(() => {
  return pedidos.value.filter(p => {
    if (searchTerm.value) {
      const search = searchTerm.value.toLowerCase()
      if (!p.nombreSocio.toLowerCase().includes(search) && 
          !p.numeroSocio.toLowerCase().includes(search)) {
        return false
      }
    }
    if (selectedEstado.value && p.estado !== selectedEstado.value) return false
    if (selectedEstadoPago.value && p.estadoPago !== selectedEstadoPago.value) return false
    return true
  })
})

function getEstadoSeverity(estado) {
  const map = {
    'Pendiente': 'warning',
    'Confirmado': 'info',
    'EnPreparacion': 'info',
    'Enviado': 'info',
    'Entregado': 'success',
    'Cancelado': 'danger'
  }
  return map[estado] || 'secondary'
}

function getEstadoPagoSeverity(estado) {
  const map = {
    'Pendiente': 'warning',
    'Pagado': 'success',
    'Vencido': 'danger',
    'Cancelado': 'danger'
  }
  return map[estado] || 'secondary'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadPedidos() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await pedidosService.getAll()
    pedidos.value = result || []
  } catch (error) {
    console.error('Error al cargar pedidos:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'No se pudieron cargar los pedidos'
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: errorMessage.value, 
      life: 5000 
    })
  } finally {
    loading.value = false
  }
}

function viewPedido(pedido) {
  selectedPedido.value = pedido
  detailDialog.value = true
}

function editPedido(pedido) {
  selectedPedido.value = pedido
  editForm.value = {
    estado: pedido.estado,
    estadoPago: pedido.estadoPago,
    metodoPago: pedido.metodoPago || '',
    fechaEntrega: pedido.fechaEntrega ? new Date(pedido.fechaEntrega) : null,
    observaciones: pedido.observaciones || ''
  }
  editDialog.value = true
}

async function saveEstado() {
  saving.value = true
  try {
    await pedidosService.updateEstado(selectedPedido.value.id, {
      estado: editForm.value.estado,
      estadoPago: editForm.value.estadoPago || null,
      metodoPago: editForm.value.metodoPago || null,
      fechaEntrega: editForm.value.fechaEntrega?.toISOString() || null,
      observaciones: editForm.value.observaciones || null
    })
    
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado correctamente', life: 3000 })
    editDialog.value = false
    await loadPedidos()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'No se pudo actualizar el estado', 
      life: 3000 
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadPedidos()
})
</script>

<style scoped>
.pedido-card {
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  overflow: hidden;
  transition: all 0.3s ease;
}

.pedido-card:hover {
  border-color: #dc2626;
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
}

.pedido-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #2a2a2a;
}

.pedido-socio {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.pedido-numero {
  color: #9ca3af;
  font-size: 0.8rem;
}

.avatar-red {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
}

.pedido-items {
  padding: 0.75rem 1rem;
  max-height: 150px;
  overflow-y: auto;
}

.pedido-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #2a2a2a;
  font-size: 0.85rem;
}

.pedido-item:last-child {
  border-bottom: none;
}

.item-cantidad {
  color: #dc2626;
  font-weight: 600;
  min-width: 30px;
}

.item-nombre {
  color: #e5e5e5;
}

.item-talla {
  color: #9ca3af;
  font-size: 0.8rem;
}

.item-precio {
  color: #9ca3af;
}

.pedido-footer {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #2a2a2a;
  background: #0a0a0a;
}

.pedido-total {
  color: white;
  font-weight: 500;
}

.pedido-total span {
  color: #dc2626;
  font-size: 1.25rem;
  font-weight: 700;
}

.pedido-actions {
  display: flex;
  gap: 4px;
}

.detail-section {
  margin-bottom: 1rem;
}

.detail-title {
  color: #dc2626;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.detail-section label {
  color: #9ca3af;
  font-size: 0.8rem;
  display: block;
  margin-bottom: 4px;
}

.detail-section p {
  color: white;
  margin: 0;
}
</style>
