
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { FilterOption } from '@/components/DataToolbar.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import DataToolbar from '@/components/DataToolbar.vue'
import Pagination from '@/components/Pagination.vue'
import { useRouter } from 'vue-router'
import Iconify from '@/components/Iconify.vue'
import { apiClient } from '@/utils/api'
import type { OnsiteRequestDto } from '@/types'

const router = useRouter()

const filterOptions: FilterOption[] = [
  { id: 'Requested', label: 'Requested' },
  { id: 'Approved', label: 'Approved' },
  { id: 'Rejected', label: 'Rejected' }
]

const searchQuery = ref('')
const activeFilters = ref<string[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isLoading = ref(false)
const errorMessage = ref('')

const requests = ref<OnsiteRequestDto[]>([])
const totalItems = ref(0)

onMounted(async () => {
  await loadRequests()
})

const loadRequests = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await apiClient.getOnsiteRequests(currentPage.value, itemsPerPage.value)
    
    requests.value = response.data || []
    totalItems.value = response.total || 0
  } catch (error: any) {
    const statusCode = error.response?.status
    const message = error.response?.data?.message || error.message
    
    if (statusCode === 401) {
      errorMessage.value = 'Session expired. Please login again.'
    } else if (statusCode === 403) {
      errorMessage.value = 'Access denied'
    } else if (!message || message.includes('Network')) {
      errorMessage.value = 'Network error. Please check your connection and backend server.'
    } else {
      errorMessage.value = `Failed to load requests: ${message}`
    }
    
    requests.value = []
  } finally {
    isLoading.value = false
  }
}

const filteredRequests = computed(() => {
  let result = requests.value

  if (activeFilters.value.length > 0) {
    result = result.filter(req => activeFilters.value.includes(req.status))
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(req =>
      (req.userName || '').toLowerCase().includes(query) ||
      (req.purpose || '').toLowerCase().includes(query) ||
      (req.quoteNo || '').toLowerCase().includes(query)
    )
  }

  return result
})

const handleCreate = () => {
  router.push('/request/form')
}

const editItem = (id: string) => {
  router.push({ name: 'RequestEdit', query: { id } })
}

const handleExport = () => {
  alert('Export data clicked!')
}

const handleRefresh = async () => {
  currentPage.value = 1
  await loadRequests()
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const handleFilter = (filters: string[]) => {
  activeFilters.value = filters
  currentPage.value = 1
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await loadRequests()
}

const handleItemsPerPageChange = async (items: number) => {
  itemsPerPage.value = items
  currentPage.value = 1
  await loadRequests()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800'
    case 'Rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID')
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID')
}
</script>
<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <nav class="bg-white shadow-sm sticky top-0 z-40">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Request Onsite List
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Manage all onsite requests in your system
            </p>
          </div>
          <div>
            <Breadcrumb />
          </div>
        </div>
      </div>
    </nav>
    <main class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto flex flex-col">
        <div class="w-full px-6 py-8">
          <DataToolbar
            :filters="filterOptions"
            create-label="New Request"
            @create="handleCreate"
            @export="handleExport"
            @refresh="handleRefresh"
            @search="handleSearch"
            @filter="handleFilter"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="w-full px-6">
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ errorMessage }}
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="w-full px-6 py-8 text-center">
          <p class="text-gray-500">Loading requests...</p>
        </div>

        <!-- Table -->
        <div v-else class="w-full px-6">
          <div class="bg-white rounded-lg shadow mt-6">
            <div class="overflow-x-auto">
              <table class="w-full min-w-max">
                <thead class="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Tanggal Pengajuan
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Nama User
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Keperluan
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Tanggal Onsite
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Alamat
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Nomor Quote
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Nama Barang
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Customer
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      {{ formatDate(request.createdAt) }}
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      {{ request.userName }}
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      {{ request.purpose }}
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      {{ formatDateTime(request.onsiteAt || request.startDate) }}
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      {{ request.address || request.location }}
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      {{ request.quoteNo }}
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      <div v-if="request.items && request.items.length > 0">
                        <div>{{  request.itemName || '-' }}</div>
                        <div v-if="request.items.length > 1" class="text-xs text-gray-500">
                          +{{ request.items.length - 1 }} item(s)
                        </div>
                      </div>
                      <div v-else>{{ request.itemName || '-' }}</div>
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      {{ request.customerName || '-' }} - {{ request.quote?.customer.phone }}
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      <span :class="['px-2 py-1 rounded-full text-xs font-medium inline-block', getStatusColor(request.status)]">
                        {{ request.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm whitespace-nowrap">
                      <div class="flex items-center justify-center gap-1">
                        <button
                          @click="editItem(request.id)"
                          class="text-green-500 bg-green-500/30 rounded-lg p-2 hover:text-green-600 font-medium"
                          title="Edit"
                        >
                          <Iconify icon="mdi:pencil" :width="16" :height="16" />
                        </button>
                        <button
                          @click="editItem(request.id)"
                          class="text-blue-500 bg-blue-500/30 rounded-lg p-2 hover:text-blue-600 font-medium"
                          title="View"
                        >
                          <Iconify icon="mdi:eye" :width="16" :height="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredRequests.length === 0">
                    <td colspan="10" class="px-6 py-8 text-center text-gray-500">
                      No requests found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!isLoading && requests.length > 0" class="w-full px-6 py-8">
          <Pagination
            :total-items="totalItems"
            :items-per-page="itemsPerPage"
            :current-page="currentPage"
            show-items-per-page
            @page-change="handlePageChange"
            @items-per-page-change="handleItemsPerPageChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Custom scrollbar styling untuk table horizontal scroll */
::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
