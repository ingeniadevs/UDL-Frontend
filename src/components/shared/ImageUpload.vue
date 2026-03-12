<template>
  <div class="image-upload">
    <div 
      class="upload-area"
      :class="{ 'has-image': hasImage, 'dragging': isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input 
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden-input"
        @change="handleFileSelect"
      />
      
      <div v-if="hasImage" class="preview-container">
        <img :src="displayUrl" alt="Preview" class="preview-image" @error="handleImageError" />
        <div class="preview-overlay">
          <Button 
            icon="pi pi-trash" 
            class="p-button-rounded p-button-danger p-button-sm"
            @click.stop="removeImage"
            v-tooltip.top="'Eliminar imagen'"
          />
          <Button 
            icon="pi pi-refresh" 
            class="p-button-rounded p-button-secondary p-button-sm ml-2"
            @click.stop="triggerFileInput"
            v-tooltip.top="'Cambiar imagen'"
          />
        </div>
      </div>
      
      <div v-else class="upload-placeholder">
        <i class="pi pi-cloud-upload"></i>
        <span>{{ placeholder }}</span>
        <small>Click o arrastra una imagen aquí</small>
      </div>
    </div>
    
    <small v-if="error" class="p-error block mt-2">{{ error }}</small>
    <small v-if="uploading" class="text-gray-400 block mt-2">
      <i class="pi pi-spin pi-spinner mr-2"></i>Subiendo imagen...
    </small>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'
import api from '@/services/api'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Subir imagen'
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const localPreview = ref('') // Para preview local antes de subir
const isDragging = ref(false)
const uploading = ref(false)
const error = ref('')
const imageLoadError = ref(false)

// Determina si hay una imagen para mostrar
const hasImage = computed(() => {
  return !!(localPreview.value || props.modelValue)
})

// URL a mostrar (prioriza preview local, luego modelValue)
const displayUrl = computed(() => {
  if (localPreview.value) return localPreview.value
  if (!props.modelValue) return ''
  // Si es una URL relativa, asegurar que funcione con el proxy
  if (props.modelValue.startsWith('/uploads')) return props.modelValue
  if (props.modelValue.startsWith('http')) return props.modelValue
  return props.modelValue
})

// Cuando cambia modelValue externo, limpiar preview local
watch(() => props.modelValue, () => {
  localPreview.value = ''
  imageLoadError.value = false
})

function handleImageError() {
  imageLoadError.value = true
  console.error('Error loading image:', displayUrl.value)
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    uploadFile(file)
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    uploadFile(file)
  }
}

async function uploadFile(file) {
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    error.value = 'Por favor selecciona un archivo de imagen'
    return
  }

  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'La imagen no puede superar los 5MB'
    return
  }

  error.value = ''
  imageLoadError.value = false

  // Crear preview local inmediatamente
  const reader = new FileReader()
  reader.onload = (e) => {
    localPreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Una vez subido, emitir la URL del servidor
    const serverUrl = response.data.url
    emit('update:modelValue', serverUrl)
    // Mantener el preview local hasta que se confirme la carga
    localPreview.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al subir la imagen'
    console.error('Upload error:', err)
    // En caso de error, limpiar preview local
    localPreview.value = ''
  } finally {
    uploading.value = false
  }
}

function removeImage() {
  localPreview.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #3a3a3a;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #1a1a1a;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #dc2626;
  background: rgba(220, 38, 38, 0.05);
}

.upload-area.dragging {
  border-color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.upload-area.has-image {
  padding: 0;
  border-style: solid;
}

.hidden-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.upload-placeholder i {
  font-size: 2.5rem;
  color: #dc2626;
}

.upload-placeholder span {
  font-weight: 500;
  color: #9ca3af;
}

.upload-placeholder small {
  color: #6b7280;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 10px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
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

.preview-container:hover .preview-overlay {
  opacity: 1;
}
</style>
