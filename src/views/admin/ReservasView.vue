<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Reservas</h1>
      <Button label="Nueva Reserva" icon="pi pi-plus" @click="openNew" />
    </div>

    <!-- Resumen de Pagos -->
    <div class="grid mb-4">
      <div class="col-12 md:col-3">
        <div class="stat-card stat-total">
          <div class="stat-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ resumenPagos?.totalReservas || 0 }}</span>
            <span class="stat-label">Total Reservas</span>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="stat-card stat-success">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ resumenPagos?.reservasPagadas || 0 }}</span>
            <span class="stat-label">Pagadas</span>
            <small class="stat-amount">${{ (resumenPagos?.montoTotalPagado || 0).toLocaleString() }}</small>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ resumenPagos?.reservasPendientes || 0 }}</span>
            <span class="stat-label">Pendientes</span>
            <small class="stat-amount">${{ (resumenPagos?.montoTotalPendiente || 0).toLocaleString() }}</small>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="stat-card stat-efectivo">
          <div class="stat-icon">
            <i class="pi pi-money-bill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ reservasPendientesEfectivo.length }}</span>
            <span class="stat-label">Efectivo Pendiente</span>
            <Button 
              v-if="reservasPendientesEfectivo.length > 0"
              label="Ver" 
              size="small" 
              text 
              @click="mostrarPendientesEfectivo"
            />
          </div>
        </div>
      </div>
    </div>    <!-- Filtros -->
    <div class="card mb-4">
      <div class="grid">
        <div class="col-12 md:col-2">
          <label class="font-medium text-gray-300 block mb-2">Socio</label>
          <Dropdown 
            v-model="filtros.socioId" 
            :options="socios" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Todos"
            class="w-full"
            showClear
            filter
            @change="loadReservas"
          />
        </div>
        <div class="col-12 md:col-2">
          <label class="font-medium text-gray-300 block mb-2">Espacio</label>
          <Dropdown 
            v-model="filtros.espacioId" 
            :options="espacios" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Todos"
            class="w-full"
            showClear
            @change="loadReservas"
          />
        </div>
        <div class="col-12 md:col-2">
          <label class="font-medium text-gray-300 block mb-2">Estado</label>
          <Dropdown 
            v-model="filtros.estado" 
            :options="estadosReserva" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Todos"
            class="w-full"
            showClear
            @change="loadReservas"
          />
        </div>
        <div class="col-12 md:col-2">
          <label class="font-medium text-gray-300 block mb-2">Estado Pago</label>
          <Dropdown 
            v-model="filtros.estadoPago" 
            :options="estadosPago" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Todos"
            class="w-full"
            showClear
            @change="loadReservas"
          />
        </div>
        <div class="col-12 md:col-2">
          <label class="font-medium text-gray-300 block mb-2">Desde</label>
          <Calendar v-model="filtros.fechaDesde" dateFormat="dd/mm/yy" class="w-full" showIcon @date-select="loadReservas" />
        </div>
        <div class="col-12 md:col-2">
          <label class="font-medium text-gray-300 block mb-2">Hasta</label>
          <Calendar v-model="filtros.fechaHasta" dateFormat="dd/mm/yy" class="w-full" showIcon @date-select="loadReservas" />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex justify-content-between align-items-center mb-3">
        <h3 class="m-0 text-white">Listado de Reservas</h3>
        <Button 
          v-if="reservasSeleccionadas.length > 0"
          :label="`Confirmar pago efectivo (${reservasSeleccionadas.length})`"
          icon="pi pi-check"
          severity="success"
          @click="confirmarPagosEfectivoMultiple"
          :loading="confirmandoPagos"
        />
      </div>
      
      <DataTable 
        :value="reservas" 
        :loading="loading"
        :paginator="true"
        :rows="10"
        v-model:selection="reservasSeleccionadas"
        dataKey="id"
        responsiveLayout="scroll"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem" :selectable="canSelectForPayment"></Column>
        
        <Column header="Fecha" sortable style="min-width: 100px">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.fecha) }}
          </template>
        </Column>
        <Column header="Horario" style="min-width: 120px">
          <template #body="slotProps">
            {{ slotProps.data.horaInicio }} - {{ slotProps.data.horaFin }}
          </template>
        </Column>
        <Column field="espacioNombre" header="Espacio" sortable style="min-width: 150px">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <Tag :value="slotProps.data.espacioTipo" :severity="getTipoSeverity(slotProps.data.espacioTipo)" size="small" />
              <span>{{ slotProps.data.espacioNombre }}</span>
            </div>
          </template>
        </Column>
        <Column field="socioNombre" header="Socio" sortable style="min-width: 150px">
          <template #body="slotProps">
            <div>
              <div>{{ slotProps.data.socioNombre }}</div>
              <small class="text-gray-400">{{ slotProps.data.socioEmail }}</small>
            </div>
          </template>
        </Column>
        <Column header="Monto" style="min-width: 100px">
          <template #body="slotProps">
            <span class="font-bold">${{ slotProps.data.monto?.toLocaleString() }}</span>
          </template>
        </Column>
        <Column header="Estado" style="min-width: 120px">
          <template #body="slotProps">
            <Tag :severity="getEstadoSeverity(slotProps.data.estado)" :value="slotProps.data.estado" />
          </template>
        </Column>
        <Column header="Pago" style="min-width: 150px">
          <template #body="slotProps">
            <div class="flex flex-column gap-1">
              <Tag 
                :severity="getEstadoPagoSeverity(slotProps.data.estadoPago)" 
                :value="slotProps.data.estadoPago" 
              />
              <small v-if="slotProps.data.metodoPago" class="text-gray-400">
                <i :class="getMetodoPagoIcon(slotProps.data.metodoPago)" class="mr-1"></i>
                {{ slotProps.data.metodoPago }}
              </small>
              <small v-if="slotProps.data.fechaPago" class="text-gray-500">
                {{ formatDate(slotProps.data.fechaPago) }}
              </small>
            </div>
          </template>
        </Column>
        <Column header="Acciones" style="min-width: 180px">
          <template #body="slotProps">
            <Button 
              v-if="slotProps.data.estado === 'Pendiente'"
              icon="pi pi-check" 
              text 
              rounded 
              class="mr-1" 
              severity="success"
              @click="confirmarReserva(slotProps.data)"
              v-tooltip.top="'Confirmar'"
            />
            <Button 
              v-if="slotProps.data.estadoPago === 'Pendiente' && slotProps.data.metodoPago === 'Efectivo'"
              icon="pi pi-money-bill" 
              text 
              rounded 
              class="mr-1" 
              severity="success"
              @click="confirmarPagoEfectivo(slotProps.data)"
              v-tooltip.top="'Confirmar pago efectivo'"
            />
            <Button 
              v-if="slotProps.data.estado !== 'Cancelada' && slotProps.data.estado !== 'Completada'"
              icon="pi pi-times" 
              text 
              rounded 
              class="mr-1" 
              severity="warning"
              @click="cancelarReserva(slotProps.data)"
              v-tooltip.top="'Cancelar'"
            />
            <Button 
              v-if="slotProps.data.estado === 'Confirmada'"
              icon="pi pi-flag" 
              text 
              rounded 
              class="mr-1" 
              severity="info"
              @click="completarReserva(slotProps.data)"
              v-tooltip.top="'Completar'"
            />
            <Button 
              icon="pi pi-trash" 
              text 
              rounded 
              severity="danger"
              @click="confirmDelete(slotProps.data)"
              v-tooltip.top="'Eliminar'"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog de Reservas Pendientes de Efectivo -->
    <Dialog 
      v-model:visible="pendientesEfectivoDialog" 
      header="Reservas Pendientes de Pago en Efectivo" 
      :modal="true"
      :style="{ width: '700px' }"
    >
      <DataTable 
        :value="reservasPendientesEfectivo" 
        v-model:selection="reservasParaConfirmar"
        dataKey="id"
        responsiveLayout="scroll"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="socioNombre" header="Socio"></Column>
        <Column field="espacioNombre" header="Espacio"></Column>
        <Column header="Fecha">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.fecha) }}
          </template>
        </Column>
        <Column header="Monto">
          <template #body="slotProps">
            ${{ slotProps.data.monto?.toLocaleString() }}
          </template>
        </Column>
      </DataTable>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="pendientesEfectivoDialog = false" />
        <Button 
          :label="`Confirmar pagos (${reservasParaConfirmar.length})`" 
          icon="pi pi-check" 
          @click="confirmarPagosSeleccionados"
          :loading="confirmandoPagos"
          :disabled="reservasParaConfirmar.length === 0"
        />
      </template>
    </Dialog>

    <!-- Create Dialog -->
    <Dialog 
      v-model:visible="reservaDialog" 
      header="Nueva Reserva" 
      :modal="true"
      :style="{ width: '550px' }"
    >
      <div class="flex flex-column gap-4 pt-3">
        <div class="field">
          <label for="socio" class="font-medium text-gray-300">Socio *</label>
          <Dropdown 
            id="socio"
            v-model="reserva.socioId" 
            :options="socios" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Seleccione un socio"
            class="w-full mt-2"
            filter
            :class="{ 'p-invalid': submitted && !reserva.socioId }"
          />
          <small v-if="submitted && !reserva.socioId" class="p-error">El socio es requerido</small>
        </div>

        <div class="field">
          <label for="espacio" class="font-medium text-gray-300">Espacio *</label>
          <Dropdown 
            id="espacio"
            v-model="reserva.espacioId" 
            :options="espaciosActivos" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Seleccione un espacio"
            class="w-full mt-2"
            :class="{ 'p-invalid': submitted && !reserva.espacioId }"
            @change="onEspacioChange"
          />
          <small v-if="submitted && !reserva.espacioId" class="p-error">El espacio es requerido</small>
        </div>

        <div class="field">
          <label for="fecha" class="font-medium text-gray-300">Fecha *</label>
          <Calendar 
            id="fecha"
            v-model="reserva.fecha" 
            dateFormat="dd/mm/yy" 
            class="w-full mt-2" 
            :minDate="new Date()"
            showIcon
            :class="{ 'p-invalid': submitted && !reserva.fecha }"
            @date-select="loadTurnos"
          />
          <small v-if="submitted && !reserva.fecha" class="p-error">La fecha es requerida</small>
        </div>

        <div class="field" v-if="turnos.length > 0">
          <label class="font-medium text-gray-300">Turno Disponible *</label>
          <div class="grid mt-2">
            <div v-for="turno in turnos" :key="turno.horaInicio" class="col-4 md:col-3">
              <Button 
                :label="turno.horaInicio"
                :severity="getTurnoSeverity(turno)"
                :outlined="reserva.horaInicio !== turno.horaInicio"
                :disabled="!turno.disponible"
                class="w-full"
                @click="selectTurno(turno)"
              />
            </div>
          </div>
          <small v-if="submitted && !reserva.horaInicio" class="p-error">Seleccione un turno</small>
        </div>

        <div class="field" v-if="espacioSeleccionado && reserva.horaInicio">
          <div class="surface-ground border-round p-3">
            <div class="flex justify-content-between align-items-center">
              <span class="text-gray-300">Precio estimado:</span>
              <span class="text-xl font-bold text-primary">${{ calcularPrecio().toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="observaciones" class="font-medium text-gray-300">Observaciones</label>
          <Textarea id="observaciones" v-model="reserva.observaciones" rows="2" class="w-full mt-2" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Crear Reserva" icon="pi pi-check" @click="saveReserva" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { reservasService, espaciosService, sociosService } from '@/services'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'

const toast = useToast()
const confirm = useConfirm()

const reservas = ref([])
const espacios = ref([])
const socios = ref([])
const turnos = ref([])
const loading = ref(false)
const reservaDialog = ref(false)
const submitted = ref(false)
const saving = ref(false)
const resumenPagos = ref(null)
const reservasSeleccionadas = ref([])
const confirmandoPagos = ref(false)

// Dialog de pendientes efectivo
const pendientesEfectivoDialog = ref(false)
const reservasParaConfirmar = ref([])

const filtros = ref({
  socioId: null,
  espacioId: null,
  estado: null,
  estadoPago: null,
  fechaDesde: null,
  fechaHasta: null
})

const estadosReserva = ref([
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Confirmada', value: 'Confirmada' },
  { label: 'Cancelada', value: 'Cancelada' },
  { label: 'Completada', value: 'Completada' }
])

const estadosPago = ref([
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Pagado', value: 'Pagado' },
  { label: 'Vencido', value: 'Vencido' },
  { label: 'Cancelado', value: 'Cancelado' }
])

const reserva = ref({})

const espaciosActivos = computed(() => espacios.value.filter(e => e.activo))

const espacioSeleccionado = computed(() => 
  espacios.value.find(e => e.id === reserva.value.espacioId)
)

const reservasPendientesEfectivo = computed(() => 
  reservas.value.filter(r => r.estadoPago === 'Pendiente' && r.metodoPago === 'Efectivo')
)

function canSelectForPayment(data) {
  return data.estadoPago === 'Pendiente' && data.metodoPago === 'Efectivo'
}

function getTipoSeverity(tipo) {
  const severities = {
    'Cancha de Pádel': 'info',
    'Cancha de Tenis': 'success',
    'Cancha de Fútbol': 'warning',
    'Piscina': 'info'
  }
  return severities[tipo] || 'secondary'
}

function getEstadoSeverity(estado) {
  const severities = {
    'Pendiente': 'warning',
    'Confirmada': 'success',
    'Cancelada': 'danger',
    'Completada': 'info'
  }
  return severities[estado] || 'secondary'
}

function getEstadoPagoSeverity(estado) {
  const severities = {
    'Pendiente': 'warning',
    'Pagado': 'success',
    'Vencido': 'danger',
    'Cancelado': 'secondary'
  }
  return severities[estado] || 'secondary'
}

function getMetodoPagoIcon(metodo) {
  return metodo === 'MercadoPago' ? 'pi pi-credit-card' : 'pi pi-money-bill'
}

function getTurnoSeverity(turno) {
  if (!turno.disponible) return 'secondary'
  if (reserva.value.horaInicio === turno.horaInicio) return 'success'
  return 'primary'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-AR')
}

function formatDateForApi(date) {
  if (!date) return null
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

async function loadReservas() {
  loading.value = true
  try {
    const params = {}
    if (filtros.value.socioId) params.socioId = filtros.value.socioId
    if (filtros.value.espacioId) params.espacioId = filtros.value.espacioId
    if (filtros.value.estado) params.estado = filtros.value.estado
    if (filtros.value.estadoPago) params.estadoPago = filtros.value.estadoPago
    if (filtros.value.fechaDesde) params.fechaDesde = formatDateForApi(filtros.value.fechaDesde)
    if (filtros.value.fechaHasta) params.fechaHasta = formatDateForApi(filtros.value.fechaHasta)
    
    reservas.value = await reservasService.getAll(params)
    reservasSeleccionadas.value = []
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las reservas', life: 3000 })
  } finally {
    loading.value = false
  }
}

async function loadResumenPagos() {
  try {
    resumenPagos.value = await reservasService.getResumenPagos()
  } catch (error) {
    console.error('Error loading resumen:', error)
  }
}

async function loadEspacios() {
  try {
    espacios.value = await espaciosService.getAll()
  } catch (error) {
    console.error('Error loading espacios:', error)
  }
}

async function loadSocios() {
  try {
    socios.value = await sociosService.getAll()
  } catch (error) {
    console.error('Error loading socios:', error)
  }
}

async function loadTurnos() {
  if (!reserva.value.espacioId || !reserva.value.fecha) {
    turnos.value = []
    return
  }
  
  try {
    const fecha = formatDateForApi(reserva.value.fecha)
    turnos.value = await espaciosService.getTurnosDisponibles(reserva.value.espacioId, fecha)
    reserva.value.horaInicio = null
    reserva.value.horaFin = null
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los turnos', life: 3000 })
  }
}

function onEspacioChange() {
  turnos.value = []
  reserva.value.horaInicio = null
  reserva.value.horaFin = null
  if (reserva.value.fecha) {
    loadTurnos()
  }
}

function selectTurno(turno) {
  if (!turno.disponible) return
  reserva.value.horaInicio = turno.horaInicio
  reserva.value.horaFin = turno.horaFin
}

function calcularPrecio() {
  if (!espacioSeleccionado.value || !reserva.value.horaInicio || !reserva.value.horaFin) return 0
  
  const inicio = reserva.value.horaInicio.split(':').map(Number)
  const fin = reserva.value.horaFin.split(':').map(Number)
  const horasInicio = inicio[0] + inicio[1] / 60
  const horasFin = fin[0] + fin[1] / 60
  const duracion = horasFin - horasInicio
  
  return espacioSeleccionado.value.precioPorHora * duracion
}

function openNew() {
  reserva.value = {}
  turnos.value = []
  submitted.value = false
  reservaDialog.value = true
}

function hideDialog() {
  reservaDialog.value = false
  submitted.value = false
}

async function saveReserva() {
  submitted.value = true

  if (!reserva.value.socioId || !reserva.value.espacioId || !reserva.value.fecha || !reserva.value.horaInicio) {
    return
  }

  saving.value = true
  try {
    await reservasService.createAdmin({
      socioId: reserva.value.socioId,
      espacioId: reserva.value.espacioId,
      fecha: formatDateForApi(reserva.value.fecha),
      horaInicio: reserva.value.horaInicio,
      horaFin: reserva.value.horaFin,
      observaciones: reserva.value.observaciones
    })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva creada', life: 3000 })
    hideDialog()
    await loadReservas()
    await loadResumenPagos()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al crear la reserva', 
      life: 3000 
    })
  } finally {
    saving.value = false
  }
}

async function confirmarReserva(data) {
  try {
    await reservasService.updateEstado(data.id, { estado: 'Confirmada' })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva confirmada', life: 3000 })
    await loadReservas()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo confirmar la reserva', life: 3000 })
  }
}

async function cancelarReserva(data) {
  confirm.require({
    message: '¿Está seguro de cancelar esta reserva?',
    header: 'Confirmar cancelación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        await reservasService.updateEstado(data.id, { estado: 'Cancelada', observaciones: 'Cancelada por administrador' })
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva cancelada', life: 3000 })
        await loadReservas()
        await loadResumenPagos()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar la reserva', life: 3000 })
      }
    }
  })
}

