<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Reservar Espacio</h1>
    </div>

    <!-- Selección de Espacio con Imágenes -->
    <div class="grid mb-4">
      <div v-for="espacio in espacios" :key="espacio.id" class="col-12 md:col-6 lg:col-4">
        <div 
          class="espacio-card cursor-pointer h-full transition-all transition-duration-200"
          :class="{ 'selected': selectedEspacio?.id === espacio.id }"
          @click="selectEspacio(espacio)"
        >
          <!-- Imagen del espacio -->
          <div class="espacio-image-wrapper">
            <img 
              v-if="espacio.imagen" 
              :src="espacio.imagen" 
              :alt="espacio.nombre"
              class="espacio-image"
            />
            <div v-else class="espacio-placeholder">
              <i class="pi pi-building"></i>
            </div>
            
            <!-- Badge de selección -->
            <div v-if="selectedEspacio?.id === espacio.id" class="selected-badge">
              <i class="pi pi-check"></i> Seleccionado
            </div>

            <!-- Badge de aprobación -->
            <div v-if="espacio.requiereAprobacion" class="approval-badge">
              <i class="pi pi-info-circle"></i> Requiere aprobación
            </div>
          </div>

          <!-- Info del espacio -->
          <div class="espacio-info">
            <div class="flex justify-content-between align-items-start mb-2">
              <div>
                <h3 class="espacio-name">{{ espacio.nombre }}</h3>
                <Tag :value="espacio.tipo" :severity="getTipoSeverity(espacio.tipo)" class="mt-1" />
              </div>
              <div class="text-right">
                <div class="espacio-price">${{ espacio.precioPorHora }}</div>
                <small class="text-gray-400">por hora</small>
              </div>
            </div>
            
            <p class="espacio-description">{{ espacio.descripcion || 'Sin descripción' }}</p>
            
            <div class="espacio-details">
              <div class="detail-item">
                <i class="pi pi-clock"></i>
                <span>{{ espacio.horaApertura }} - {{ espacio.horaCierre }}</span>
              </div>
              <div class="detail-item" v-if="espacio.duracionTurno">
                <i class="pi pi-stopwatch"></i>
                <span>{{ espacio.duracionTurno }} min/turno</span>
              </div>
              <div class="detail-item" v-if="espacio.capacidad">
                <i class="pi pi-users"></i>
                <span>{{ espacio.capacidad }} personas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Reserva -->
    <div v-if="selectedEspacio" class="card reserva-panel">
      <div class="reserva-header">
        <div class="flex align-items-center gap-3">
          <div class="header-image">
            <img 
              v-if="selectedEspacio.imagen" 
              :src="selectedEspacio.imagen" 
              :alt="selectedEspacio.nombre"
            />
            <div v-else class="header-placeholder">
              <i class="pi pi-building"></i>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-bold text-white m-0">{{ selectedEspacio.nombre }}</h2>
            <Tag :value="selectedEspacio.tipo" :severity="getTipoSeverity(selectedEspacio.tipo)" class="mt-1" />
          </div>
        </div>
      </div>

      <div class="grid mt-4">
        <div class="col-12 md:col-4">
          <label class="font-medium text-gray-300 block mb-2">Selecciona una fecha</label>
          <Calendar 
            v-model="selectedDate" 
            dateFormat="dd/mm/yy" 
            class="w-full" 
            :minDate="new Date()"
            showIcon
            inline
            @date-select="loadTurnos"
          />
        </div>

        <div class="col-12 md:col-8">
          <label class="font-medium text-gray-300 block mb-2">Turnos disponibles</label>
          
          <div v-if="loadingTurnos" class="flex justify-content-center py-4">
            <ProgressSpinner style="width: 50px; height: 50px" />
          </div>
          
          <div v-else-if="turnos.length === 0 && selectedDate" class="text-center py-4 text-gray-400">
            <i class="pi pi-calendar-times text-4xl mb-2"></i>
            <p>No hay turnos disponibles para esta fecha</p>
          </div>

          <div v-else-if="turnos.length === 0" class="text-center py-4 text-gray-400">
            <i class="pi pi-calendar text-4xl mb-2"></i>
            <p>Selecciona una fecha para ver los turnos disponibles</p>
          </div>
          
          <div v-else class="turnos-grid">
            <div v-for="turno in turnos" :key="turno.horaInicio" class="turno-item">
              <Button 
                :label="turno.horaInicio + ' - ' + turno.horaFin"
                :severity="getTurnoSeverity(turno)"
                :outlined="selectedTurno?.horaInicio !== turno.horaInicio"
                :disabled="!turno.disponible"
                class="w-full"
                @click="selectTurno(turno)"
              />
            </div>
          </div>

          <!-- Resumen de reserva -->
          <div v-if="selectedTurno" class="resumen-reserva mt-4">
            <h3 class="text-lg font-bold text-white mb-3">
              <i class="pi pi-bookmark mr-2"></i>Resumen de tu reserva
            </h3>
            
            <div class="grid">
              <div class="col-6">
                <div class="resumen-item">
                  <span class="label">Espacio</span>
                  <span class="value">{{ selectedEspacio.nombre }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="resumen-item">
                  <span class="label">Fecha</span>
                  <span class="value">{{ formatDate(selectedDate) }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="resumen-item">
                  <span class="label">Horario</span>
                  <span class="value">{{ selectedTurno.horaInicio }} - {{ selectedTurno.horaFin }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="resumen-item">
                  <span class="label">Total a pagar</span>
                  <span class="value price">${{ calcularPrecio().toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="mt-3">
              <label class="font-medium text-gray-300 block mb-2">Observaciones (opcional)</label>
              <Textarea v-model="observaciones" rows="2" class="w-full" placeholder="Alguna nota adicional..." />
            </div>

            <div class="mt-4">
              <Button 
                label="Confirmar Reserva" 
                icon="pi pi-check" 
                class="w-full confirmar-btn" 
                size="large"
                @click="crearReserva"
                :loading="creatingReserva"
              />
              <small v-if="selectedEspacio.requiereAprobacion" class="approval-notice">
                <i class="pi pi-info-circle mr-1"></i>
                Esta reserva requiere aprobación del administrador
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mis Reservas con Pagos -->
    <div class="card mt-4">
      <div class="flex align-items-center justify-content-between mb-4">
        <h2 class="text-xl font-bold text-white m-0">
          <i class="pi pi-calendar mr-2"></i>Mis Reservas
        </h2>
        <div class="flex gap-2">
          <Button 
            v-if="reservasSeleccionadas.length > 0"
            :label="`Pagar ${reservasSeleccionadas.length} reserva(s) - $${totalSeleccionado.toLocaleString()}`"
            icon="pi pi-wallet" 
            @click="abrirModalPago"
            severity="success"
          />
          <Button icon="pi pi-refresh" text rounded @click="loadMisReservas" v-tooltip.left="'Actualizar'" />
        </div>
      </div>

      <DataTable 
        :value="misReservas" 
        :loading="loadingReservas"
        :paginator="true"
        :rows="5"
        v-model:selection="reservasSeleccionadas"
        dataKey="id"
        responsiveLayout="scroll"
        class="reservas-table"
      >
        <template #empty>
          <div class="text-center py-4 text-gray-400">
            <i class="pi pi-calendar-times text-4xl mb-2 block"></i>
            No tienes reservas registradas
          </div>
        </template>

        <Column selectionMode="multiple" headerStyle="width: 3rem" :selectable="canSelect"></Column>
        
        <Column header="Espacio" style="min-width: 200px">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <div class="reserva-espacio-image">
                <img 
                  v-if="slotProps.data.espacioImagen" 
                  :src="slotProps.data.espacioImagen" 
                  :alt="slotProps.data.espacioNombre"
                />
                <div v-else class="reserva-espacio-placeholder">
                  <i class="pi pi-building"></i>
                </div>
              </div>
              <div>
                <div class="text-white font-medium">{{ slotProps.data.espacioNombre }}</div>
                <Tag :value="slotProps.data.espacioTipo" :severity="getTipoSeverity(slotProps.data.espacioTipo)" size="small" />
              </div>
            </div>
          </template>
        </Column>
        <Column header="Fecha" style="min-width: 120px">
          <template #body="slotProps">
            {{ formatDateShort(slotProps.data.fecha) }}
          </template>
        </Column>
        <Column header="Horario" style="min-width: 120px">
          <template #body="slotProps">
            <i class="pi pi-clock mr-1 text-gray-400"></i>
            {{ slotProps.data.horaInicio }} - {{ slotProps.data.horaFin }}
          </template>
        </Column>
        <Column header="Monto" style="min-width: 100px">
          <template #body="slotProps">
            <span class="font-bold text-primary">${{ slotProps.data.monto?.toLocaleString() }}</span>
          </template>
        </Column>
        <Column header="Estado" style="min-width: 120px">
          <template #body="slotProps">
            <Tag :severity="getEstadoSeverity(slotProps.data.estado)" :value="slotProps.data.estado" />
          </template>
        </Column>
        <Column header="Pago" style="min-width: 140px">
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
            </div>
          </template>
        </Column>
        <Column header="Acciones" style="min-width: 150px">
          <template #body="slotProps">
            <Button 
              v-if="slotProps.data.estadoPago === 'Pendiente'"
              icon="pi pi-wallet" 
              text 
              rounded 
              severity="success"
              @click="pagarReservaIndividual(slotProps.data)"
              v-tooltip.top="'Pagar'"
            />
            <Button 
              v-if="canCancel(slotProps.data)"
              icon="pi pi-times" 
              text 
              rounded 
              severity="danger"
              @click="cancelarReserva(slotProps.data)"
              v-tooltip.top="'Cancelar reserva'"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal de Pago -->
    <Dialog 
      v-model:visible="pagoDialog" 
      header="Pagar Reservas" 
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-column gap-4 pt-3">
        <div class="surface-ground border-round p-3">
          <div class="flex justify-content-between align-items-center mb-2">
            <span class="text-gray-300">Reservas seleccionadas:</span>
            <span class="font-bold text-white">{{ reservasAPagar.length }}</span>
          </div>
          <div class="flex justify-content-between align-items-center">
            <span class="text-gray-300">Total a pagar:</span>
            <span class="text-2xl font-bold text-primary">${{ totalAPagar.toLocaleString() }}</span>
          </div>
        </div>

        <Divider />

        <div class="field">
          <label class="font-medium text-gray-300 block mb-3">Selecciona el método de pago</label>
          
          <div class="grid">
            <div class="col-6">
              <div 
                class="metodo-pago-card"
                :class="{ 'selected': metodoPagoSeleccionado === 'MercadoPago' }"
                @click="metodoPagoSeleccionado = 'MercadoPago'"
              >
                <i class="pi pi-credit-card text-3xl mb-2"></i>
                <span class="font-bold">MercadoPago</span>
                <small class="text-gray-400">Tarjeta o dinero en cuenta</small>
              </div>
            </div>
            <div class="col-6">
              <div 
                class="metodo-pago-card"
                :class="{ 'selected': metodoPagoSeleccionado === 'Efectivo' }"
                @click="metodoPagoSeleccionado = 'Efectivo'"
              >
                <i class="pi pi-money-bill text-3xl mb-2"></i>
                <span class="font-bold">Efectivo</span>
                <small class="text-gray-400">Pagar en el club</small>
              </div>
            </div>
          </div>
        </div>

        <Message v-if="metodoPagoSeleccionado === 'Efectivo'" severity="info" :closable="false">
          <small>Deberás acercarte al club para realizar el pago. La reserva quedará pendiente de confirmación.</small>
        </Message>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="pagoDialog = false" />
        <Button 
          :label="metodoPagoSeleccionado === 'MercadoPago' ? 'Pagar con MercadoPago' : 'Solicitar pago en efectivo'" 
          :icon="metodoPagoSeleccionado === 'MercadoPago' ? 'pi pi-credit-card' : 'pi pi-money-bill'" 
          @click="procesarPago"
          :loading="procesandoPago"
          :disabled="!metodoPagoSeleccionado"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { reservasService, espaciosService } from '@/services'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

const toast = useToast()
const confirm = useConfirm()

const espacios = ref([])
const selectedEspacio = ref(null)
const selectedDate = ref(null)
const selectedTurno = ref(null)
const turnos = ref([])
const observaciones = ref('')
const misReservas = ref([])
const reservasSeleccionadas = ref([])

const loadingTurnos = ref(false)
const loadingReservas = ref(false)
const creatingReserva = ref(false)

// Pago
const pagoDialog = ref(false)
const metodoPagoSeleccionado = ref(null)
const procesandoPago = ref(false)
const reservasAPagar = ref([])

const totalSeleccionado = computed(() => {
  return reservasSeleccionadas.value.reduce((sum, r) => sum + (r.monto || 0), 0)
})

const totalAPagar = computed(() => {
  return reservasAPagar.value.reduce((sum, r) => sum + (r.monto || 0), 0)
})

function canSelect(data) {
  return data.estadoPago === 'Pendiente' && data.estado !== 'Cancelada'
}

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
  if (selectedTurno.value?.horaInicio === turno.horaInicio) return 'success'
  return 'primary'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDateShort(date) {
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDateForApi(date) {
  if (!date) return null
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

function canCancel(reserva) {
  return (reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada') && reserva.estadoPago !== 'Pagado'
}

async function loadEspacios() {
  try {
    espacios.value = await espaciosService.getAll(true)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los espacios', life: 3000 })
  }
}

async function loadMisReservas() {
  loadingReservas.value = true
  try {
    misReservas.value = await reservasService.getMisReservas()
    reservasSeleccionadas.value = []
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar tus reservas', life: 3000 })
  } finally {
    loadingReservas.value = false
  }
}

function selectEspacio(espacio) {
  selectedEspacio.value = espacio
  selectedDate.value = null
  selectedTurno.value = null
  turnos.value = []
  observaciones.value = ''
}

async function loadTurnos() {
  if (!selectedEspacio.value || !selectedDate.value) {
    turnos.value = []
    return
  }
  
  loadingTurnos.value = true
  selectedTurno.value = null
  
  try {
    const fecha = formatDateForApi(selectedDate.value)
    turnos.value = await espaciosService.getTurnosDisponibles(selectedEspacio.value.id, fecha)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los turnos', life: 3000 })
  } finally {
    loadingTurnos.value = false
  }
}

function selectTurno(turno) {
  if (!turno.disponible) return
  selectedTurno.value = turno
}

function calcularPrecio() {
  if (!selectedEspacio.value || !selectedTurno.value) return 0
  
  const inicio = selectedTurno.value.horaInicio.split(':').map(Number)
  const fin = selectedTurno.value.horaFin.split(':').map(Number)
  const horasInicio = inicio[0] + inicio[1] / 60
  const horasFin = fin[0] + fin[1] / 60
  const duracion = horasFin - horasInicio
  
  return selectedEspacio.value.precioPorHora * duracion
}

async function crearReserva() {
  if (!selectedEspacio.value || !selectedDate.value || !selectedTurno.value) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: 'Completa todos los campos', life: 3000 })
    return
  }

  creatingReserva.value = true
  try {
    await reservasService.create({
      espacioId: selectedEspacio.value.id,
      fecha: formatDateForApi(selectedDate.value),
      horaInicio: selectedTurno.value.horaInicio,
      horaFin: selectedTurno.value.horaFin,
      observaciones: observaciones.value
    })

    const mensaje = selectedEspacio.value.requiereAprobacion 
      ? 'Reserva solicitada. Pendiente de aprobación.'
      : 'Reserva confirmada exitosamente'

    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: mensaje, 
      life: 5000 
    })

    selectedTurno.value = null
    observaciones.value = ''
    await loadTurnos()
    await loadMisReservas()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al crear la reserva', 
      life: 3000 
    })
  } finally {
    creatingReserva.value = false
  }
}

async function cancelarReserva(reserva) {
  confirm.require({
    message: '¿Estás seguro de cancelar esta reserva?',
    header: 'Confirmar cancelación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await reservasService.cancelar(reserva.id)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva cancelada', life: 3000 })
        await loadMisReservas()
        if (selectedEspacio.value?.id === reserva.espacioId && selectedDate.value) {
          const reservaFecha = new Date(reserva.fecha).toDateString()
          const selectedFecha = new Date(selectedDate.value).toDateString()
          if (reservaFecha === selectedFecha) {
            await loadTurnos()
          }
        }
      } catch (error) {
        toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.response?.data?.message || 'No se pudo cancelar la reserva', 
          life: 3000 
        })
      }
    }
  })
}

