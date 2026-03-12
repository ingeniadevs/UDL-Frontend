<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Pagos</h1>
      <div class="flex gap-2">
        <Button label="Generar Cuota Mensual" icon="pi pi-calendar" severity="info" @click="openGenerarCuota" />
        <Button label="Nuevo Pago" icon="pi pi-plus" @click="openNew" />
      </div>
    </div>

    <!-- Pagos esperando confirmación de efectivo -->
    <div v-if="pagosPendientesConfirmacion.length > 0" class="mb-4">
      <div class="card" style="border: 2px solid #f59e0b; background: linear-gradient(135deg, #1a1a1a 0%, #2d2a1a 100%);">
        <div class="flex align-items-center justify-content-between mb-3">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-clock text-2xl text-yellow-400"></i>
            <h3 class="text-xl font-bold text-yellow-400 m-0">Pagos esperando confirmación de efectivo</h3>
            <Tag :value="pagosPendientesConfirmacion.length.toString()" severity="warning" />
          </div>
          <Button 
            v-if="selectedPendingPagos.length > 0"
            :label="`Confirmar seleccionados (${selectedPendingPagos.length})`" 
            icon="pi pi-check" 
            severity="success"
            @click="confirmarMultiplesEfectivo"
            :loading="confirmandoMultiple"
          />
        </div>
        <DataTable 
          :value="pagosPendientesConfirmacion" 
          v-model:selection="selectedPendingPagos"
          dataKey="id"
          responsiveLayout="scroll"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column field="socioNombre" header="Socio" sortable></Column>
          <Column field="concepto" header="Concepto"></Column>
          <Column header="Monto">
            <template #body="slotProps">
              <span class="font-bold text-green-400">${{ slotProps.data.monto?.toLocaleString() }}</span>
            </template>
          </Column>
          <Column header="Vencimiento">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.fechaVencimiento) }}
            </template>
          </Column>
          <Column header="Estado">
            <template #body="slotProps">
              <Tag 
                :severity="slotProps.data.estado === 'vencido' ? 'danger' : 'warning'" 
                :value="slotProps.data.estado === 'vencido' ? 'Vencido' : 'Pendiente'" 
              />
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <Button 
                icon="pi pi-check" 
                label="Confirmar"
                size="small"
                severity="success"
                @click="confirmarPagoEfectivoSingle(slotProps.data)"
                :loading="procesandoPago === slotProps.data.id"
              />
            </template>
          </Column>
        </DataTable>
        <div v-if="selectedPendingPagos.length > 0" class="mt-3 p-3 border-round" style="background: rgba(245, 158, 11, 0.1)">
          <div class="flex justify-content-between align-items-center">
            <span class="text-gray-300">{{ selectedPendingPagos.length }} pago(s) seleccionado(s)</span>
            <span class="text-xl font-bold text-yellow-400">Total: ${{ totalSeleccionadoPendientes.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid mb-4">
      <div class="col-12 md:col-4">
        <div class="stat-card-green">
          <div class="flex align-items-center gap-3">
            <div class="stat-icon-green">
              <i class="pi pi-check-circle text-2xl"></i>
            </div>
            <div>
              <span class="block text-gray-400">Pagados</span>
              <span class="text-xl font-bold text-white">${{ totales.pagado.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-4">
        <div class="stat-card-yellow">
          <div class="flex align-items-center gap-3">
            <div class="stat-icon-yellow">
              <i class="pi pi-clock text-2xl"></i>
            </div>
            <div>
              <span class="block text-gray-400">Pendientes</span>
              <span class="text-xl font-bold text-white">${{ totales.pendiente.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-4">
        <div class="stat-card-red">
          <div class="flex align-items-center gap-3">
            <div class="stat-icon-red">
              <i class="pi pi-exclamation-circle text-2xl"></i>
            </div>
            <div>
              <span class="block text-gray-400">Vencidos</span>
              <span class="text-xl font-bold text-white">${{ totales.vencido.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <DataTable 
        :value="pagos" 
        :loading="loading"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 25]"
        dataKey="id"
        :globalFilterFields="['socioNombre', 'concepto']"
        v-model:filters="filters"
        responsiveLayout="scroll"
      >
        <template #header>
          <div class="flex flex-wrap justify-content-between gap-2">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Buscar..." />
            </span>
            <div class="flex gap-2">
              <Dropdown 
                v-model="socioFilter" 
                :options="socios" 
                optionLabel="nombre" 
                optionValue="id"
                placeholder="Filtrar por socio"
                class="w-15rem"
                showClear
                filter
              />
              <Dropdown 
                v-model="estadoFilter" 
                :options="estadoOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Filtrar por estado"
                class="w-12rem"
                showClear
              />
            </div>
          </div>
        </template>
        
        <Column field="socioNombre" header="Socio" sortable style="min-width: 150px"></Column>
        <Column field="concepto" header="Concepto" sortable style="min-width: 150px"></Column>
        <Column header="Monto" sortable style="min-width: 100px">
          <template #body="slotProps">
            ${{ slotProps.data.monto?.toLocaleString() }}
          </template>
        </Column>
        <Column header="Vencimiento" sortable style="min-width: 120px">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.fechaVencimiento) }}
          </template>
        </Column>
        <Column header="Fecha Pago" style="min-width: 120px">
          <template #body="slotProps">
            {{ slotProps.data.fechaPago ? formatDate(slotProps.data.fechaPago) : '-' }}
          </template>
        </Column>
        <Column header="Estado" style="min-width: 100px">
          <template #body="slotProps">
            <Tag :severity="getEstadoSeverity(slotProps.data.estado)" 
                 :value="slotProps.data.estado" />
          </template>
        </Column>
        <Column header="Método" style="min-width: 100px">
          <template #body="slotProps">
            <Tag v-if="slotProps.data.metodoPago" 
                 :severity="slotProps.data.metodoPago === 'efectivo' ? 'info' : 'warning'" 
                 :value="slotProps.data.metodoPago === 'efectivo' ? 'Efectivo' : 'MercadoPago'" />
            <span v-else class="text-gray-500">-</span>
          </template>
        </Column>
        <Column header="Acciones" style="min-width: 200px">
          <template #body="slotProps">
            <Button 
              v-if="slotProps.data.estado === 'pendiente' || slotProps.data.estado === 'vencido'"
              icon="pi pi-money-bill" 
              text 
              rounded 
              class="mr-1"
              severity="success"
              @click="confirmarPagoEfectivo(slotProps.data)"
              v-tooltip.top="'Cobrar en efectivo'"
              :loading="procesandoPago === slotProps.data.id"
            />
            <Button 
              icon="pi pi-pencil" 
              text 
              rounded 
              class="mr-1"
              severity="info"
              @click="editPago(slotProps.data)"
              v-tooltip.top="'Editar'"
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

    <!-- Create/Edit Dialog -->
    <Dialog 
      v-model:visible="pagoDialog" 
      :header="isEditing ? 'Editar Pago' : 'Nuevo Pago'" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-column gap-4 pt-3">
        <div class="field" v-if="!isEditing">
          <label for="socio" class="font-medium text-gray-300">Socio *</label>
          <Dropdown 
            id="socio"
            v-model="pago.socioId" 
            :options="socios" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Seleccione un socio"
            class="w-full"
            filter
            :class="{ 'p-invalid': submitted && !pago.socioId }"
          />
          <small v-if="submitted && !pago.socioId" class="p-error">El socio es requerido</small>
        </div>
        
        <div class="field">
          <label for="concepto" class="font-medium text-gray-300">Concepto *</label>
          <InputText id="concepto" v-model="pago.concepto" class="w-full" :class="{ 'p-invalid': submitted && !pago.concepto }" />
          <small v-if="submitted && !pago.concepto" class="p-error">El concepto es requerido</small>
        </div>

        <div class="field">
          <label for="monto" class="font-medium text-gray-300">Monto *</label>
          <InputNumber id="monto" v-model="pago.monto" mode="currency" currency="USD" class="w-full" />
        </div>

        <div class="field">
          <label for="vencimiento" class="font-medium text-gray-300">Fecha de Vencimiento *</label>
          <Calendar id="vencimiento" v-model="pago.fechaVencimiento" dateFormat="dd/mm/yy" class="w-full" showIcon />
        </div>

        <div class="field" v-if="isEditing">
          <label for="estado" class="font-medium text-gray-300">Estado</label>
          <Dropdown 
            id="estado"
            v-model="pago.estado" 
            :options="estadoOptions" 
            optionLabel="label" 
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="savePago" :loading="saving" />
      </template>
    </Dialog>

    <!-- Generar Cuota Mensual Dialog -->
    <Dialog 
      v-model:visible="generarCuotaDialog" 
      header="Generar Cuota Mensual" 
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-column gap-4 pt-3">
        <div class="field">
          <label for="socioGenerar" class="font-medium text-gray-300">Socio *</label>
          <Dropdown 
            id="socioGenerar"
            v-model="cuotaData.socioId" 
            :options="socios" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Seleccione un socio"
            class="w-full"
            filter
            @change="loadCuotaTotal"
          />
        </div>

        <!-- Detalle de cuota -->
        <div v-if="cuotaTotal" class="p-3 border-round" style="background: #1f1f1f;">
          <h4 class="text-white mt-0 mb-3">Detalle de Cuota</h4>
          <div class="flex justify-content-between mb-2">
            <span class="text-gray-400">Cuota Base:</span>
            <span class="text-white">${{ cuotaTotal.cuotaBase?.toLocaleString() }}</span>
          </div>
          <div v-if="cuotaTotal.disciplinas?.length > 0">
            <span class="text-gray-400 text-sm">Disciplinas activas:</span>
            <div v-for="disc in cuotaTotal.disciplinas" :key="disc.id" class="flex justify-content-between ml-3 mt-1">
              <span class="text-gray-300">{{ disc.nombre }}:</span>
              <span class="text-white">${{ disc.cuotaMensual?.toLocaleString() }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500 text-sm ml-3">Sin disciplinas activas</div>
          <hr class="my-3" style="border-color: #333;">
          <div class="flex justify-content-between">
            <span class="text-white font-bold">Total:</span>
            <span class="text-green-400 font-bold text-xl">${{ cuotaTotal.cuotaTotal?.toLocaleString() }}</span>
          </div>
        </div>

        <div class="grid">
          <div class="col-6">
            <label for="mes" class="font-medium text-gray-300">Mes *</label>
            <Dropdown 
              id="mes"
              v-model="cuotaData.mes" 
              :options="meses" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Mes"
              class="w-full"
            />
          </div>
          <div class="col-6">
            <label for="anio" class="font-medium text-gray-300">Año *</label>
            <InputNumber id="anio" v-model="cuotaData.año" class="w-full" :min="2024" :max="2030" />
          </div>
        </div>

        <div class="field">
          <label for="vencimientoGenerar" class="font-medium text-gray-300">Fecha de Vencimiento *</label>
          <Calendar id="vencimientoGenerar" v-model="cuotaData.fechaVencimiento" dateFormat="dd/mm/yy" class="w-full" showIcon />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="generarCuotaDialog = false" />
        <Button 
          label="Generar Cuota" 
          icon="pi pi-check" 
          @click="generarCuota" 
          :loading="generandoCuota"
          :disabled="!cuotaData.socioId || !cuotaTotal"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { pagosService, sociosService } from '@/services'
import { FilterMatchMode } from 'primevue/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'

const toast = useToast()
const confirm = useConfirm()

const pagos = ref([])
const allPagos = ref([])
const socios = ref([])
const loading = ref(false)
const pagoDialog = ref(false)
const submitted = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const estadoFilter = ref(null)
const socioFilter = ref(null)

const pago = ref({})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// Pago en efectivo
const procesandoPago = ref(null)
const selectedPendingPagos = ref([])
const confirmandoMultiple = ref(false)

// Generar cuota mensual
const generarCuotaDialog = ref(false)
const generandoCuota = ref(false)
const cuotaTotal = ref(null)
const cuotaData = ref({
  socioId: null,
  mes: new Date().getMonth() + 1,
  año: new Date().getFullYear(),
  fechaVencimiento: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10) // día 10 del mes siguiente
})

const meses = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
]

const estadoOptions = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Pagado', value: 'pagado' },
  { label: 'Vencido', value: 'vencido' }
]

const totales = computed(() => {
  const result = { pagado: 0, pendiente: 0, vencido: 0 }
  allPagos.value.forEach(p => {
    const estado = p.estado?.toLowerCase()
    if (estado === 'pagado') result.pagado += p.monto
    else if (estado === 'pendiente') result.pendiente += p.monto
    else if (estado === 'vencido') result.vencido += p.monto
  })
  return result
})

const pagosPendientesConfirmacion = computed(() => {
  return allPagos.value.filter(p => p.pendienteConfirmacionEfectivo === true)
})

const totalSeleccionadoPendientes = computed(() => {
  return selectedPendingPagos.value.reduce((sum, p) => sum + (p.monto || 0), 0)
})

watch(estadoFilter, (val) => {
  applyFilters()
})

watch(socioFilter, (val) => {
  loadData()
})

function applyFilters() {
  let filtered = [...allPagos.value]
  
  if (estadoFilter.value) {
    filtered = filtered.filter(p => p.estado === estadoFilter.value)
  }
  
  pagos.value = filtered
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES')
}

function getEstadoSeverity(estado) {
  switch (estado?.toLowerCase()) {
    case 'pagado': return 'success'
    case 'pendiente': return 'warning'
    case 'vencido': return 'danger'
    default: return 'info'
  }
}

async function loadData() {
  loading.value = true
  try {
    const [pagosData, sociosData] = await Promise.all([
      pagosService.getAll(socioFilter.value),
      sociosService.getAll()
    ])
    allPagos.value = pagosData
    applyFilters()
    socios.value = sociosData
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 })
  } finally {
    loading.value = false
  }
}

