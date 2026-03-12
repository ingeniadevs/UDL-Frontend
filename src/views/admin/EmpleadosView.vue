<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold text-white">Empleados</h1>
      <Button label="Nuevo Empleado" icon="pi pi-plus" @click="openNewDialog" />
    </div>

    <div class="card">
      <DataTable 
        :value="empleados" 
        :loading="loading"
        :paginator="true" 
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        dataKey="id"
        filterDisplay="row"
        :globalFilterFields="['nombre', 'apellido', 'email', 'puesto']"
        responsiveLayout="scroll"
        stripedRows
      >
        <template #header>
          <div class="flex justify-content-end">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters.global.value" placeholder="Buscar..." />
            </IconField>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4 text-gray-400">
            No se encontraron empleados
          </div>
        </template>

        <Column field="nombre" header="Nombre" sortable>
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <Avatar 
                :label="(data.nombre?.charAt(0) + data.apellido?.charAt(0)).toUpperCase()" 
                shape="circle" 
                class="avatar-red"
              />
              <span class="font-medium text-white">{{ data.nombre }} {{ data.apellido }}</span>
            </div>
          </template>
        </Column>

        <Column field="email" header="Email" sortable>
          <template #body="{ data }">
            <span class="text-gray-300">{{ data.email }}</span>
          </template>
        </Column>

        <Column field="puesto" header="Puesto" sortable>
          <template #body="{ data }">
            <Tag :value="data.puesto" severity="info" />
          </template>
        </Column>

        <Column field="salario" header="Salario" sortable>
          <template #body="{ data }">
            <span class="text-green-400 font-semibold">${{ data.salario?.toLocaleString() }}</span>
          </template>
        </Column>

        <Column field="fechaIngreso" header="Fecha Ingreso" sortable>
          <template #body="{ data }">
            <span class="text-gray-300">{{ formatDate(data.fechaIngreso) }}</span>
          </template>
        </Column>

        <Column field="activo" header="Estado" sortable>
          <template #body="{ data }">
            <Tag :severity="data.activo ? 'success' : 'danger'" :value="data.activo ? 'Activo' : 'Inactivo'" />
          </template>
        </Column>

        <Column header="Acciones" style="width: 150px">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" severity="info" text rounded @click="openEditDialog(data)" />
              <Button icon="pi pi-trash" severity="danger" text rounded @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog Crear/Editar -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="isEditing ? 'Editar Empleado' : 'Nuevo Empleado'" 
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="grid">
        <div class="col-12 md:col-6">
          <label class="block text-gray-300 mb-2">Nombre *</label>
          <InputText v-model="form.nombre" class="w-full" placeholder="Nombre" />
        </div>
        <div class="col-12 md:col-6">
          <label class="block text-gray-300 mb-2">Apellido *</label>
          <InputText v-model="form.apellido" class="w-full" placeholder="Apellido" />
        </div>
        <div class="col-12">
          <label class="block text-gray-300 mb-2">Email *</label>
          <InputText v-model="form.email" type="email" class="w-full" placeholder="email@ejemplo.com" />
        </div>
        <div class="col-12 md:col-6">
          <label class="block text-gray-300 mb-2">Teléfono</label>
          <InputText v-model="form.telefono" class="w-full" placeholder="Teléfono" />
        </div>
        <div class="col-12 md:col-6">
          <label class="block text-gray-300 mb-2">Puesto *</label>
          <Dropdown 
            v-model="form.puesto" 
            :options="puestos" 
            class="w-full" 
            placeholder="Seleccionar puesto"
            editable
          />
        </div>
        <div class="col-12 md:col-6">
          <label class="block text-gray-300 mb-2">Salario *</label>
          <InputNumber v-model="form.salario" mode="currency" currency="ARS" locale="es-AR" class="w-full" />
        </div>
        <div class="col-12 md:col-6" v-if="!isEditing">
          <label class="block text-gray-300 mb-2">Fecha Ingreso</label>
          <Calendar v-model="form.fechaIngreso" dateFormat="dd/mm/yy" class="w-full" />
        </div>
        <div class="col-12" v-if="isEditing">
          <div class="flex align-items-center gap-2">
            <Checkbox v-model="form.activo" :binary="true" inputId="activo" />
            <label for="activo" class="text-gray-300">Empleado activo</label>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="Guardar" icon="pi pi-check" @click="save" :loading="saving" />
      </template>
    </Dialog>

    <!-- Confirm Delete -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { empleadosService } from '@/services'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import ConfirmDialog from 'primevue/confirmdialog'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const toast = useToast()
const confirm = useConfirm()

const empleados = ref([])
const loading = ref(true)
const dialogVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingId = ref(null)

const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

const puestos = ref([
  'Recepcionista',
  'Entrenador',
  'Profesor',
  'Mantenimiento',
  'Limpieza',
  'Administrativo',
  'Seguridad',
  'Coordinador',
  'Gerente'
])

const defaultForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  puesto: '',
  salario: 0,
  fechaIngreso: new Date(),
  activo: true
}

const form = ref({ ...defaultForm })

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES')
}

async function loadEmpleados() {
  loading.value = true
  try {
    empleados.value = await empleadosService.getAll()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los empleados', life: 3000 })
  } finally {
    loading.value = false
  }
}

function openNewDialog() {
  form.value = { ...defaultForm, fechaIngreso: new Date() }
  isEditing.value = false
  editingId.value = null
  dialogVisible.value = true
}

function openEditDialog(empleado) {
  form.value = {
    nombre: empleado.nombre,
    apellido: empleado.apellido,
    email: empleado.email,
    telefono: empleado.telefono || '',
    puesto: empleado.puesto,
    salario: empleado.salario,
    activo: empleado.activo
  }
  isEditing.value = true
  editingId.value = empleado.id
  dialogVisible.value = true
}

async function save() {
  if (!form.value.nombre || !form.value.apellido || !form.value.email || !form.value.puesto) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos obligatorios', life: 3000 })
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await empleadosService.update(editingId.value, form.value)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Empleado actualizado', life: 3000 })
    } else {
      await empleadosService.create(form.value)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Empleado creado', life: 3000 })
    }
    dialogVisible.value = false
    await loadEmpleados()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al guardar'
    toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
  } finally {
    saving.value = false
  }
}

function confirmDelete(empleado) {
  confirm.require({
    message: `¿Está seguro de eliminar al empleado ${empleado.nombre} ${empleado.apellido}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteEmpleado(empleado.id)
  })
}

async function deleteEmpleado(id) {
  try {
    await empleadosService.delete(id)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Empleado eliminado', life: 3000 })
    await loadEmpleados()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el empleado', life: 3000 })
  }
}

onMounted(() => {
  loadEmpleados()
})
</script>

<style scoped>
.avatar-red {
  background-color: #dc2626 !important;
  color: white !important;
}
</style>
