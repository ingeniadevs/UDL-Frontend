<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Productos</h1>
      <Button label="Nuevo Producto" icon="pi pi-plus" @click="openNew" />
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="card mb-4">
      <div class="flex flex-wrap align-items-center gap-3">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="searchTerm" placeholder="Buscar productos..." />
        </span>
        <Dropdown 
          v-model="selectedCategory" 
          :options="categorias" 
          placeholder="Todas las categorías"
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
        <div class="flex align-items-center gap-2">
          <Checkbox v-model="soloDestacados" binary inputId="destacados" />
          <label for="destacados" class="text-gray-300">Solo destacados</label>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="loading" class="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>

    <div v-else-if="filteredProducts.length === 0" class="card text-center py-6">
      <i class="pi pi-box text-4xl text-gray-400 mb-3"></i>
      <p class="text-gray-400 mb-3">No se encontraron productos</p>
      <Button label="Crear primer producto" icon="pi pi-plus" @click="openNew" />
    </div>

    <div v-else class="grid">
      <div v-for="prod in filteredProducts" :key="prod.id" class="col-12 sm:col-6 lg:col-4 xl:col-3">
        <div class="product-card h-full flex flex-column" :class="{ 'inactive': !prod.activo }">
          <!-- Product Image -->
          <div class="product-image-container relative">
            <img 
              v-if="prod.imagen" 
              :src="prod.imagen" 
              :alt="prod.nombre"
              class="product-image"
            />
            <div v-else class="product-placeholder">
              <i class="pi pi-image"></i>
            </div>
            
            <!-- Badges -->
            <div class="product-badges">
              <Tag v-if="prod.destacado" severity="warning" value="★ Destacado" />
              <Tag v-if="!prod.activo" severity="danger" value="Inactivo" />
            </div>

            <!-- Quick Actions Overlay -->
            <div class="product-actions-overlay">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-success"
                @click="editProducto(prod)"
                v-tooltip.top="'Editar'"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-rounded p-button-danger"
                @click="confirmDelete(prod)"
                v-tooltip.top="'Eliminar'"
              />
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-body flex-1 flex flex-column">
            <div class="flex align-items-center justify-content-between mb-2">
              <Tag severity="secondary" :value="prod.categoria" />
              <Tag 
                :severity="prod.stock > 10 ? 'success' : prod.stock > 0 ? 'warning' : 'danger'"
                :value="'Stock: ' + prod.stock"
              />
            </div>
            
            <h4 class="product-title">{{ prod.nombre }}</h4>
            <p class="product-description flex-1">{{ prod.descripcion || 'Sin descripción' }}</p>
            
            <div v-if="prod.tallas" class="product-sizes mb-2">
              <i class="pi pi-tag mr-1"></i>
              <span>{{ prod.tallas }}</span>
            </div>

            <!-- Price -->
            <div class="product-price">
              ${{ prod.precio?.toLocaleString() }}
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="product-footer">
            <Button 
              label="Editar" 
              icon="pi pi-pencil" 
              class="p-button-sm p-button-outlined flex-1"
              @click="editProducto(prod)"
            />
            <Button 
              :icon="prod.activo ? 'pi pi-eye-slash' : 'pi pi-eye'" 
              class="p-button-sm p-button-outlined"
              :class="prod.activo ? 'p-button-warning' : 'p-button-success'"
              @click="toggleActivo(prod)"
              v-tooltip.top="prod.activo ? 'Desactivar' : 'Activar'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog 
      v-model:visible="productoDialog" 
      :header="isEditing ? 'Editar Producto' : 'Nuevo Producto'" 
      :modal="true"
      :style="{ width: '550px' }"
    >
      <div class="flex flex-column gap-4 pt-3">
        <div class="field">
          <label for="nombre" class="font-medium text-gray-300">Nombre *</label>
          <InputText id="nombre" v-model="producto.nombre" class="w-full" :class="{ 'p-invalid': submitted && !producto.nombre }" />
          <small v-if="submitted && !producto.nombre" class="p-error">El nombre es requerido</small>
        </div>
        
        <div class="field">
          <label for="descripcion" class="font-medium text-gray-300">Descripción</label>
          <Textarea id="descripcion" v-model="producto.descripcion" rows="3" class="w-full" />
        </div>

        <div class="grid">
          <div class="col-6">
            <div class="field">
              <label for="precio" class="font-medium text-gray-300">Precio *</label>
              <InputNumber id="precio" v-model="producto.precio" mode="currency" currency="USD" class="w-full" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="stock" class="font-medium text-gray-300">Stock</label>
              <InputNumber id="stock" v-model="producto.stock" class="w-full" />
            </div>
          </div>
        </div>

        <div class="field">
          <label for="categoria" class="font-medium text-gray-300">Categoría *</label>
          <Dropdown 
            id="categoria"
            v-model="producto.categoria" 
            :options="categorias" 
            placeholder="Seleccione categoría"
            class="w-full"
            editable
          />
        </div>        <div class="field">
          <label for="tallas" class="font-medium text-gray-300">Tallas (separadas por coma)</label>
          <InputText id="tallas" v-model="producto.tallas" class="w-full" placeholder="S, M, L, XL" />
        </div>

        <div class="field">
          <label class="font-medium text-gray-300 mb-2 block">Imagen del Producto</label>
          <ImageUpload v-model="producto.imagen" placeholder="Subir imagen del producto" />
        </div>

        <div class="flex gap-4">
          <div class="field-checkbox">
            <Checkbox id="destacado" v-model="producto.destacado" binary />
            <label for="destacado" class="ml-2 text-gray-300">Destacado</label>
          </div>
          <div class="field-checkbox" v-if="isEditing">
            <Checkbox id="activo" v-model="producto.activo" binary />
            <label for="activo" class="ml-2 text-gray-300">Activo</label>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveProducto" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { productosService } from '@/services'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import ImageUpload from '@/components/shared/ImageUpload.vue'

