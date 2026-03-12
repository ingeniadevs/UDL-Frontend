<template>
  <div>
    <div class="flex align-items-center gap-3 mb-4">
      <Button icon="pi pi-arrow-left" text rounded @click="goBack" class="btn-back" />
      <h1 class="text-3xl font-bold text-white m-0">Detalle del Socio</h1>
    </div>

    <div v-if="loading" class="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>

    <div v-else-if="socio" class="grid">
      <!-- Info Card -->
      <div class="col-12 lg:col-4">
        <div class="card">
          <div class="flex flex-column align-items-center text-center">
            <Avatar 
              :label="socio.nombre?.charAt(0).toUpperCase()" 
              size="xlarge" 
              shape="circle" 
              class="avatar-red mb-3"
              style="width: 6rem; height: 6rem; font-size: 2rem"
            />
            <h2 class="text-2xl font-bold text-white mb-1">{{ socio.nombre }}</h2>
            <span class="text-gray-400 mb-3">{{ socio.email }}</span>
            <Tag :severity="socio.activo ? 'success' : 'danger'" 
                 :value="socio.activo ? 'Activo' : 'Inactivo'" 
                 class="mb-3" />
          </div>
          
          <Divider />
          
          <div class="flex flex-column gap-3">
            <div class="flex justify-content-between">
              <span class="text-gray-400">Número de Socio</span>
              <span class="font-medium text-white">{{ socio.numeroSocio }}</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-gray-400">Teléfono</span>
              <span class="font-medium text-white">{{ socio.telefono || '-' }}</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-gray-400">Cuota Mensual</span>
              <span class="font-medium text-white">${{ socio.cuotaSocio?.toLocaleString() }}</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-gray-400">Fecha de Alta</span>
              <span class="font-medium text-white">{{ formatDate(socio.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="col-12 lg:col-8">
        <TabView>
          <!-- Pagos -->
          <TabPanel header="Pagos">
            <DataTable :value="socio.pagos" class="p-datatable-sm">
              <template #empty>No hay pagos registrados</template>
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
          </TabPanel>

          <!-- Inscripciones -->
          <TabPanel header="Inscripciones">
            <DataTable :value="socio.inscripciones" class="p-datatable-sm">
              <template #empty>No hay inscripciones registradas</template>
              <Column field="disciplinaNombre" header="Disciplina"></Column>
              <Column header="Fecha Inicio">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.fechaInicio) }}
                </template>
              </Column>
              <Column header="Fecha Fin">
                <template #body="slotProps">
                  {{ slotProps.data.fechaFin ? formatDate(slotProps.data.fechaFin) : '-' }}
                </template>
              </Column>
              <Column header="Estado">
                <template #body="slotProps">
                  <Tag :severity="slotProps.data.activa ? 'success' : 'danger'" 
                       :value="slotProps.data.activa ? 'Activa' : 'Inactiva'" />
                </template>
              </Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
    </div>

    <div v-else class="card">
      <p class="text-center text-gray-400">Socio no encontrado</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sociosService } from '@/services'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()

const socio = ref(null)
const loading = ref(true)

function goBack() {
  router.back()
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

async function loadSocio() {
  loading.value = true
  try {
    socio.value = await sociosService.getById(route.params.id)
  } catch (error) {
    console.error('Error loading socio:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSocio()
})
</script>

<style scoped>
.avatar-red {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
  color: white !important;
}

.btn-back {
  color: #a3a3a3 !important;
}

.btn-back:hover {
  background: rgba(220, 38, 38, 0.1) !important;
  color: #dc2626 !important;
}
</style>