// Funciones de pago
function abrirModalPago() {
  reservasAPagar.value = [...reservasSeleccionadas.value]
  metodoPagoSeleccionado.value = null
  pagoDialog.value = true
}

function pagarReservaIndividual(reserva) {
  reservasAPagar.value = [reserva]
  metodoPagoSeleccionado.value = null
  pagoDialog.value = true
}

async function procesarPago() {
  if (!metodoPagoSeleccionado.value) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: 'Selecciona un método de pago', life: 3000 })
    return
  }

  procesandoPago.value = true
  try {
    const reservaIds = reservasAPagar.value.map(r => r.id)

    if (metodoPagoSeleccionado.value === 'MercadoPago') {
      const response = reservaIds.length === 1
        ? await reservasService.initMercadoPago(reservaIds[0])
        : await reservasService.initMercadoPagoMultiple(reservaIds)
      
      // Redirigir a MercadoPago
      window.location.href = response.initPoint || response.sandboxInitPoint
    } else {
      // Pago en efectivo
      await reservasService.solicitarPagoEfectivo(reservaIds)
      toast.add({ 
        severity: 'success', 
        summary: 'Solicitud enviada', 
        detail: 'Acércate al club para completar el pago en efectivo', 
        life: 5000 
      })
      pagoDialog.value = false
      await loadMisReservas()
    }
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al procesar el pago', 
      life: 3000 
    })
  } finally {
    procesandoPago.value = false
  }
}

