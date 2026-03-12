<template>
  <div class="min-h-screen flex flex-column layout-dark">
    <!-- Top Bar -->
    <div class="topbar px-4 py-3 flex align-items-center justify-content-between">      <div class="flex align-items-center gap-3">
        <Button 
          icon="pi pi-bars" 
          text 
          rounded 
          @click="sidebarVisible = true"
          class="lg:hidden btn-menu"
        />
        <img src="/images/logo-udl.png" alt="UDL" class="topbar-logo hidden lg:block" />
        <span class="text-xl font-semibold text-white">UDL - Mi Portal</span>
      </div>
      
      <div class="flex align-items-center gap-3">
        <span class="text-gray-400 hidden md:block">{{ authStore.user?.nombre }}</span>
        <Avatar :label="avatarLabel" shape="circle" class="avatar-red" />
        <Button 
          icon="pi pi-sign-out" 
          text 
          rounded 
          severity="danger"
          @click="handleLogout"
          v-tooltip.bottom="'Cerrar sesión'"
          class="btn-logout"
        />
      </div>
    </div>    <!-- Mobile Sidebar -->
    <Sidebar v-model:visible="sidebarVisible" class="sidebar-dark w-18rem">
      <template #header>
        <div class="flex align-items-center gap-2">
          <img src="/images/logo-udl.png" alt="UDL" class="sidebar-logo" />
          <span class="font-bold text-xl text-white">UDL</span>
        </div>
      </template>
      <Menu :model="menuItems" class="w-full border-none menu-dark" />
    </Sidebar>

    <!-- Main Content with Desktop Sidebar -->
    <div class="flex flex-1">
      <!-- Desktop Sidebar -->
      <div class="hidden lg:block sidebar-desktop w-16rem p-3">
        <Menu :model="menuItems" class="w-full border-none menu-dark" />
      </div>

      <!-- Content -->
      <div class="flex-1 p-4 overflow-auto content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from 'primevue/sidebar'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

const router = useRouter()
const authStore = useAuthStore()

const sidebarVisible = ref(false)

const avatarLabel = computed(() => {
  return authStore.user?.nombre?.charAt(0).toUpperCase() || 'S'
})

const menuItems = ref([
  {
    label: 'Mi Espacio',
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => { router.push('/socio/dashboard'); sidebarVisible.value = false }
      },
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => { router.push('/socio/perfil'); sidebarVisible.value = false }
      },
      {
        label: 'Mis Pagos',
        icon: 'pi pi-dollar',
        command: () => { router.push('/socio/pagos'); sidebarVisible.value = false }
      },      {
        label: 'Tienda',
        icon: 'pi pi-shopping-cart',
        command: () => { router.push('/socio/tienda'); sidebarVisible.value = false }
      },
      {
        label: 'Mis Pedidos',
        icon: 'pi pi-shopping-bag',
        command: () => { router.push('/socio/pedidos'); sidebarVisible.value = false }
      },
      {
        label: 'Disciplinas',
        icon: 'pi pi-users',
        command: () => { router.push('/socio/disciplinas'); sidebarVisible.value = false }
      },
      {
        label: 'Reservar Espacio',
        icon: 'pi pi-calendar-plus',
        command: () => { router.push('/socio/reservas'); sidebarVisible.value = false }
      }
    ]
  }
])

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-dark {
  background: #0a0a0a;
}

.topbar {
  background: #171717;
  border-bottom: 1px solid #2a2a2a;
}

.sidebar-desktop {
  background: #171717;
  border-right: 1px solid #2a2a2a;
}

.content-area {
  background: #0a0a0a;
}

.logo-mini {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar-red {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
  color: white !important;
}

.btn-menu {
  color: #a3a3a3 !important;
}

.btn-menu:hover {
  background: rgba(220, 38, 38, 0.1) !important;
  color: #dc2626 !important;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.topbar-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

:deep(.sidebar-dark) {
  background: #171717 !important;
  border-right: 1px solid #2a2a2a !important;
}

:deep(.menu-dark) {
  background: transparent !important;
}

:deep(.menu-dark .p-menuitem-link) {
  border-radius: 8px;
  margin: 4px 0;
  color: #a3a3a3 !important;
}

:deep(.menu-dark .p-menuitem-link:hover) {
  background: rgba(220, 38, 38, 0.1) !important;
  color: #dc2626 !important;
}

:deep(.menu-dark .p-menuitem-icon) {
  color: #dc2626 !important;
}

:deep(.menu-dark .p-submenu-header) {
  color: #525252 !important;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
