import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/auth/AdminLoginView.vue')
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue')
      },
      {
        path: 'socios',
        name: 'Socios',
        component: () => import('@/views/admin/SociosView.vue')
      },
      {
        path: 'socios/:id',
        name: 'SocioDetail',
        component: () => import('@/views/admin/SocioDetailView.vue')
      },
      {
        path: 'disciplinas',
        name: 'Disciplinas',
        component: () => import('@/views/admin/DisciplinasView.vue')
      },
      {
        path: 'pagos',
        name: 'Pagos',
        component: () => import('@/views/admin/PagosView.vue')
      },
      {
        path: 'productos',
        name: 'Productos',
        component: () => import('@/views/admin/ProductosView.vue')
      },
      {
        path: 'pedidos',
        name: 'Pedidos',
        component: () => import('@/views/admin/PedidosView.vue')
      },
      {
        path: 'empleados',
        name: 'Empleados',
        component: () => import('@/views/admin/EmpleadosView.vue')
      },
      {
        path: 'espacios',
        name: 'Espacios',
        component: () => import('@/views/admin/EspaciosView.vue')
      },
      {
        path: 'reservas',
        name: 'Reservas',
        component: () => import('@/views/admin/ReservasView.vue')
      }
    ]
  },
  {
    path: '/socio',
    component: () => import('@/layouts/SocioLayout.vue'),
    meta: { requiresAuth: true, role: 'socio' },
    children: [
      {
        path: '',
        redirect: '/socio/dashboard'
      },
      {
        path: 'dashboard',
        name: 'SocioDashboard',
        component: () => import('@/views/socio/DashboardView.vue')
      },
      {
        path: 'pagos',
        name: 'MisPagos',
        component: () => import('@/views/socio/MisPagosView.vue')
      },
      {
        path: 'perfil',
        name: 'MiPerfil',
        component: () => import('@/views/socio/PerfilView.vue')
      },      {
        path: 'tienda',
        name: 'Tienda',
        component: () => import('@/views/socio/TiendaView.vue')
      },
      {
        path: 'pedidos',
        name: 'MisPedidos',
        component: () => import('@/views/socio/MisPedidosView.vue')
      },
      {
        path: 'disciplinas',
        name: 'MisDisciplinas',
        component: () => import('@/views/socio/DisciplinasView.vue')
      },
      {
        path: 'reservas',
        name: 'MisReservas',
        component: () => import('@/views/socio/ReservasView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/auth/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Si ya está autenticado y trata de ir al login, redirigir al dashboard
  if ((to.name === 'Login' || to.name === 'AdminLogin') && authStore.isAuthenticated) {
    if (authStore.user?.rol === 'admin') {
      next('/admin/dashboard')
    } else {
      next('/socio/dashboard')
    }
    return
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirigir al login correspondiente
    if (to.meta.role === 'admin') {
      next('/admin/login')
    } else {
      next('/login')
    }
  } else if (to.meta.role && authStore.user?.rol !== to.meta.role) {
    if (authStore.user?.rol === 'admin') {
      next('/admin/dashboard')
    } else if (authStore.user?.rol === 'socio') {
      next('/socio/dashboard')
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