function openNew() {
  pago.value = { monto: 0, fechaVencimiento: new Date() }
  submitted.value = false
  isEditing.value = false
  pagoDialog.value = true
}

function editPago(data) {
  pago.value = { 
    ...data,
    fechaVencimiento: new Date(data.fechaVencimiento)
  }
  isEditing.value = true
  submitted.value = false
  pagoDialog.value = true
}

function hideDialog() {
  pagoDialog.value = false
  submitted.value = false
}

async function savePago() {
  submitted.value = true

  if (!pago.value.concepto || !pago.value.monto) {
    return
  }

  if (!isEditing.value && !pago.value.socioId) {
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await pagosService.update(pago.value.id, {
        concepto: pago.value.concepto,
        monto: pago.value.monto,
        fechaVencimiento: pago.value.fechaVencimiento,
        estado: pago.value.estado
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pago actualizado', life: 3000 })
    } else {
      await pagosService.create({
        socioId: pago.value.socioId,
        concepto: pago.value.concepto,
        monto: pago.value.monto,
        fechaVencimiento: pago.value.fechaVencimiento
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pago creado', life: 3000 })
    }
    hideDialog()
    await loadData()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al guardar el pago', 
      life: 3000 
    })
  } finally {    saving.value = false
  }
}

function confirmDelete(data) {
  confirm.require({
    message: `¿Está seguro de eliminar el pago "${data.concepto}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await pagosService.delete(data.id)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pago eliminado', life: 3000 })
        await loadData()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el pago', life: 3000 })
      }
    }
  })
}

function confirmarPagoEfectivo(data) {
  confirm.require({
    message: `¿Registrar pago en efectivo de $${data.monto?.toLocaleString()} por "${data.concepto}"?`,
    header: 'Confirmar pago en efectivo',
    icon: 'pi pi-money-bill',
    acceptClass: 'p-button-success',
    acceptLabel: 'Sí, cobrar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      procesandoPago.value = data.id
      try {
        await pagosService.registrarPagoEfectivo(data.id)
        toast.add({ 
          severity: 'success', 
          summary: 'Pago registrado', 
          detail: `Se registró el pago en efectivo de $${data.monto?.toLocaleString()}`, 
          life: 3000 
        })
        await loadData()
      } catch (error) {
        toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.response?.data?.message || 'No se pudo registrar el pago', 
          life: 3000 
        })
      } finally {
        procesandoPago.value = null
      }
    }
  })
}

async function confirmarPagoEfectivoSingle(data) {
  procesandoPago.value = data.id
  try {
    await pagosService.confirmarPagosEfectivo([data.id])
    toast.add({ 
      severity: 'success', 
      summary: 'Pago confirmado', 
      detail: `Se confirmó el pago en efectivo de $${data.monto?.toLocaleString()}`, 
      life: 3000 
    })
    await loadData()
    selectedPendingPagos.value = []
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'No se pudo confirmar el pago', 
      life: 3000 
    })
  } finally {
    procesandoPago.value = null
  }
}

async function confirmarMultiplesEfectivo() {
  if (selectedPendingPagos.value.length === 0) return
  
  confirmandoMultiple.value = true
  try {
    const pagoIds = selectedPendingPagos.value.map(p => p.id)
    const response = await pagosService.confirmarPagosEfectivo(pagoIds)
    toast.add({ 
      severity: 'success', 
      summary: 'Pagos confirmados', 
      detail: response.message || `Se confirmaron ${pagoIds.length} pago(s) en efectivo`, 
      life: 3000 
    })
    selectedPendingPagos.value = []
    await loadData()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'No se pudieron confirmar los pagos', 
      life: 3000 
    })
  } finally {
    confirmandoMultiple.value = false
  }
}

function openGenerarCuota() {
  cuotaData.value = {
    socioId: null,
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    fechaVencimiento: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10)
  }
  cuotaTotal.value = null
  generarCuotaDialog.value = true
}

async function loadCuotaTotal() {
  if (!cuotaData.value.socioId) {
    cuotaTotal.value = null
    return
  }
  
  try {
    cuotaTotal.value = await pagosService.getCuotaTotal(cuotaData.value.socioId)
  } catch (error) {
    console.error('Error loading cuota total:', error)
    cuotaTotal.value = null
  }
}

async function generarCuota() {
  if (!cuotaData.value.socioId || !cuotaTotal.value) return
  
  generandoCuota.value = true
  try {
    await pagosService.generarCuotaMensual(cuotaData.value.socioId, {
      mes: cuotaData.value.mes,
      anio: cuotaData.value.año,
      fechaVencimiento: cuotaData.value.fechaVencimiento
    })
    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: `Cuota generada por $${cuotaTotal.value.cuotaTotal.toLocaleString()}`, 
      life: 3000 
    })
    generarCuotaDialog.value = false
    await loadData()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al generar la cuota', 
      life: 3000 
    })
  } finally {
    generandoCuota.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-card-green,
.stat-card-yellow,
.stat-card-red {
  background: #171717;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.25rem;
}

.stat-card-green {
  border-left: 3px solid #22c55e;
}

.stat-card-yellow {
  border-left: 3px solid #f59e0b;
}

.stat-card-red {
  border-left: 3px solid #ef4444;
}

.stat-icon-green,
.stat-icon-yellow,
.stat-icon-red {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-green {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.stat-icon-yellow {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.stat-icon-red {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}
</style>
