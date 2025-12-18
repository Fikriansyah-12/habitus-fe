<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const isAuthenticated = localStorage.getItem('userEmail')
  if (isAuthenticated && router.currentRoute.value.path === '/') {
    router.push('/dashboard')
  }
})
</script>

<template>
  <div class="h-screen flex relative">
    <Sidebar v-if="route.meta.showSidebar" />
    <main 
      class="flex-1 transition-all duration-300 ease-in-out overflow-hidden"
      :style="route.meta.showSidebar ? {} : {}"
    >
      <router-view />
    </main>
  </div>
</template>

<style scoped>
</style>
