<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Tienda UDL</h1>
      <div class="flex align-items-center gap-3">
        <span class="text-gray-400 hidden md:inline">Productos oficiales del club</span>
        <Button 
          icon="pi pi-shopping-cart" 
          :badge="cartItemsCount > 0 ? cartItemsCount.toString() : null"
          badgeClass="p-badge-danger"
          class="p-button-rounded cart-btn"
          @click="showCart = true"
          v-tooltip.left="'Ver carrito'"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex flex-wrap align-items-center gap-3">
        <span class="p-input-icon-left flex-1" style="max-width: 300px">
          <i class="pi pi-search" />
          <InputText v-model="searchTerm" placeholder="Buscar productos..." class="w-full" />
        </span>
        <Dropdown 
          v-model="selectedCategory" 
          :options="categorias" 
          placeholder="Todas las categorías"
          showClear
          class="w-12rem"
        />
        <div class="flex align-items-center gap-2">
          <Checkbox v-model="soloDestacados" binary inputId="destacados" />
          <label for="destacados" class="text-gray-300 cursor-pointer">Solo destacados</label>
        </div>
        <div class="flex align-items-center gap-2 ml-auto">
          <span class="text-gray-400 text-sm">{{ filteredProducts.length }} productos</span>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="loading" class="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>

    <div v-else-if="filteredProducts.length === 0" class="empty-state">
      <i class="pi pi-shopping-bag"></i>
      <h3>No se encontraron productos</h3>
      <p>Intenta con otros filtros de búsqueda</p>
      <Button label="Ver todos" icon="pi pi-refresh" @click="clearFilters" />
    </div>

    <div v-else class="grid">
      <div v-for="producto in filteredProducts" :key="producto.id" class="col-12 sm:col-6 lg:col-4 xl:col-3">
        <div class="product-card h-full flex flex-column" @click="openProductDetail(producto)">
          <!-- Product Image -->
          <div class="product-image-wrapper">
            <img 
              v-if="producto.imagen" 
              :src="producto.imagen" 
              :alt="producto.nombre"
              class="product-image"
            />
            <div v-else class="product-placeholder">
              <i class="pi pi-image"></i>
            </div>
            
            <!-- Badges -->
            <div class="product-badges">
              <span v-if="producto.destacado" class="badge-featured">
                <i class="pi pi-star-fill"></i> Destacado
              </span>
              <span v-if="producto.stock === 0" class="badge-soldout">Agotado</span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-content flex-1 flex flex-column">
            <span class="product-category">{{ producto.categoria }}</span>
            <h4 class="product-name">{{ producto.nombre }}</h4>
            <p class="product-description flex-1">{{ producto.descripcion || 'Producto oficial del club' }}</p>
            
            <div v-if="producto.tallas" class="product-sizes">
              <span class="sizes-label">Tallas:</span>
              <div class="sizes-list">
                <span v-for="talla in producto.tallas.split(',')" :key="talla" class="size-tag">
                  {{ talla.trim() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Price and Action -->
          <div class="product-footer">
            <div class="price-section">
              <span class="product-price">${{ producto.precio?.toLocaleString() }}</span>
              <Tag 
                :severity="producto.stock > 10 ? 'success' : producto.stock > 0 ? 'warning' : 'danger'"
                :value="producto.stock > 0 ? `${producto.stock} en stock` : 'Sin stock'"
                class="stock-tag"
              />
            </div>
            <Button 
              icon="pi pi-shopping-cart"
              class="p-button-rounded add-cart-btn"
              :disabled="producto.stock === 0"
              @click.stop="openProductDetail(producto)"
              v-tooltip.top="'Ver producto'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Product Detail Dialog -->
    <Dialog 
      v-model:visible="detailDialog" 
      :header="selectedProduct?.nombre" 
      :modal="true"
      :style="{ width: '650px' }"
      class="product-detail-dialog"
    >
      <div v-if="selectedProduct" class="product-detail">
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="detail-image-container">
              <img 
                v-if="selectedProduct.imagen" 
                :src="selectedProduct.imagen" 
                :alt="selectedProduct.nombre"
                class="detail-image"
              />
              <div v-else class="detail-placeholder">
                <i class="pi pi-image"></i>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <Tag :value="selectedProduct.categoria" severity="secondary" class="mb-3" />
            
            <p class="detail-description">{{ selectedProduct.descripcion || 'Producto oficial del club Unión Deportiva Laspiur.' }}</p>
            
            <!-- Selección de Talla -->
            <div v-if="selectedProduct.tallas" class="detail-sizes mb-3">
              <label class="detail-label">Seleccionar talla: *</label>
              <div class="sizes-selection mt-2">
                <Button 
                  v-for="talla in selectedProduct.tallas.split(',')" 
                  :key="talla"
                  :label="talla.trim()"
                  :class="['size-btn', { 'selected': selectedTalla === talla.trim() }]"
                  @click="selectedTalla = talla.trim()"
                />
              </div>
              <small v-if="tallaError" class="p-error mt-2 block">Debes seleccionar una talla</small>
            </div>

            <!-- Cantidad -->
            <div class="detail-quantity mb-3">
              <label class="detail-label">Cantidad:</label>
              <div class="quantity-selector mt-2">
                <Button 
                  icon="pi pi-minus" 
                  class="p-button-outlined p-button-sm"
                  :disabled="selectedQuantity <= 1"
                  @click="selectedQuantity--"
                />
                <span class="quantity-value">{{ selectedQuantity }}</span>
                <Button 
                  icon="pi pi-plus" 
                  class="p-button-outlined p-button-sm"
                  :disabled="selectedQuantity >= selectedProduct.stock"
                  @click="selectedQuantity++"
                />
              </div>
            </div>

            <div class="detail-stock mb-3">
              <label class="detail-label">Disponibilidad:</label>
              <Tag 
                :severity="selectedProduct.stock > 10 ? 'success' : selectedProduct.stock > 0 ? 'warning' : 'danger'"
                :value="selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades disponibles` : 'Producto agotado'"
                class="mt-2"
              />
            </div>

            <div class="detail-price">
              ${{ (selectedProduct.precio * selectedQuantity)?.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cerrar" icon="pi pi-times" text @click="detailDialog = false" />
        <Button 
          label="Agregar al carrito" 
          icon="pi pi-shopping-cart" 
          :disabled="selectedProduct?.stock === 0"
          @click="addToCart"
        />
      </template>
    </Dialog>

    <!-- Shopping Cart Sidebar -->
    <Sidebar v-model:visible="showCart" position="right" :style="{ width: '400px' }" class="cart-sidebar">
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-shopping-cart text-xl text-primary"></i>
          <span class="font-bold text-lg">Mi Carrito</span>
        </div>
      </template>

      <div v-if="cart.length === 0" class="cart-empty">
        <i class="pi pi-shopping-cart"></i>
        <p>Tu carrito está vacío</p>
        <Button label="Ver productos" icon="pi pi-arrow-left" @click="showCart = false" />
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="cart-item-image">
              <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre" />
              <div v-else class="cart-item-placeholder">
                <i class="pi pi-image"></i>
              </div>
            </div>
            <div class="cart-item-info flex-1">
              <h5 class="cart-item-name">{{ item.nombre }}</h5>
              <p class="cart-item-details">
                <span v-if="item.talla">Talla: {{ item.talla }}</span>
                <span>Cant: {{ item.cantidad }}</span>
              </p>
              <span class="cart-item-price">${{ (item.precio * item.cantidad).toLocaleString() }}</span>
            </div>
            <Button 
              icon="pi pi-trash" 
              class="p-button-rounded p-button-text p-button-danger p-button-sm"
              @click="removeFromCart(index)"
            />
          </div>
        </div>

        <Divider />

        <div class="cart-summary">
          <div class="flex justify-content-between mb-2">
            <span class="text-gray-400">Subtotal ({{ cartItemsCount }} items)</span>
            <span class="text-white font-semibold">${{ cartTotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-content-between mb-3">
            <span class="text-gray-400">Envío</span>
            <span class="text-green-400">Coordinar con el club</span>
          </div>
          <Divider />
          <div class="flex justify-content-between mb-4">
            <span class="text-xl font-bold text-white">Total</span>
            <span class="text-xl font-bold text-primary">${{ cartTotal.toLocaleString() }}</span>
          </div>

          <Button 
            label="Realizar pedido" 
            icon="pi pi-check" 
            class="w-full mb-2"
            @click="checkout"
          />
          <Button 
            label="Vaciar carrito" 
            icon="pi pi-trash" 
            class="w-full p-button-outlined p-button-danger"
            @click="clearCart"
          />
        </div>
      </div>
    </Sidebar>

    <!-- Checkout Confirmation Dialog -->
    <Dialog 
      v-model:visible="checkoutDialog" 
      header="Finalizar Compra" 
      :modal="true"
      :style="{ width: '550px' }"
    >
      <div class="checkout-confirmation">
        <div class="order-summary p-3 border-round mb-4" style="background: #1a1a1a">
          <h4 class="text-white mb-3"><i class="pi pi-shopping-cart mr-2"></i>Resumen del pedido</h4>
          <div v-for="(item, index) in cart" :key="index" class="flex justify-content-between mb-2">
            <span class="text-gray-300">{{ item.nombre }} {{ item.talla ? `(${item.talla})` : '' }} x{{ item.cantidad }}</span>
            <span class="text-white">${{ (item.precio * item.cantidad).toLocaleString() }}</span>
          </div>
          <Divider />
          <div class="flex justify-content-between">
            <span class="font-bold text-white">Total a pagar</span>
            <span class="font-bold text-primary text-xl">${{ cartTotal.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Método de pago -->
        <div class="payment-methods mb-4">
          <h4 class="text-white mb-3"><i class="pi pi-credit-card mr-2"></i>Método de pago</h4>
          
          <div class="payment-options">
            <div 
              class="payment-option" 
              :class="{ 'selected': metodoPago === 'efectivo' }"
              @click="metodoPago = 'efectivo'"
            >
              <div class="payment-icon">
                <i class="pi pi-wallet"></i>
              </div>
              <div class="payment-info">
                <span class="payment-title">Pago en Efectivo</span>
                <span class="payment-desc">Pagas al retirar tu pedido en el club</span>
              </div>
              <i v-if="metodoPago === 'efectivo'" class="pi pi-check-circle text-green-400"></i>
            </div>

            <div 
              class="payment-option" 
              :class="{ 'selected': metodoPago === 'mercadopago' }"
              @click="metodoPago = 'mercadopago'"
            >
              <div class="payment-icon mp-icon">
                <i class="pi pi-credit-card"></i>
              </div>
              <div class="payment-info">
                <span class="payment-title">MercadoPago</span>
                <span class="payment-desc">Tarjeta de débito, crédito o dinero en cuenta</span>
              </div>
              <i v-if="metodoPago === 'mercadopago'" class="pi pi-check-circle text-green-400"></i>
            </div>
          </div>
          <small v-if="pagoError" class="p-error mt-2 block">Debes seleccionar un método de pago</small>
        </div>

        <!-- Dirección de envío opcional -->
        <div class="delivery-section mb-4">
          <h4 class="text-white mb-3"><i class="pi pi-map-marker mr-2"></i>Entrega</h4>
          <div class="flex align-items-center gap-2 mb-3">
            <Checkbox v-model="envioADomicilio" binary inputId="envio" />
            <label for="envio" class="text-gray-300 cursor-pointer">Solicitar envío a domicilio</label>
          </div>
          <InputText 
            v-if="envioADomicilio"
            v-model="direccionEnvio" 
            placeholder="Ingresa tu dirección completa"
            class="w-full"
          />
          <small v-if="!envioADomicilio" class="text-gray-400">Retiro en el club: Av. Principal 1234, Laspiur</small>
        </div>

        <!-- Observaciones -->
        <div class="observations-section">
          <h4 class="text-white mb-3"><i class="pi pi-comment mr-2"></i>Observaciones (opcional)</h4>
          <Textarea 
            v-model="observaciones" 
            placeholder="¿Algún comentario sobre tu pedido?"
            rows="2"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="checkoutDialog = false" />
        <Button 
          :label="metodoPago === 'mercadopago' ? 'Pagar con MercadoPago' : 'Confirmar Pedido'" 
          :icon="metodoPago === 'mercadopago' ? 'pi pi-credit-card' : 'pi pi-check'" 
          @click="confirmCheckout" 
          :loading="processingOrder" 
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { productosService, pedidosService } from '@/services'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Sidebar from 'primevue/sidebar'
import Divider from 'primevue/divider'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'

const toast = useToast()
const authStore = useAuthStore()

const productos = ref([])
const loading = ref(false)
const searchTerm = ref('')
const selectedCategory = ref(null)
const soloDestacados = ref(false)
const detailDialog = ref(false)
const selectedProduct = ref(null)
const selectedTalla = ref('')
const selectedQuantity = ref(1)
const tallaError = ref(false)

// Cart state
const cart = ref([])
const showCart = ref(false)
const checkoutDialog = ref(false)
const processingOrder = ref(false)

// Checkout state
const metodoPago = ref('')
const envioADomicilio = ref(false)
const direccionEnvio = ref('')
const observaciones = ref('')
const pagoError = ref(false)

const categorias = ['Indumentaria', 'Accesorios', 'Equipamiento', 'Merchandising', 'Otros']

const filteredProducts = computed(() => {
  return productos.value.filter(p => {
    if (!p.activo) return false
    if (searchTerm.value && !p.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())) return false
    if (selectedCategory.value && p.categoria !== selectedCategory.value) return false
    if (soloDestacados.value && !p.destacado) return false
    return true
  })
})

const cartItemsCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.cantidad, 0)
})

const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => total + (item.precio * item.cantidad), 0)
})

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('udl_cart')
  if (savedCart) {
    cart.value = JSON.parse(savedCart)
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('udl_cart', JSON.stringify(cart.value))
}

async function loadProductos() {
  loading.value = true
  try {
    productos.value = await productosService.getAll()
  } catch (error) {
    console.error('Error loading productos:', error)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  searchTerm.value = ''
  selectedCategory.value = null
  soloDestacados.value = false
}

function openProductDetail(producto) {
  selectedProduct.value = producto
  selectedTalla.value = ''
  selectedQuantity.value = 1
  tallaError.value = false
  detailDialog.value = true
}

function addToCart() {
  // Validar talla si el producto tiene tallas
  if (selectedProduct.value.tallas && !selectedTalla.value) {
    tallaError.value = true
    return
  }

  const existingIndex = cart.value.findIndex(item => 
    item.id === selectedProduct.value.id && item.talla === selectedTalla.value
  )

  if (existingIndex >= 0) {
    // Actualizar cantidad si ya existe
    cart.value[existingIndex].cantidad += selectedQuantity.value
  } else {
    // Agregar nuevo item
    cart.value.push({
      id: selectedProduct.value.id,
      nombre: selectedProduct.value.nombre,
      precio: selectedProduct.value.precio,
      imagen: selectedProduct.value.imagen,
      talla: selectedTalla.value || null,
      cantidad: selectedQuantity.value
    })
  }

  saveCart()
  detailDialog.value = false
  
  toast.add({ 
    severity: 'success', 
    summary: 'Agregado al carrito', 
    detail: `${selectedProduct.value.nombre}${selectedTalla.value ? ` (Talla ${selectedTalla.value})` : ''} x${selectedQuantity.value}`, 
    life: 3000 
  })
}

function removeFromCart(index) {
  cart.value.splice(index, 1)
  saveCart()
  toast.add({ 
    severity: 'info', 
    summary: 'Eliminado', 
    detail: 'Producto eliminado del carrito', 
    life: 2000 
  })
}

function clearCart() {
  cart.value = []
  saveCart()
  toast.add({ 
    severity: 'info', 
    summary: 'Carrito vacío', 
    detail: 'Se han eliminado todos los productos', 
    life: 2000 
  })
}

function checkout() {
  if (cart.value.length === 0) return
  // Reset checkout form
  metodoPago.value = ''
  envioADomicilio.value = false
  direccionEnvio.value = ''
  observaciones.value = ''
  pagoError.value = false
  checkoutDialog.value = true
}

async function confirmCheckout() {
  // Validar método de pago
  if (!metodoPago.value) {
    pagoError.value = true
    return
  }
  pagoError.value = false

  processingOrder.value = true
  
  try {
    // Preparar los items del pedido para el backend
    const pedidoItems = cart.value.map(item => ({
      productoId: item.id,
      cantidad: item.cantidad,
      talla: item.talla
    }))

    // Crear el pedido en el backend
    const pedido = await pedidosService.create({
      socioId: authStore.user.id,
      items: pedidoItems,
      observaciones: observaciones.value || null,
      direccionEnvio: envioADomicilio.value ? direccionEnvio.value : null,
      metodoPago: metodoPago.value
    })
    
    // Si es MercadoPago, redirigir a la página de pago
    if (metodoPago.value === 'mercadopago') {
      // Limpiar carrito
      cart.value = []
      saveCart()
      checkoutDialog.value = false
      showCart.value = false
      
      toast.add({ 
        severity: 'info', 
        summary: 'Redirigiendo a MercadoPago...', 
        detail: 'Serás redirigido para completar el pago', 
        life: 3000 
      })
      
      // Simular redirección a MercadoPago (en producción sería la URL real)
      setTimeout(() => {
        // window.location.href = pedido.mercadopagoUrl
        toast.add({ 
          severity: 'success', 
          summary: '¡Pedido creado!', 
          detail: 'La integración con MercadoPago estará disponible próximamente. Por ahora, te contactaremos para coordinar el pago.', 
          life: 6000 
        })
      }, 1500)
    } else {
      // Pago en efectivo
      cart.value = []
      saveCart()
      checkoutDialog.value = false
      showCart.value = false
      
      toast.add({ 
        severity: 'success', 
        summary: '¡Pedido confirmado!', 
        detail: 'Tu pedido fue registrado. Pagarás $' + cartTotal.value.toLocaleString() + ' al retirarlo en el club.', 
        life: 5000 
      })
    }
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'No se pudo procesar el pedido', 
      life: 5000 
    })
  } finally {
    processingOrder.value = false
  }
}

