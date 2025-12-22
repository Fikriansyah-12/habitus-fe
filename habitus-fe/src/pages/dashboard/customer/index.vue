<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import DataToolbar, { type FilterOption } from '@/components/DataToolbar.vue'
import Modal from '@/components/Modal.vue'
import { useCustomer } from '@/composables/useCustomer'
import { apiClient } from '@/utils/api'

const { customers, isLoading, errorMessage, successMessage, currentCustomer, fetchAll, fetchOne, create, update, delete: deleteCustomer } = useCustomer()

const searchQuery = ref('')
const currentPage = ref(1)
const activeFilters = ref<string[]>([])
const showCreateModal = ref(false)
const showViewModal = ref(false)
const isViewModalLoading = ref(false)
const formData = ref({
  name: '',
  phone: ''
})
const editFormData = ref({
  name: '',
  phone: ''
})

const filteredCustomers = computed(() => {
  if (!searchQuery.value) {
    return customers.value
  }

  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
  )
})

const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const handleFilter = (filters: string[]) => {
  activeFilters.value = filters
  currentPage.value = 1
}

const handleCreate = () => {
  showCreateModal.value = true
}

const handleExport = async () => {
  try {
    isLoading.value = true
    
    const blob = await apiClient.exportCustomersToExcel()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customers-${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to export data'
    errorMessage.value = `Export failed: ${message}`
  } finally {
    isLoading.value = false
  }
}

const handleRefresh = async () => {
  await fetchAll()
}

const submitForm = async () => {
  try {
    await create(formData.value)
    formData.value = { name: '', phone: '' }
    showCreateModal.value = false
  } catch (error) {
    console.error('Create customer error:', error)
  }
}

const handleDeleteCustomer = async (id: string) => {
  if (confirm('Are you sure you want to delete this customer?')) {
    try {
      await deleteCustomer(id)
    } catch (error) {
      console.error('Delete customer error:', error)
    }
  }
}

const handleViewCustomer = async (id: string) => {
  isViewModalLoading.value = true
  try {
    await fetchOne(id)
    showViewModal.value = true
  } catch (error) {
    console.error('Failed to load customer:', error)
  } finally {
    isViewModalLoading.value = false
  }
}

const closeViewModal = () => {
  showViewModal.value = false
}

// const handleEditCustomer = () => {
//   if (currentCustomer.value) {
//     editFormData.value = {
//       name: currentCustomer.value.name,
//       phone: currentCustomer.value.phone
//     }
//   }
// }

const submitEditForm = async () => {
  try {
    if (currentCustomer.value) {
      await update(currentCustomer.value.id, editFormData.value)
      closeViewModal()
    }
  } catch (error) {
    console.error('Edit customer error:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const filterOptions: FilterOption[] = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' }
]

onMounted(() => {
  fetchAll()
})

</script>

<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <div class="bg-white shadow-sm sticky top-0 z-40">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Customer List</h1>
            <p class="text-sm text-gray-500 mt-1">
              Manage and view all customers in your dashboard.
            </p>
          </div>
          <div>
            <Breadcrumb />
          </div>
        </div>
      </div>
    </div>

    <main class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto flex flex-col">
        <div class="w-full px-6 py-8">
          <!-- Messages -->
          <div v-if="successMessage" class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {{ errorMessage }}
          </div>

          <!-- DataToolbar -->
          <DataToolbar
            :filters="filterOptions"
            create-label="New Customer"
            @create="handleCreate"
            @export="handleExport"
            @refresh="handleRefresh"
            @search="handleSearch"
            @filter="handleFilter"
          />

          <!-- Loading State -->
          <div v-if="isLoading" class="mt-8 text-center">
            <p class="text-gray-500">Loading customers...</p>
          </div>

          <!-- Customers Table -->
          <div v-else class="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quotes</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created Date</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ customer.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ customer.phone }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ customer.quotes?.length || 0 }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ new Date(customer.createdAt).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button
                      @click="handleViewCustomer(customer.id)"
                      class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                    >
                      View
                    </button>
                    <button
                      @click="handleDeleteCustomer(customer.id)"
                      class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredCustomers.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Modal -->
    <Modal
      :is-open="showCreateModal"
      title="Add New Customer"
      submit-label="Save"
      cancel-label="Cancel"
      :is-loading="isLoading"
      @close="showCreateModal = false"
      @submit="submitForm"
    >
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Customer name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            v-model="formData.phone"
            type="tel"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Phone number"
          />
        </div>
      </form>
    </Modal>

    <!-- View Customer Modal -->
    <Modal
      :is-open="showViewModal"
      :title="currentCustomer?.name || 'Customer Details'"
      submit-label="Save Changes"
      cancel-label="Cancel"
      :is-loading="isViewModalLoading"
      @close="closeViewModal"
      @submit="submitEditForm"
    >
      <div v-if="currentCustomer" class="space-y-6 max-h-96 overflow-y-auto">
        <!-- Customer Info Display -->
        <div class="border-b pb-4">
          <div class="text-sm text-gray-600 mb-2">Phone</div>
          <p class="text-lg font-semibold text-gray-900">{{ currentCustomer.phone }}</p>
        </div>

        <div class="border-b pb-4">
          <div class="text-sm text-gray-600 mb-2">Created Date</div>
          <p class="text-lg font-semibold text-gray-900">{{ formatDate(currentCustomer.createdAt) }}</p>
        </div>

        <div class="border-b pb-4">
          <div class="text-sm text-gray-600 mb-2">Updated Date</div>
          <p class="text-lg font-semibold text-gray-900">{{ formatDate(currentCustomer.updatedAt) }}</p>
        </div>

        <!-- Edit Form -->
        <div class="mt-6 pt-6 border-t space-y-4">
          <h3 class="font-semibold text-gray-900">Edit Information</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              v-model="editFormData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Customer name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              v-model="editFormData.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Phone number"
            />
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
