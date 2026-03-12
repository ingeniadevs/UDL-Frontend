<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Socios</h1>
      <Button label="Nuevo Socio" icon="pi pi-plus" @click="openNew" />
    </div>

    <div class="card">
      <DataTable 
        :value="socios" 
        :loading="loading"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 25]"
        dataKey="id"
        :globalFilterFields="['nombre', 'email', 'numeroSocio']"
        v-model:filters="filters"
        filterDisplay="menu"
        responsiveLayout="scroll"
      >
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Buscar..." />
            </span>
          </div>
        </template>
        
        <Column field="numeroSocio" header="# Socio" sortable style="min-width: 100px"></Column>
        <Column field="nombre" header="Nombre" sortable style="min-width: 150px"></Column>
        <Column field="email" header="Email" sortable style="min-width: 200px"></Column>
        <Column field="telefono" header="Teléfono" style="min-width: 120px"></Column>
        <Column header="Cuota" sortable style="min-width: 100px">
          <template #body="slotProps">
            ${{ slotProps.data.cuotaSocio?.toLocaleString() }}
          </template>
        </Column>
        <Column header="Estado" style="min-width: 100px">
          <template #body="slotProps">
            <Tag :severity="slotProps.data.activo ? 'success' : 'danger'" 
                 :value="slotProps.data.activo ? 'Activo' : 'Inactivo'" />
          </template>
        </Column>
        <Column header="Acciones" style="min-width: 150px">
          <template #body="slotProps">
            <Button 
              icon="pi pi-eye" 
              text 
              rounded 
              class="mr-2" 
              @click="viewSocio(slotProps.data)"
              v-tooltip.top="'Ver detalle'"
            />
            <Button 
              icon="pi pi-pencil" 
              text 
              rounded 
              class="mr-2" 
              severity="success"
              @click="editSocio(slotProps.data)"
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
      v-model:visible="socioDialog" 
      :header="isEditing ? 'Editar Socio' : 'Nuevo Socio'" 
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-column gap-4 pt-3">      <div class="field">
          <label for="nombre" class="font-medium text-gray-300">Nombre *</label>
          <InputText id="nombre" v-model="socio.nombre" class="w-full" :class="{ 'p-invalid': submitted && !socio.nombre }" />
          <small v-if="submitted && !socio.nombre" class="p-error">El nombre es requerido</small>
        </div>
          <div class="field">
          <label for="email" class="font-medium text-gray-300">Email *</label>
          <InputText id="email" v-model="socio.email" type="email" class="w-full" :class="{ 'p-invalid': submitted && !socio.email }" />
          <small v-if="submitted && !socio.email" class="p-error">El email es requerido</small>
        </div>

        <div class="field" v-if="isEditing">
          <label for="numeroSocio" class="font-medium text-gray-300">Número de Socio</label>
          <InputText id="numeroSocio" v-model="socio.numeroSocio" class="w-full" disabled />
        </div>

        <div class="field" v-if="!isEditing">
          <label for="password" class="font-medium text-gray-300">Contraseña *</label>
          <Password id="password" v-model="socio.password" class="w-full" input-class="w-full" toggle-mask />
          <small v-if="submitted && !isEditing && !socio.password" class="p-error">La contraseña es requerida</small>
        </div>

        <div class="field">
          <label for="telefono" class="font-medium text-gray-300">Teléfono</label>
          <InputText id="telefono" v-model="socio.telefono" class="w-full" />
        </div>        <div class="field">
          <label for="cuota" class="font-medium text-gray-300">Cuota Mensual</label>
          <InputNumber id="cuota" v-model="socio.cuotaSocio" mode="currency" currency="USD" class="w-full" />
        </div>

        <div class="field">
          <label class="font-medium text-gray-300 mb-2 block">Foto del Socio</label>
          <ImageUpload v-model="socio.foto" placeholder="Subir foto del socio" />
        </div>

        <div class="field" v-if="isEditing">
          <label for="activo" class="font-medium text-gray-300">Estado</label>
          <div class="flex align-items-center gap-2 mt-2">
            <InputSwitch id="activo" v-model="socio.activo" />
            <span class="text-gray-300">{{ socio.activo ? 'Activo' : 'Inactivo' }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveSocio" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { sociosService } from '@/services'
import { FilterMatchMode } from 'primevue/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import Password from 'primevue/password'
import Tag from 'primevue/tag'
import ImageUpload from '@/components/shared/ImageUpload.vue'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const socios = ref([])
const loading = ref(false)
const socioDialog = ref(false)
const submitted = ref(false)
const saving = ref(false)
const isEditing = ref(false)

const socio = ref({})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

async function loadSocios() {
  loading.value = true
  try {
    socios.value = await sociosService.getAll()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los socios', life: 3000 })
  } finally {
    loading.value = false
  }
}

function openNew() {
  socio.value = { cuotaSocio: 0, activo: true }
  submitted.value = false
  isEditing.value = false
  socioDialog.value = true
}

function editSocio(data) {
  socio.value = { ...data }
  isEditing.value = true
  submitted.value = false
  socioDialog.value = true
}

function viewSocio(data) {
  router.push(`/admin/socios/${data.id}`)
}

function hideDialog() {
  socioDialog.value = false
  submitted.value = false
}

async function saveSocio() {
  submitted.value = true

  if (!socio.value.nombre || !socio.value.email) {
    return
  }

  if (!isEditing.value && !socio.value.password) {
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await sociosService.update(socio.value.id, {
        nombre: socio.value.nombre,
        email: socio.value.email,
        telefono: socio.value.telefono || '',
        cuotaSocio: socio.value.cuotaSocio || 0,
        foto: socio.value.foto,
        activo: socio.value.activo
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Socio actualizado', life: 3000 })
    } else {      await sociosService.create({
        nombre: socio.value.nombre,
        email: socio.value.email,
        password: socio.value.password,
        telefono: socio.value.telefono || '',
        cuotaSocio: socio.value.cuotaSocio || 0,
        foto: socio.value.foto
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Socio creado', life: 3000 })
    }
    hideDialog()
    await loadSocios()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al guardar el socio', 
      life: 3000 
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(data) {
  confirm.require({
    message: `¿Está seguro de eliminar al socio ${data.nombre}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await sociosService.delete(data.id)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Socio eliminado', life: 3000 })
        await loadSocios()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el socio', life: 3000 })
      }
    }
  })
}

onMounted(() => {
  loadSocios()
})
</script>