onMounted(() => {
  loadProductos()
  loadCart()
})
</script>

<style scoped>
.product-card {
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #2a2a2a;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  border-color: #dc2626;
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(220, 38, 38, 0.2);
}

.product-image-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-placeholder i {
  font-size: 4rem;
  color: #dc2626;
  opacity: 0.3;
}

.product-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badge-featured {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-soldout {
  background: #dc2626;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-content {
  padding: 1.25rem;
}

.product-category {
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.product-name {
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0.5rem 0;
  line-height: 1.3;
}

.product-description {
  color: #9ca3af;
  font-size: 0.85rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 1rem 0;
}

.product-sizes {
  margin-bottom: 0.5rem;
}

.sizes-label {
  color: #6b7280;
  font-size: 0.8rem;
}

.sizes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.size-tag {
  background: #2a2a2a;
  color: #d1d5db;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.size-tag-lg {
  background: #2a2a2a;
  color: #d1d5db;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.product-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #dc2626;
}

.stock-tag {
  font-size: 0.7rem;
}

.add-cart-btn {
  width: 45px;
  height: 45px;
}

/* Empty State */
.empty-state {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px solid #2a2a2a;
}

.empty-state i {
  font-size: 4rem;
  color: #dc2626;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #fff;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #9ca3af;
  margin: 0 0 1.5rem 0;
}

/* Detail Dialog */
.detail-image-container {
  border-radius: 12px;
  overflow: hidden;
  background: #0a0a0a;
}

.detail-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.detail-placeholder {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
}

.detail-placeholder i {
  font-size: 5rem;
  color: #dc2626;
  opacity: 0.3;
}

.detail-description {
  color: #d1d5db;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.detail-label {
  color: #9ca3af;
  font-size: 0.9rem;
  font-weight: 500;
}

.detail-price {
  font-size: 2.5rem;
  font-weight: 800;
  color: #dc2626;
  margin-top: 1rem;
}

/* Size Selection */
.sizes-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-btn {
  min-width: 50px;
  background: #2a2a2a !important;
  border-color: #3a3a3a !important;
  color: #d1d5db !important;
}

.size-btn:hover {
  border-color: #dc2626 !important;
  background: #3a3a3a !important;
}

.size-btn.selected {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
  color: white !important;
}

/* Quantity Selector */
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  min-width: 40px;
  text-align: center;
}

/* Cart Button */
.cart-btn {
  position: relative;
}

/* Cart Sidebar */
.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.cart-empty i {
  font-size: 4rem;
  color: #dc2626;
  opacity: 0.4;
  margin-bottom: 1rem;
}

.cart-empty p {
  color: #9ca3af;
  margin-bottom: 1.5rem;
}

.cart-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #1a1a1a;
  border-radius: 10px;
  margin-bottom: 10px;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
}

.cart-item-placeholder i {
  color: #dc2626;
  opacity: 0.5;
}

.cart-item-name {
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.cart-item-details {
  color: #9ca3af;
  font-size: 0.75rem;
  margin: 0;
  display: flex;
  gap: 10px;
}

.cart-item-price {
  color: #dc2626;
  font-weight: 700;
  font-size: 0.95rem;
}

.cart-summary {
  padding-top: 1rem;
}

/* Checkout Confirmation */
.checkout-confirmation {
  text-align: left;
}

/* Payment Methods */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #1a1a1a;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  border-color: #3a3a3a;
  background: #222;
}

.payment-option.selected {
  border-color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.payment-icon {
  width: 48px;
  height: 48px;
  background: #2a2a2a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
  font-size: 1.25rem;
}

.payment-icon.mp-icon {
  background: #009ee3;
  color: white;
}

.payment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-title {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.payment-desc {
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Delivery & Observations */
.delivery-section,
.observations-section {
  background: #1a1a1a;
  padding: 16px;
  border-radius: 12px;
}
</style>
