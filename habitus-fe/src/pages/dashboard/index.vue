<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import Iconify from '@/components/Iconify.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/utils/api'
import type { OnsiteRequestDto, QuoteDto } from '@/types'
import type { Customer } from '@/types/customer'

const router = useRouter()
const userEmail = ref('user@example.com')
const userName = ref('User')
const isLoading = ref(false)
// const isRefreshing = ref(false)
const errorMessage = ref('')

const requests = ref<OnsiteRequestDto[]>([])
const customers = ref<Customer[]>([])
const quotes = ref<QuoteDto[]>([])

// Calculate stats
const totalRequests = computed(() => requests.value.length)
const approvedRequests = computed(() => requests.value.filter(r => r.status === 'APPROVED').length)
const pendingRequests = computed(() => requests.value.filter(r => r.status === 'REQUESTED').length)
const rejectedRequests = computed(() => requests.value.filter(r => r.status === 'REJECTED').length)
const totalCustomers = computed(() => customers.value.length)
const totalQuotes = computed(() => quotes.value.length)

const approvalRate = computed(() => {
  if (totalRequests.value === 0) return 0
  return Math.round((approvedRequests.value / totalRequests.value) * 100)
})

// const pendingActions = computed(() => pendingRequests.value + rejectedRequests.value)

const recentRequests = computed(() => 
  requests.value.slice(0, 10)
)

const pendingRequestsList = computed(() => 
  requests.value.filter(r => r.status === 'REQUESTED').slice(0, 5)
)

onMounted(async () => {
  const storedEmail = localStorage.getItem('rememberedEmail') || localStorage.getItem('userEmail')
  const storedUser = localStorage.getItem('user')
  
  if (storedEmail) {
    userEmail.value = storedEmail
  }
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      userName.value = user.name || 'User'
    } catch (e) {
      userName.value = 'User'
    }
  }
  
  await loadDashboardData()
})

const loadDashboardData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const [requestsRes, quotesRes] = await Promise.all([
      apiClient.getOnsiteRequests(1, 100).catch(() => ({ data: [], total: 0 })),
      apiClient.getQuotes().catch(() => [])
    ])
    
    requests.value = requestsRes.data || []
    quotes.value = Array.isArray(quotesRes) ? quotesRes : []
    
    const uniqueCustomerNames = new Set(
      requests.value
        .map(r => r.customerName)
        .filter((name): name is string => Boolean(name))
    )
    customers.value = Array.from(uniqueCustomerNames).map((name, i) => ({
      id: i.toString(),
      name,
      phone: '',
      createdAt: '',
      updatedAt: ''
    }))
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to load dashboard data'
    errorMessage.value = message
  } finally {
    isLoading.value = false
  }
}

// const handleRefresh = async () => {
//   isRefreshing.value = true
//   try {
//     await loadDashboardData()
//   } finally {
//     isRefreshing.value = false
//   }
// }

