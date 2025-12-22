<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation Bar -->
    <nav class="bg-white shadow-sm sticky top-0 z-40">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-sm text-gray-500 mt-1">Welcome back, {{ userEmail }}</p>
          </div>
         <div>
            <Breadcrumb />
          </div>
          </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="px-6 py-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Welcome back!</h2>
        <p class="text-gray-600 mt-2">Here's what's happening with your account today.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value="1,234" 
          icon="mdi:account-group"
          trend="+5.2%"
          trendPositive
        />
        <StatCard 
          title="Revenue" 
          value="$12,450" 
          icon="mdi:cash-multiple"
          trend="+8.1%"
          trendPositive
        />
        <StatCard 
          title="Orders" 
          value="456" 
          icon="mdi:shopping-cart"
          trend="-2.3%"
          :trendPositive="false"
        />
        <StatCard 
          title="Growth" 
          value="+12.5%" 
          icon="mdi:chart-line"
          trend="+3.8%"
          trendPositive
        />
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Activity List -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <div 
              v-for="i in 5" 
              :key="i" 
              class="flex items-center justify-between border-b pb-4 last:border-b-0 hover:bg-gray-50 p-2 rounded transition"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-blue-600 font-semibold text-xs">U{{ i }}</span>
                </div>
                <div>
                  <p class="text-gray-900 font-medium">User {{ i }} activity</p>
                  <p class="text-gray-500 text-sm">{{ getTimeAgo(i) }}</p>
                </div>
              </div>
              <span class="text-green-600 font-semibold whitespace-nowrap">+${{ (i * 100).toString().padStart(4, '0') }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center pb-4 border-b">
              <span class="text-gray-600">Conversion Rate</span>
              <span class="font-bold text-gray-900">3.48%</span>
            </div>
            <div class="flex justify-between items-center pb-4 border-b">
              <span class="text-gray-600">Avg. Order Value</span>
              <span class="font-bold text-gray-900">$284.50</span>
            </div>
            <div class="flex justify-between items-center pb-4 border-b">
              <span class="text-gray-600">Total Profit</span>
              <span class="font-bold text-green-600">$42,890</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Customer Retention</span>
              <span class="font-bold text-gray-900">84.2%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <Button @click="handleRefresh" :loading="isRefreshing">
          <Iconify icon="mdi:refresh" :width="18" :height="18" v-if="!isRefreshing" />
          {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
        </Button>
        <Button variant="secondary" @click="handleDownload" :loading="isDownloading">
          <Iconify icon="mdi:download" :width="18" :height="18" v-if="!isDownloading" />
          {{ isDownloading ? 'Downloading...' : 'Download Report' }}
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import Button from '@/components/Button.vue'
import Iconify from '@/components/Iconify.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

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
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Data refreshed successfully!')
  } finally {
    isRefreshing.value = false
  }
}

const handleDownload = async () => {
  isDownloading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Report downloaded successfully!')
  } finally {
    isDownloading.value = false
  }
}

const getTimeAgo = (hours: number): string => {
  return `${hours * 2} hours ago`
}
</script>