const toast = useToast()
const confirm = useConfirm()

const productos = ref([])
const loading = ref(false)
const productoDialog = ref(false)
const submitted = ref(false)
const saving = ref(false)
const isEditing = ref(false)

const producto = ref({})

// Filtros
const searchTerm = ref('')
const selectedCategory = ref(null)
const selectedStatus = ref(null)
const soloDestacados = ref(false)

const categorias = ['Indumentaria', 'Accesorios', 'Equipamiento', 'Merchandising', 'Otros']
const estadoOptions = [
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false }
]

const filteredProducts = computed(() => {
  return productos.value.filter(p => {
    if (searchTerm.value && !p.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())) return false
    if (selectedCategory.value && p.categoria !== selectedCategory.value) return false
    if (selectedStatus.value !== null && p.activo !== selectedStatus.value) return false
    if (soloDestacados.value && !p.destacado) return false
    return true
  })
})

async function loadProductos() {
  loading.value = true
  try {
    productos.value = await productosService.getAll()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos', life: 3000 })
  } finally {
    loading.value = false
  }
}

function openNew() {
  producto.value = { precio: 0, stock: 0, destacado: false, activo: true }
  submitted.value = false
  isEditing.value = false
  productoDialog.value = true
}

function editProducto(data) {
  producto.value = { ...data }
  isEditing.value = true
  submitted.value = false
  productoDialog.value = true
}

function hideDialog() {
  productoDialog.value = false
  submitted.value = false
}

async function toggleActivo(prod) {
  try {
    await productosService.update(prod.id, {
      ...prod,
      activo: !prod.activo
    })
    prod.activo = !prod.activo
    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: `Producto ${prod.activo ? 'activado' : 'desactivado'}`, 
      life: 3000 
    })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado', life: 3000 })
  }
}

async function saveProducto() {
  submitted.value = true

  if (!producto.value.nombre || !producto.value.categoria) {
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await productosService.update(producto.value.id, {
        nombre: producto.value.nombre,
        descripcion: producto.value.descripcion,
        precio: producto.value.precio || 0,
        stock: producto.value.stock || 0,
        categoria: producto.value.categoria,
        imagen: producto.value.imagen,
        tallas: producto.value.tallas,
        activo: producto.value.activo,
        destacado: producto.value.destacado
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado', life: 3000 })
    } else {
      await productosService.create({
        nombre: producto.value.nombre,
        descripcion: producto.value.descripcion,
        precio: producto.value.precio || 0,
        stock: producto.value.stock || 0,
        categoria: producto.value.categoria,
        imagen: producto.value.imagen,
        tallas: producto.value.tallas,
        destacado: producto.value.destacado
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado', life: 3000 })
    }
    hideDialog()
    await loadProductos()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al guardar el producto', 
      life: 3000 
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(data) {
  confirm.require({
    message: `¿Está seguro de eliminar el producto ${data.nombre}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await productosService.delete(data.id)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado', life: 3000 })
        await loadProductos()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el producto', life: 3000 })
      }
    }
  })
}

onMounted(() => {
  loadProductos()
})
</script>

<style scoped>
.product-card {
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2a2a2a;
  transition: all 0.3s ease;
}

.product-card:hover {
  border-color: #dc2626;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.15);
}

.product-card.inactive {
  opacity: 0.7;
}

.product-card.inactive:hover {
  opacity: 1;
}

.product-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #0a0a0a;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
}

.product-placeholder i {
  font-size: 3rem;
  color: #dc2626;
  opacity: 0.5;
}

.product-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-actions-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-actions-overlay {
  opacity: 1;
}

.product-body {
  padding: 1rem;
}

.product-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.5rem 0;
  line-height: 1.3;
}

.product-description {
  color: #9ca3af;
  font-size: 0.85rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 0.75rem 0;
}

.product-sizes {
  font-size: 0.8rem;
  color: #6b7280;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
  margin-top: auto;
}

.product-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #2a2a2a;
  display: flex;
  gap: 0.5rem;
}
</style>
