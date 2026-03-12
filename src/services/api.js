import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage to avoid Pinia initialization issues
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Import dynamically to avoid circular dependency issues
      import('@/stores/auth').then(({ useAuthStore }) => {
        const authStore = useAuthStore()
        authStore.logout()
      })
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api
