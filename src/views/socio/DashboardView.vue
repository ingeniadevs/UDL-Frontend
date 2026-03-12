<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-4">¡Bienvenido a UDL, {{ authStore.user?.nombre }}!</h1>
    
    <!-- Quick Stats -->
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-4">
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
          <span class="text-yellow-400 font-medium text-sm">${{ stats.montoPendiente?.toLocaleString() }} pendiente</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-4">
        <div class="stat-card">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-gray-400 font-medium mb-2">Disciplinas Activas</span>
              <div class="text-white font-bold text-3xl">{{ stats.disciplinasActivas }}</div>
            </div>
            <div class="stat-icon bg-red">
              <i class="pi pi-bookmark text-2xl"></i>
            </div>
          </div>
          <span class="text-gray-400 font-medium text-sm">Inscripciones</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-4">
        <div class="stat-card">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-gray-400 font-medium mb-2">Mi Cuota</span>
              <div class="text-white font-bold text-3xl">${{ stats.cuotaMensual?.toLocaleString() }}</div>
            </div>
            <div class="stat-icon bg-green">
              <i class="pi pi-dollar text-2xl"></i>
            </div>
          </div>
          <span class="text-green-400 font-medium text-sm">Mensual</span>
        </div>
      </div>
    </div>

    <!-- Recent Payments -->
    <div class="grid mt-4">
      <div class="col-12 lg:col-6">
        <div class="card">
          <div class="flex align-items-center justify-content-between mb-4">
            <h3 class="text-xl font-semibold m-0 text-white">Próximos Vencimientos</h3>
            <Button label="Ver todos" text size="small" @click="goToPagos" />
          </div>
          <DataTable :value="proximosPagos" :rows="5" class="p-datatable-sm">
            <template #empty>
              <div class="text-center text-gray-400 py-3">No hay pagos pendientes</div>
            </template>
            <Column field="concepto" header="Concepto"></Column>
            <Column header="Monto">
              <template #body="slotProps">
                ${{ slotProps.data.monto?.toLocaleString() }}
              </template>
            </Column>
            <Column header="Vencimiento">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.fechaVencimiento) }}
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

      <div class="col-12 lg:col-6">
        <div class="card">
          <div class="flex align-items-center justify-content-between mb-4">
            <h3 class="text-xl font-semibold m-0 text-white">Mis Disciplinas</h3>
          </div>
          <div v-if="disciplinas.length === 0" class="text-center text-gray-400 py-4">
            No estás inscrito en ninguna disciplina
          </div>
          <div v-else class="flex flex-column gap-3">
            <div v-for="disc in disciplinas" :key="disc.id" class="discipline-item flex align-items-center justify-content-between p-3 border-round">
              <div class="flex align-items-center gap-3">
                <div class="discipline-icon flex align-items-center justify-content-center border-circle">
                  <i class="pi pi-bookmark text-white"></i>
                </div>
                <div>
                  <span class="font-medium text-white">{{ disc.disciplinaNombre }}</span>
                  <div class="text-gray-400 text-sm">Desde {{ formatDate(disc.fechaInicio) }}</div>
                </div>
              </div>
              <Tag :severity="disc.activa ? 'success' : 'danger'" :value="disc.activa ? 'Activa' : 'Inactiva'" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sociosService } from '@/services'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  pagosPendientes: 0,
  montoPendiente: 0,
  disciplinasActivas: 0,
  cuotaMensual: 0
})

const proximosPagos = ref([])
const disciplinas = ref([])

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

function goToPagos() {
  router.push('/socio/pagos')
}

async function loadData() {
  try {
    const socioData = await sociosService.getById(authStore.user.id)
    
    stats.value.cuotaMensual = socioData.cuotaSocio || 0
    
    const pendientes = (socioData.pagos || []).filter(p => 
      p.estado?.toLowerCase() === 'pendiente' || p.estado?.toLowerCase() === 'vencido'
    )
    stats.value.pagosPendientes = pendientes.length
    stats.value.montoPendiente = pendientes.reduce((sum, p) => sum + p.monto, 0)
    
    proximosPagos.value = pendientes.slice(0, 5)
    
    disciplinas.value = socioData.inscripciones || []
    stats.value.disciplinasActivas = disciplinas.value.filter(d => d.activa).length
  } catch (error) {
    console.error('Error loading dashboard:', error)
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

.discipline-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
}

.discipline-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
}
</style>
