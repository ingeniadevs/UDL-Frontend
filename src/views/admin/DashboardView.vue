<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-4">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-gray-400 font-medium mb-2">Total Socios</span>
              <div class="text-white font-bold text-3xl">{{ stats.totalSocios }}</div>
            </div>
            <div class="stat-icon bg-red">
              <i class="pi pi-users text-2xl"></i>
            </div>
          </div>
          <span class="text-green-400 font-medium text-sm">{{ stats.sociosActivos }} activos</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-gray-400 font-medium mb-2">Disciplinas</span>
              <div class="text-white font-bold text-3xl">{{ stats.totalDisciplinas }}</div>
            </div>
            <div class="stat-icon bg-red">
              <i class="pi pi-bookmark text-2xl"></i>
            </div>
          </div>
          <span class="text-gray-400 font-medium text-sm">Disponibles</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-gray-400 font-medium mb-2">Pagos Pendientes</span>
              <div class="text-white font-bold text-3xl">{{ stats.pagosPendientes }}</div>
            </div>
            <div class="stat-icon bg-yellow">
              <i class="pi pi-clock text-2xl"></i>
            </div>
          </div>
          <span class="text-yellow-400 font-medium text-sm">${{ stats.montoPendiente?.toLocaleString() }}</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-gray-400 font-medium mb-2">Recaudado</span>
              <div class="text-white font-bold text-3xl">${{ formatNumber(stats.montoRecaudado) }}</div>
            </div>
            <div class="stat-icon bg-green">
              <i class="pi pi-dollar text-2xl"></i>
            </div>
          </div>
          <span class="text-green-400 font-medium text-sm">Este mes</span>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid mt-4">
      <div class="col-12 lg:col-6">
        <div class="card">
          <h3 class="text-xl font-semibold mb-4 text-white">Últimos Socios</h3>
          <DataTable :value="recentSocios" :rows="5" class="p-datatable-sm">
            <Column field="nombre" header="Nombre"></Column>
            <Column field="email" header="Email"></Column>
            <Column field="numeroSocio" header="# Socio"></Column>
            <Column header="Estado">
              <template #body="slotProps">
                <Tag :severity="slotProps.data.activo ? 'success' : 'danger'" 
                     :value="slotProps.data.activo ? 'Activo' : 'Inactivo'" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="col-12 lg:col-6">
        <div class="card">
          <h3 class="text-xl font-semibold mb-4 text-white">Últimos Pagos</h3>
          <DataTable :value="recentPagos" :rows="5" class="p-datatable-sm">
            <Column field="socioNombre" header="Socio"></Column>
            <Column field="concepto" header="Concepto"></Column>
            <Column header="Monto">
              <template #body="slotProps">
                ${{ slotProps.data.monto?.toLocaleString() }}
              </template>
            </Column>
            <Column header="Estado">
              <template #body="slotProps">
                <Tag :severity="getEstadoSeverity(slotProps.data.estado)" 
                     :value="slotProps.data.estado" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { sociosService, pagosService, disciplinasService } from '@/services'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

const stats = ref({
  totalSocios: 0,
  sociosActivos: 0,
  totalDisciplinas: 0,
  pagosPendientes: 0,
  montoPendiente: 0,
  montoRecaudado: 0
})

const recentSocios = ref([])
const recentPagos = ref([])

function formatNumber(num) {
  if (!num) return '0'
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toLocaleString()
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
  try {
    const [socios, pagos, disciplinas] = await Promise.all([
      sociosService.getAll(),
      pagosService.getAll(),
      disciplinasService.getAll()
    ])

    stats.value.totalSocios = socios.length
    stats.value.sociosActivos = socios.filter(s => s.activo).length
    stats.value.totalDisciplinas = disciplinas.length
    
    const pendientes = pagos.filter(p => p.estado?.toLowerCase() === 'pendiente')
    stats.value.pagosPendientes = pendientes.length
    stats.value.montoPendiente = pendientes.reduce((sum, p) => sum + p.monto, 0)
    
    const pagados = pagos.filter(p => p.estado?.toLowerCase() === 'pagado')
    stats.value.montoRecaudado = pagados.reduce((sum, p) => sum + p.monto, 0)

    recentSocios.value = socios.slice(0, 5)
    recentPagos.value = pagos.slice(0, 5)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-card {
  background: #171717;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.bg-red {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
}

.stat-icon.bg-yellow {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.bg-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}
</style>
