<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-blue-600">Dashboard</h1>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-gray-700">Welcome, {{ userEmail }}</span>
            <Button variant="secondary" size="sm" @click="handleLogout">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Welcome back!</h2>
        <p class="text-gray-600 mt-2">Here's what's happening with your account today.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">Total Users</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">1,234</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.656" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">Revenue</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">$12,450</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">Orders</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">456</p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">Growth</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">+12.5%</p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between border-b pb-4 last:border-b-0">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold">U{{ i }}</span>
              </div>
              <div>
                <p class="text-gray-900 font-medium">User {{ i }} activity</p>
                <p class="text-gray-500 text-sm">2 hours ago</p>
              </div>
            </div>
            <span class="text-green-600 font-semibold">+${{ (i * 100).toString().padStart(4, '0') }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex gap-4">
        <Button @click="handleRefresh" :loading="isRefreshing">
          {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
        </Button>
        <Button variant="secondary" @click="handleDownload" :loading="isDownloading">
          {{ isDownloading ? 'Downloading...' : 'Download Report' }}
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from './Button.vue'

const router = useRouter()
const userEmail = ref('user@example.com')
const isRefreshing = ref(false)
const isDownloading = ref(false)

onMounted(() => {
  const storedEmail = localStorage.getItem('userEmail')
  if (storedEmail) {
    userEmail.value = storedEmail
  }
})

const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    // Simulasi refresh data
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Data refreshed successfully!')
  } finally {
    isRefreshing.value = false
  }
}

const handleDownload = async () => {
  isDownloading.value = true
  try {
    // Simulasi download
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Report downloaded successfully!')
  } finally {
    isDownloading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('userEmail')
  router.push('/')
}
</script>
