<template>
  <nav class="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2">
      <li>
        <RouterLink
          to="/dashboard"
          class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <Iconify icon="mdi:home" :width="18" :height="18" />
          <span class="hidden sm:inline">Home</span>
        </RouterLink>
      </li>

      <li v-if="breadcrumbs.length > 0" class="text-gray-400">
        <Iconify icon="mdi:chevron-right" :width="18" :height="18" />
      </li>

      <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
        <li>
          <RouterLink
            :to="crumb.path"
            :class="[
              'flex items-center gap-2 transition',
              index === breadcrumbs.length - 1
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-blue-600'
            ]"
            :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined"
          >
            <Iconify v-if="crumb.icon" :icon="crumb.icon" :width="18" :height="18" />
            <span>{{ crumb.title }}</span>
          </RouterLink>
        </li>

        <li v-if="index < breadcrumbs.length - 1" class="text-gray-400">
          <Iconify icon="mdi:chevron-right" :width="18" :height="18" />
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import Iconify from './Iconify.vue'

interface BreadcrumbItem {
  path: string
  title: string
  icon?: string
}

const route = useRoute()
const router = useRouter()

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const paths: BreadcrumbItem[] = []
  const routePath = route.path
  const segments = routePath.split('/').filter((s) => s)

  // Build breadcrumb dari path segments
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`

    // Cari route yang match dengan path ini
    const matchedRoute = router
      .getRoutes()
      .find((r) => r.path === currentPath && r.meta?.sidebarTitle)

    if (matchedRoute && matchedRoute.meta?.sidebarTitle) {
      // Skip jika path adalah dashboard dan sudah ada di home
      if (currentPath !== '/dashboard') {
        paths.push({
          path: currentPath,
          title: (matchedRoute.meta?.sidebarTitle as string) || '',
          icon: (matchedRoute.meta?.sidebarIcon as string) || undefined
        })
      }
    }
  }

  return paths
})
</script>

<style scoped>
/* Smooth transition untuk link */
a {
  cursor: pointer;
}
</style>
