<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Mis Pedidos</h1>
      <Button label="Ir a la Tienda" icon="pi pi-shopping-cart" @click="$router.push('/socio/tienda')" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>

    <!-- Sin pedidos -->
    <div v-else-if="pedidos.length === 0" class="card text-center py-6">
      <i class="pi pi-shopping-bag text-5xl text-gray-400 mb-3"></i>
      <h3 class="text-xl text-gray-300 mb-2">Aún no tienes pedidos</h3>
      <p class="text-gray-400 mb-4">Explora nuestra tienda y realiza tu primer pedido</p>
      <Button label="Ir a la Tienda" icon="pi pi-shopping-cart" @click="$router.push('/socio/tienda')" />
    </div>

    <!-- Lista de pedidos -->
    <div v-else class="flex flex-column gap-4">
      <div v-for="pedido in pedidos" :key="pedido.id" class="pedido-card">
        <!-- Header del pedido -->
        <div class="pedido-header">
          <div class="flex align-items-center gap-3">
            <div class="pedido-icon">
              <i class="pi pi-shopping-bag text-xl"></i>
            </div>
            <div>
              <span class="block text-white font-semibold">Pedido #{{ pedido.id.substring(0, 8).toUpperCase() }}</span>
              <span class="text-sm text-gray-400">{{ formatDate(pedido.fechaPedido) }}</span>
            </div>
          </div>
          <div class="flex align-items-center gap-2">
            <Tag :severity="getEstadoSeverity(pedido.estado)" :value="getEstadoLabel(pedido.estado)" />
            <Tag :severity="getEstadoPagoSeverity(pedido.estadoPago)" :value="getEstadoPagoLabel(pedido.estadoPago)" />
          </div>
        </div>

        <!-- Items del pedido -->
        <div class="pedido-items">
          <div v-for="item in pedido.items" :key="item.id" class="pedido-item">
            <div class="flex align-items-center gap-3">
              <div class="item-image">
                <i class="pi pi-box"></i>
              </div>
              <div class="flex-1">
                <span class="block text-white">{{ item.nombreProducto }}</span>
                <span class="text-sm text-gray-400">
                  {{ item.cantidad }} x ${{ item.precio?.toLocaleString() }}
                  <span v-if="item.talla"> - Talla: {{ item.talla }}</span>
                </span>
              </div>
              <span class="text-white font-semibold">${{ item.subtotal?.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Footer del pedido -->
        <div class="pedido-footer">
          <div class="flex flex-column gap-2">
            <div v-if="pedido.metodoPago" class="flex align-items-center gap-2 text-sm text-gray-400">
              <i :class="pedido.metodoPago === 'mercadopago' ? 'pi pi-credit-card' : 'pi pi-wallet'"></i>
              <span>{{ getMetodoPagoLabel(pedido.metodoPago) }}</span>
            </div>
            <div v-if="pedido.direccionEnvio" class="flex align-items-center gap-2 text-sm text-gray-400">
              <i class="pi pi-map-marker"></i>
              <span>{{ pedido.direccionEnvio }}</span>
            </div>
            <div v-if="pedido.fechaEntrega" class="flex align-items-center gap-2 text-sm text-gray-400">
              <i class="pi pi-calendar"></i>
              <span>Entrega: {{ formatDate(pedido.fechaEntrega) }}</span>
            </div>
            <div v-if="pedido.observaciones" class="flex align-items-center gap-2 text-sm text-gray-400">
              <i class="pi pi-info-circle"></i>
              <span>{{ pedido.observaciones }}</span>
            </div>
          </div>
          <div class="pedido-total">
            <span class="text-gray-400">Total:</span>
            <span class="text-2xl font-bold text-primary">${{ pedido.total?.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Timeline de estado -->
        <div class="pedido-timeline" v-if="pedido.estado !== 'Cancelado'">
          <div class="timeline-step" :class="{ 'active': isStepActive(pedido.estado, 'Pendiente'), 'completed': isStepCompleted(pedido.estado, 'Pendiente') }">
            <div class="timeline-dot"><i class="pi pi-clock"></i></div>
            <span>Pendiente</span>
          </div>
          <div class="timeline-line" :class="{ 'completed': isStepCompleted(pedido.estado, 'Pendiente') }"></div>
          <div class="timeline-step" :class="{ 'active': isStepActive(pedido.estado, 'Confirmado'), 'completed': isStepCompleted(pedido.estado, 'Confirmado') }">
            <div class="timeline-dot"><i class="pi pi-check"></i></div>
            <span>Confirmado</span>
          </div>
          <div class="timeline-line" :class="{ 'completed': isStepCompleted(pedido.estado, 'Confirmado') }"></div>
          <div class="timeline-step" :class="{ 'active': isStepActive(pedido.estado, 'EnPreparacion'), 'completed': isStepCompleted(pedido.estado, 'EnPreparacion') }">
            <div class="timeline-dot"><i class="pi pi-box"></i></div>
            <span>En Preparación</span>
          </div>
          <div class="timeline-line" :class="{ 'completed': isStepCompleted(pedido.estado, 'EnPreparacion') }"></div>
          <div class="timeline-step" :class="{ 'active': isStepActive(pedido.estado, 'Enviado'), 'completed': isStepCompleted(pedido.estado, 'Enviado') }">
            <div class="timeline-dot"><i class="pi pi-send"></i></div>
            <span>Enviado</span>
          </div>
          <div class="timeline-line" :class="{ 'completed': isStepCompleted(pedido.estado, 'Enviado') }"></div>
          <div class="timeline-step" :class="{ 'active': isStepActive(pedido.estado, 'Entregado'), 'completed': isStepCompleted(pedido.estado, 'Entregado') }">
            <div class="timeline-dot"><i class="pi pi-check-circle"></i></div>
            <span>Entregado</span>
          </div>
        </div>

        <!-- Estado cancelado -->
        <div v-else class="pedido-cancelado">
          <i class="pi pi-times-circle text-2xl"></i>
          <span>Este pedido fue cancelado</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { pedidosService } from '@/services'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

const toast = useToast()
const pedidos = ref([])
const loading = ref(false)

const estadosOrden = ['Pendiente', 'Confirmado', 'EnPreparacion', 'Enviado', 'Entregado']

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

function getEstadoSeverity(estado) {
  const severities = {
    'Pendiente': 'warning',
    'Confirmado': 'info',
    'EnPreparacion': 'info',
    'Enviado': 'success',
    'Entregado': 'success',
    'Cancelado': 'danger'
  }
  return severities[estado] || 'secondary'
}

function getEstadoLabel(estado) {
  const labels = {
    'Pendiente': 'Pendiente',
    'Confirmado': 'Confirmado',
    'EnPreparacion': 'En Preparación',
    'Enviado': 'Enviado',
    'Entregado': 'Entregado',
    'Cancelado': 'Cancelado'
  }
  return labels[estado] || estado
}

function getEstadoPagoSeverity(estado) {
  const severities = {
    'Pendiente': 'warning',
    'Pagado': 'success',
    'Rechazado': 'danger'
  }
  return severities[estado] || 'secondary'
}

function getEstadoPagoLabel(estado) {
  const labels = {
    'Pendiente': 'Pago Pendiente',
    'Pagado': 'Pagado',
    'Rechazado': 'Pago Rechazado'
  }
  return labels[estado] || estado
}

function getMetodoPagoLabel(metodo) {
  const labels = {
    'efectivo': 'Pago en Efectivo',
    'mercadopago': 'MercadoPago'
  }
  return labels[metodo] || metodo
}

function isStepActive(currentEstado, step) {
  return currentEstado === step
}

function isStepCompleted(currentEstado, step) {
  const currentIndex = estadosOrden.indexOf(currentEstado)
  const stepIndex = estadosOrden.indexOf(step)
  return currentIndex > stepIndex
}

async function loadPedidos() {
  loading.value = true
  try {
    pedidos.value = await pedidosService.getMisPedidos()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los pedidos', life: 3000 })
  } finally {
    loading.value = false
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
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #222;
  border-bottom: 1px solid #2a2a2a;
}

.pedido-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.pedido-items {
  padding: 1rem 1.25rem;
}

.pedido-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #2a2a2a;
}

.pedido-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 40px;
  height: 40px;
  background: #2a2a2a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}

.pedido-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1rem 1.25rem;
  background: #1f1f1f;
  border-top: 1px solid #2a2a2a;
}

.pedido-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.pedido-timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: #171717;
  gap: 0.5rem;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.timeline-step.active,
.timeline-step.completed {
  opacity: 1;
}

.timeline-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.3s ease;
}

.timeline-step.active .timeline-dot {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
}

.timeline-step.completed .timeline-dot {
  background: #22c55e;
  color: white;
}

.timeline-step span {
  font-size: 0.75rem;
  color: #888;
  white-space: nowrap;
}

.timeline-step.active span,
.timeline-step.completed span {
  color: white;
}

.timeline-line {
  width: 30px;
  height: 2px;
  background: #2a2a2a;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.timeline-line.completed {
  background: #22c55e;
}

.pedido-cancelado {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: rgba(220, 38, 38, 0.1);
  color: #ef4444;
  border-top: 1px solid rgba(220, 38, 38, 0.2);
}

@media (max-width: 768px) {
  .pedido-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .pedido-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .pedido-total {
    align-items: flex-start;
    width: 100%;
    padding-top: 1rem;
    border-top: 1px solid #2a2a2a;
  }

  .pedido-timeline {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .timeline-line {
    display: none;
  }

  .timeline-step {
    flex: 0 0 auto;
  }
}
</style>
