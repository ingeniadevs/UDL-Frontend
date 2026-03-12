<template>
  <div class="min-h-screen flex align-items-center justify-content-center" style="background: #0a0a0a">
    <div class="text-center">
      <img src="/images/logo-udl.png" alt="UDL" style="width: 120px; margin-bottom: 2rem" />
      <div class="text-6xl text-primary mb-4">404</div>
      <h1 class="text-white text-3xl mb-3">Página no encontrada</h1>
      <p class="text-gray-400 mb-5">La página que buscas no existe.</p>
      <Button label="Volver al inicio" icon="pi pi-home" @click="goHome" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

function goHome() {
  router.push('/login')
}
</script>