onMounted(async () => {
  await loadEspacios()
  await loadMisReservas()
  
  // Verificar si volvemos de MercadoPago
  const urlParams = new URLSearchParams(window.location.search)
  const status = urlParams.get('status')
  if (status === 'success') {
    toast.add({ severity: 'success', summary: 'Pago exitoso', detail: 'Tu pago fue procesado correctamente', life: 5000 })
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (status === 'failure') {
    toast.add({ severity: 'error', summary: 'Pago fallido', detail: 'El pago no pudo ser procesado', life: 5000 })
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})
</script>

<style scoped>
/* Espacio Card Styles */
.espacio-card {
  background: linear-gradient(145deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 40, 0.95));
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.espacio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(99, 102, 241, 0.3);
}

.espacio-card.selected {
  border-color: #6366f1;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.espacio-image-wrapper {
  height: 160px;
  position: relative;
  overflow: hidden;
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

.selected-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #6366f1;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.approval-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(245, 158, 11, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.espacio-info {
  padding: 1rem;
}

.espacio-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.espacio-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
}

.espacio-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0;
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

/* Reserva Panel */
.reserva-panel {
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.reserva-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
}

.header-placeholder i {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Turnos Grid */
.turnos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.turno-item {
  width: 100%;
}

/* Resumen Reserva */
.resumen-reserva {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
}

.resumen-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.resumen-item .label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.resumen-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.resumen-item .value.price {
  font-size: 1.5rem;
  color: #6366f1;
}

.confirmar-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
}

.confirmar-btn:hover {
  background: linear-gradient(135deg, #5558e3, #7c4fe6);
}

.approval-notice {
  display: block;
  margin-top: 0.75rem;
  color: #f59e0b;
  text-align: center;
}

/* Reservas Table */
.reserva-espacio-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.reserva-espacio-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reserva-espacio-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.2);
}

.reserva-espacio-placeholder i {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Método de pago cards */
.metodo-pago-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.metodo-pago-card:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.metodo-pago-card.selected {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

.metodo-pago-card i {
  color: #6366f1;
}

.metodo-pago-card span {
  color: #fff;
}

.metodo-pago-card small {
  font-size: 0.7rem;
}
</style>