async function completarReserva(data) {
  try {
    await reservasService.updateEstado(data.id, { estado: 'Completada' })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva completada', life: 3000 })
    await loadReservas()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la reserva', life: 3000 })
  }
}

function confirmDelete(data) {
  confirm.require({
    message: '¿Está seguro de eliminar esta reserva?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await reservasService.delete(data.id)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva eliminada', life: 3000 })
        await loadReservas()
        await loadResumenPagos()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la reserva', life: 3000 })
      }
    }
  })
}

// Funciones de pago
function mostrarPendientesEfectivo() {
  reservasParaConfirmar.value = []
  pendientesEfectivoDialog.value = true
}

async function confirmarPagoEfectivo(data) {
  confirm.require({
    message: `¿Confirmar el pago en efectivo de $${data.monto?.toLocaleString()} de ${data.socioNombre}?`,
    header: 'Confirmar pago',
    icon: 'pi pi-money-bill',
    acceptClass: 'p-button-success',
    accept: async () => {
      try {
        await reservasService.confirmarPagoEfectivo([data.id])
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pago confirmado', life: 3000 })
        await loadReservas()
        await loadResumenPagos()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo confirmar el pago', life: 3000 })
      }
    }
  })
}

async function confirmarPagosSeleccionados() {
  if (reservasParaConfirmar.value.length === 0) return

  confirmandoPagos.value = true
  try {
    const ids = reservasParaConfirmar.value.map(r => r.id)
    await reservasService.confirmarPagoEfectivo(ids)
    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: `${ids.length} pagos confirmados`, 
      life: 3000 
    })
    pendientesEfectivoDialog.value = false
    await loadReservas()
    await loadResumenPagos()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron confirmar los pagos', life: 3000 })
  } finally {
    confirmandoPagos.value = false
  }
}

async function confirmarPagosEfectivoMultiple() {
  if (reservasSeleccionadas.value.length === 0) return

  confirmandoPagos.value = true
  try {
    const ids = reservasSeleccionadas.value.map(r => r.id)
    await reservasService.confirmarPagoEfectivo(ids)
    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: `${ids.length} pagos confirmados`, 
      life: 3000 
    })
    await loadReservas()
    await loadResumenPagos()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron confirmar los pagos', life: 3000 })
  } finally {
    confirmandoPagos.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadEspacios(), loadSocios(), loadResumenPagos()])
  await loadReservas()
})
</script>

<style scoped>
/* Stat cards */
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: rgba(30, 30, 50, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 1.5rem;
  color: white;
}

.stat-total .stat-icon { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.stat-success .stat-icon { background: linear-gradient(135deg, #22c55e, #16a34a); }
.stat-warning .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-efectivo .stat-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.stat-amount {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.25rem;
}
</style>
