<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import Iconify from './Iconify.vue'
import { apiClient } from '@/utils/api'
import { StorageService } from '@/utils/storage'

interface MenuItem {
  path: string
  title: string
  icon: string
}

const router = useRouter()
const route = useRoute()

const isOpen = ref(true)
const userName = ref('')
const userEmail = ref('')
const expandedMenus = ref(new Set<string>())

const menuItems = computed<MenuItem[]>(() => {
  return router
    .getRoutes()
    .filter(
      (route) =>
        route.meta?.showSidebar &&
        route.meta?.sidebarTitle &&
        route.meta?.sidebarIcon &&
        !route.meta?.submenu
    )
    .map((route) => ({
      path: route.path,
      title: (route.meta?.sidebarTitle as string) || '',
      icon: (route.meta?.sidebarIcon as string) || ''
    }))
})

const hasSubmenu = (parentPath: string): boolean => {
  return router
    .getRoutes()
    .some((route) => route.meta?.parentPath === parentPath)
}

const getSubmenuItems = (parentPath: string): MenuItem[] => {
  return router
    .getRoutes()
    .filter(
      (route) =>
        route.meta?.parentPath === parentPath &&
        route.meta?.submenu &&
        route.meta?.sidebarTitle &&
        route.meta?.sidebarIcon
    )
    .map((route) => ({
      path: route.path,
      title: (route.meta?.sidebarTitle as string) || '',
      icon: (route.meta?.sidebarIcon as string) || ''
    }))
}

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const toggleSubmenu = (path: string) => {
  if (expandedMenus.value.has(path)) {
    expandedMenus.value.delete(path)
  } else {
    expandedMenus.value.add(path)
  }
}

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/')
}

const isParentActive = (parentPath: string): boolean => {
  const submenuItems = getSubmenuItems(parentPath)
  return submenuItems.some((item) => isActive(item.path))
}

const logout = async () => {
  try {
    await apiClient.logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    StorageService.clear()
    router.push('/login')
  }
}

onMounted(() => {
  const user = StorageService.getUser()
  const email = StorageService.getEmail()
  
  userEmail.value = email || 'User'
  userName.value = user?.name || 'User'

  if (isParentActive('/users')) {
    expandedMenus.value.add('/users')
  }
})
</script>

<template>
  <aside
    :class="[
      'bg-gray-800 text-white transition-all duration-300 flex flex-col',
      isOpen ? 'w-64' : 'w-20',
      'h-screen z-50 shadow-lg flex-shrink-0'
    ]"
  >
    <!-- Logo Section -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <img
        v-if="isOpen"
        src="@/assets/logo/logo.png"
        alt="Logo"
        class="h-8"
      />
      <button
        @click="toggleSidebar"
        class="p-2 hover:bg-gray-800 rounded-lg transition duration-200"
        :title="isOpen ? 'Collapse' : 'Expand'"
      >
        <Iconify icon="mdi:menu" :width="20" :height="20" />
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-2">
        <template v-for="item in menuItems" :key="item.path">
          <!-- Menu Item dengan Submenu -->
          <li v-if="hasSubmenu(item.path)" class="group">
            <button
              @click="toggleSubmenu(item.path)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200',
                'hover:bg-gray-800',
                isParentActive(item.path)
                  ? 'bg-cyan-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-cyan-700'
              ]"
              :title="!isOpen ? item.title : ''"
            >
              <Iconify :icon="item.icon" :width="20" :height="20" />
              <span v-if="isOpen" class="text-sm font-medium flex-1 text-left">{{ item.title }}</span>
              <Iconify 
                v-if="isOpen"
                :icon="expandedMenus.has(item.path) ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                :width="16" 
                :height="16"
                class="transition-transform"
              />
            </button>

            <!-- Submenu Items -->
            <ul
              v-if="expandedMenus.has(item.path) && isOpen"
              class="space-y-1 mt-1 pl-4"
            >
              <li v-for="subItem in getSubmenuItems(item.path)" :key="subItem.path">
                <RouterLink
                  :to="subItem.path"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition duration-200',
                    'hover:bg-gray-800',
                    isActive(subItem.path)
                      ? 'bg-cyan-700/40 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-cyan-700'
                  ]"
                >
                  <Iconify :icon="subItem.icon" :width="16" :height="16" />
                  <span>{{ subItem.title }}</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- Menu Item tanpa Submenu -->
          <li v-else>
            <RouterLink
              :to="item.path"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200',
                'hover:bg-cyan-800',
                isActive(item.path)
                  ? 'bg-cyan-700 text-white'
                  : 'text-gray-300 hover:text-white'
              ]"
              :title="!isOpen ? item.title : ''"
            >
              <Iconify :icon="item.icon" :width="20" :height="20" />
              <span v-if="isOpen" class="text-sm font-medium">{{ item.title }}</span>
            </RouterLink>
          </li>
        </template>
      </ul>
    </nav>

    <!-- User Section -->
    <div v-if="isOpen" class="border-t border-gray-700 p-4">
      <div class="flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ userName }}</p>
          <p class="text-xs text-gray-400 truncate">{{ userEmail }}</p>
        </div>
        <button
          @click="logout"
          class="p-2 hover:bg-red-800 bg-red-500/70 rounded-lg transition duration-200 flex-shrink-0"
          title="Logout"
        >
          <Iconify icon="mdi:logout" :width="16" :height="16" />
        </button>
      </div>
    </div>
  </aside>
</template>


<style scoped>
/* Scrollbar styling */
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
