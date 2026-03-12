<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold text-white m-0">Disciplinas</h1>
      <Button label="Nueva Disciplina" icon="pi pi-plus" @click="openNew" />
    </div>

    <div class="card">
      <DataTable 
        :value="disciplinas" 
        :loading="loading"
        :paginator="true"
        :rows="10"
        dataKey="id"
        responsiveLayout="scroll"
      >
        <Column field="nombre" header="Nombre" sortable style="min-width: 150px"></Column>
        <Column field="descripcion" header="Descripción" style="min-width: 250px">
          <template #body="slotProps">
            {{ slotProps.data.descripcion || '-' }}
          </template>
        </Column>        <Column header="Cuota Mensual" sortable style="min-width: 120px">
          <template #body="slotProps">
            ${{ slotProps.data.cuotaMensual?.toLocaleString() }}
          </template>
        </Column>
        <Column field="empleadoNombre" header="Profesor" style="min-width: 150px">
          <template #body="slotProps">
            {{ slotProps.data.empleadoNombre || 'Sin asignar' }}
          </template>
        </Column>
        <Column header="Estado" style="min-width: 100px">
          <template #body="slotProps">
            <Tag :severity="slotProps.data.activa ? 'success' : 'danger'" 
                 :value="slotProps.data.activa ? 'Activa' : 'Inactiva'" />
          </template>
        </Column>
        <Column header="Acciones" style="min-width: 120px">
          <template #body="slotProps">
            <Button 
              icon="pi pi-pencil" 
              text 
              rounded 
              class="mr-2" 
              severity="success"
              @click="editDisciplina(slotProps.data)"
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
      v-model:visible="disciplinaDialog" 
      :header="isEditing ? 'Editar Disciplina' : 'Nueva Disciplina'" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-column gap-4 pt-3">
        <div class="field">
          <label for="nombre" class="font-medium text-gray-300">Nombre *</label>
          <InputText id="nombre" v-model="disciplina.nombre" class="w-full" :class="{ 'p-invalid': submitted && !disciplina.nombre }" />
          <small v-if="submitted && !disciplina.nombre" class="p-error">El nombre es requerido</small>
        </div>
        
        <div class="field">
          <label for="descripcion" class="font-medium text-gray-300">Descripción</label>
          <Textarea id="descripcion" v-model="disciplina.descripcion" rows="3" class="w-full" />
        </div>        <div class="field">
          <label for="cuota" class="font-medium text-gray-300">Cuota Mensual *</label>
          <InputNumber id="cuota" v-model="disciplina.cuotaMensual" mode="currency" currency="USD" class="w-full" />
        </div>

        <div class="field">
          <label for="empleado" class="font-medium text-gray-300">Profesor/Instructor</label>
          <Dropdown 
            id="empleado"
            v-model="disciplina.empleadoId" 
            :options="empleados" 
            optionLabel="nombreCompleto" 
            optionValue="id"
            placeholder="Seleccione un profesor"
            class="w-full"
            showClear
            filter
          />
        </div>

        <div class="field" v-if="isEditing">
          <label for="activa" class="font-medium text-gray-300">Estado</label>
          <div class="flex align-items-center gap-2 mt-2">
            <InputSwitch id="activa" v-model="disciplina.activa" />
            <span class="text-gray-300">{{ disciplina.activa ? 'Activa' : 'Inactiva' }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveDisciplina" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { disciplinasService, empleadosService } from '@/services'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'

const toast = useToast()
const confirm = useConfirm()

const disciplinas = ref([])
const empleados = ref([])
const loading = ref(false)
const disciplinaDialog = ref(false)
const submitted = ref(false)
const saving = ref(false)
const isEditing = ref(false)

const disciplina = ref({})

async function loadDisciplinas() {
  loading.value = true
  try {
    const [disciplinasData, empleadosData] = await Promise.all([
      disciplinasService.getAll(),
      empleadosService.getAll()
    ])
    disciplinas.value = disciplinasData
    empleados.value = empleadosData.map(e => ({
      ...e,
      nombreCompleto: `${e.nombre} ${e.apellido}`
    }))
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 })
  } finally {
    loading.value = false
  }
}

function openNew() {
  disciplina.value = { cuotaMensual: 0, activa: true }
  submitted.value = false
  isEditing.value = false
  disciplinaDialog.value = true
}

function editDisciplina(data) {
  disciplina.value = { ...data }
  isEditing.value = true
  submitted.value = false
  disciplinaDialog.value = true
}

function hideDialog() {
  disciplinaDialog.value = false
  submitted.value = false
}

async function saveDisciplina() {
  submitted.value = true

  if (!disciplina.value.nombre) {
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await disciplinasService.update(disciplina.value.id, {
        nombre: disciplina.value.nombre,
        descripcion: disciplina.value.descripcion,
        cuotaMensual: disciplina.value.cuotaMensual || 0,
        activa: disciplina.value.activa,
        empleadoId: disciplina.value.empleadoId || null
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Disciplina actualizada', life: 3000 })
    } else {
      await disciplinasService.create({
        nombre: disciplina.value.nombre,
        descripcion: disciplina.value.descripcion,
        cuotaMensual: disciplina.value.cuotaMensual || 0,
        empleadoId: disciplina.value.empleadoId || null
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Disciplina creada', life: 3000 })
    }
    hideDialog()
    await loadDisciplinas()
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Error al guardar la disciplina', 
      life: 3000 
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(data) {
  confirm.require({
    message: `¿Está seguro de eliminar la disciplina ${data.nombre}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await disciplinasService.delete(data.id)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Disciplina eliminada', life: 3000 })
        await loadDisciplinas()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la disciplina', life: 3000 })
      }
    }
  })
}

onMounted(() => {
  loadDisciplinas()
})
</script>