const navigateTo = (path: string | object) => {
  if (typeof path === 'string') {
    router.push(path)
  } else {
    router.push(path)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

// const getStatusIcon = (status: string) => {
//   switch (status) {
//     case 'APPROVED':
//       return 'mdi:check-circle'
//     case 'REJECTED':
//       return 'mdi:close-circle'
//     default:
//       return 'mdi:clock-outline'
//   }
// }
</script>
<template>
  <div class="bg-gray-50">
    <!-- Top Navigation Bar -->
    <nav class="bg-white shadow-sm sticky top-0 z-40">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-sm text-gray-500 mt-1">Welcome back, {{ userName }}</p>
          </div>
          <div>
            <Breadcrumb />
          </div>
        </div>
      </div>
    </nav>

    <main class="px-6 py-8 max-w-7xl mx-auto pb-16">
      <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-500">Loading dashboard data...</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Requests" 
            :value="totalRequests.toString()" 
            icon="mdi:file-document-multiple"
          />
          <StatCard 
            title="Approved" 
            :value="approvedRequests.toString()" 
            icon="mdi:check-circle"
            trendPositive
          />
          <StatCard 
            title="Pending Review" 
            :value="pendingRequests.toString()" 
            icon="mdi:clock-outline"
          />
          <StatCard 
            title="Approval Rate" 
            :value="`${approvalRate}%`" 
            icon="mdi:percent"
            trendPositive
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="lg:col-span-2 bg-white rounded-lg shadow">
            <div class="border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Iconify icon="mdi:alert-circle" :width="24" :height="24" class="text-orange-500" />
                  Pending Review
                </h3>
                <p class="text-sm text-gray-500 mt-1">{{ pendingRequests }} requests awaiting your approval</p>
              </div>
              <span v-if="pendingRequests > 0" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold">
                {{ pendingRequests }}
              </span>
            </div>

            <div class="p-6">
              <div v-if="pendingRequestsList.length === 0" class="text-center py-8 text-gray-500">
                No pending requests. All caught up! ✓
              </div>

              <div v-else class="space-y-3">
                <div 
                  v-for="request in pendingRequestsList" 
                  :key="request.id"
                  class="flex items-center justify-between p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition cursor-pointer group"
                  @click="navigateTo({ name: 'RequestDetail', query: { id: request.id } })"
                >
                  <div class="flex items-center gap-3 flex-1">
                    <div class="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-gray-900 font-semibold group-hover:text-blue-600">{{ request.purpose }}</p>
                      <p class="text-gray-500 text-xs mt-1">{{ request.customerName }} • {{ formatDate(request.createdAt) }}</p>
                    </div>
                  </div>
                  <button 
                    @click.stop="navigateTo({ name: 'RequestDetail', query: { id: request.id } })"
                    class="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 flex-shrink-0"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Summary</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center pb-3 border-b">
                  <span class="text-gray-600 text-sm">Active Customers</span>
                  <span class="font-bold text-2xl text-gray-900">{{ totalCustomers }}</span>
                </div>
                <div class="flex justify-between items-center pb-3 border-b">
                  <span class="text-gray-600 text-sm">Active Quotes</span>
                  <span class="font-bold text-2xl text-gray-900">{{ totalQuotes }}</span>
                </div>
                <div class="flex justify-between items-center pb-3 border-b">
                  <span class="text-gray-600 text-sm">Rejected</span>
                  <span class="font-bold text-2xl text-red-600">{{ rejectedRequests }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 text-sm">Conversion</span>
                  <span class="font-bold text-2xl text-green-600">{{ approvalRate }}%</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              <div class="space-y-2">
                <button
                  @click="navigateTo('/request/form')"
                  class="w-full flex justify-center items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                >
                  <Iconify icon="mdi:plus" :width="18" :height="18" />
                  New Request
                </button>
                <button
                  @click="navigateTo('/request/list')"
                  class="w-full flex justify-center items-center gap-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                >
                  <Iconify icon="material-symbols-light:manage-accounts" :width="18" :height="18" />
                  Manage Requests
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button 
              @click="navigateTo('/request/list')"
              class="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1"
            >
              View All
              <Iconify icon="mdi:arrow-right" :width="16" :height="16" />
            </button>
          </div>

          <div v-if="recentRequests.length === 0" class="text-center py-8 text-gray-500">
            No activity yet.
          </div>

          <div v-else class="max-h-96 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="border-b bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-900">Request</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr 
                  v-for="request in recentRequests" 
                  :key="request.id"
                  class="hover:bg-gray-50 cursor-pointer transition"
                  @click="navigateTo({ name: 'RequestDetail', query: { id: request.id } })"
                >
                  <td class="px-4 py-3 font-medium text-gray-900">{{ request.purpose }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ request.customerName }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ formatDate(request.createdAt) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['px-2 py-1 rounded-full text-xs font-semibold', getStatusColor(request.status)]">
                      {{ request.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

