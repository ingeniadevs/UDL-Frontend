<template>
  <div class="card text-center py-6">
    <i :class="icon" class="text-4xl text-300 mb-3"></i>
    <p class="text-500">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'No hay datos disponibles'
  },
  icon: {
    type: String,
    default: 'pi pi-inbox'
  }
})
</script>
