<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-4">Mi Perfil</h1>

    <div v-if="loading" class="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>

    <div v-else class="grid">      <!-- Profile Card -->
      <div class="col-12 lg:col-4">
        <div class="card">
          <div class="flex flex-column align-items-center text-center">
            <div class="profile-photo-container mb-3" @click="showPhotoDialog = true">
              <img 
                v-if="socio.foto" 
                :src="socio.foto" 
                alt="Foto de perfil"
                class="profile-photo"
              />
              <Avatar 
                v-else
                :label="socio.nombre?.charAt(0).toUpperCase()" 
                size="xlarge" 
                shape="circle" 
                class="avatar-red"
                style="width: 6rem; height: 6rem; font-size: 2rem"
              />
              <div class="photo-overlay">
                <i class="pi pi-camera"></i>
              </div>
            </div>
            <h2 class="text-2xl font-bold text-white mb-1">{{ socio.nombre }}</h2>
            <span class="text-gray-400 mb-2">{{ socio.email }}</span>
            <Tag severity="info" :value="'Socio #' + socio.numeroSocio" />
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="col-12 lg:col-8">
        <div class="card">
          <h3 class="text-xl font-semibold mb-4 text-white">Información Personal</h3>
          
          <div class="grid">
            <div class="col-12 md:col-6 mb-4">
              <label class="block text-gray-400 mb-2">Nombre Completo</label>
              <div class="text-white font-medium">{{ socio.nombre }}</div>
            </div>
            <div class="col-12 md:col-6 mb-4">
              <label class="block text-gray-400 mb-2">Número de Socio</label>
              <div class="text-white font-medium">{{ socio.numeroSocio }}</div>
            </div>
            <div class="col-12 md:col-6 mb-4">
              <label class="block text-gray-400 mb-2">Email</label>
              <div class="text-white font-medium">{{ socio.email }}</div>
            </div>
            <div class="col-12 md:col-6 mb-4">
              <label class="block text-gray-400 mb-2">Teléfono</label>
              <div class="text-white font-medium">{{ socio.telefono || 'No registrado' }}</div>
            </div>
            <div class="col-12 md:col-6 mb-4">
              <label class="block text-gray-400 mb-2">Cuota Mensual</label>
              <div class="text-white font-medium">${{ socio.cuotaSocio?.toLocaleString() }}</div>
            </div>
            <div class="col-12 md:col-6 mb-4">
              <label class="block text-gray-400 mb-2">Miembro desde</label>
              <div class="text-white font-medium">{{ formatDate(socio.createdAt) }}</div>
            </div>
          </div>

          <Divider />

          <h3 class="text-xl font-semibold mb-4 text-white">Mis Inscripciones</h3>
          
          <div v-if="socio.inscripciones?.length === 0" class="text-center text-gray-400 py-3">
            No tienes inscripciones activas
          </div>
          <div v-else class="flex flex-wrap gap-3">
            <div v-for="insc in socio.inscripciones" :key="insc.id" 
                 class="inscription-item flex align-items-center gap-2 p-3 border-round">
              <i class="pi pi-bookmark text-red-400"></i>
              <span class="font-medium text-white">{{ insc.disciplinaNombre }}</span>
              <Tag :severity="insc.activa ? 'success' : 'danger'" size="small" 
                   :value="insc.activa ? 'Activa' : 'Inactiva'" />
            </div>          </div>
        </div>
      </div>
    </div>

    <!-- Photo Upload Dialog -->
    <Dialog 
      v-model:visible="showPhotoDialog" 
      header="Cambiar Foto de Perfil" 
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="pt-3">
        <ImageUpload v-model="newPhoto" placeholder="Subir foto de perfil" />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="showPhotoDialog = false" />
        <Button label="Guardar" icon="pi pi-check" @click="savePhoto" :loading="savingPhoto" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { sociosService } from '@/services'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ImageUpload from '@/components/shared/ImageUpload.vue'

const toast = useToast()
const authStore = useAuthStore()

const socio = ref({})
const loading = ref(true)
const showPhotoDialog = ref(false)
const newPhoto = ref('')
const savingPhoto = ref(false)

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

async function loadProfile() {
  loading.value = true
  try {
    socio.value = await sociosService.getById(authStore.user.id)
    newPhoto.value = socio.value.foto || ''
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

async function savePhoto() {
  savingPhoto.value = true
  try {
    await sociosService.update(authStore.user.id, {
      ...socio.value,
      foto: newPhoto.value
    })
    socio.value.foto = newPhoto.value
    showPhotoDialog.value = false
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Foto actualizada', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la foto', life: 3000 })
  } finally {
    savingPhoto.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-photo-container {
  position: relative;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-overlay i {
  color: white;
  font-size: 1.5rem;
}

.profile-photo-container:hover .photo-overlay {
  opacity: 1;
}

.inscription-item {
  background: #262626;
  border: 1px solid #3a3a3a;
}

.avatar-red {
  background-color: #dc2626 !important;
}
</style>
