import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.rol === 'admin')
  const isSocio = computed(() => user.value?.rol === 'socio')

  async function loginAdmin(email, password) {
    const response = await authService.loginAdmin(email, password)
    setAuth(response)
    return response
  }

  async function loginSocio(email, password) {
    const response = await authService.loginSocio(email, password)
    setAuth(response)
    return response
  }

  function setAuth(data) {
    token.value = data.token
    user.value = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isSocio,
    loginAdmin,
    loginSocio,
    logout
  }
})
