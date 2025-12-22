<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <div class="bg-white shadow-sm sticky top-0 z-40">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Quote List</h1>
            <p class="text-sm text-gray-500 mt-1">
              Manage and view all quotes in your dashboard.
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
            create-label="New Quote"
            @create="handleCreate"
            @export="handleExport"
            @refresh="handleRefresh"
            @search="handleSearch"
            @filter="handleFilter"
          />

          <!-- Loading State -->
          <div v-if="isLoading" class="mt-8 text-center">
            <p class="text-gray-500">Loading quotes...</p>
          </div>

          <!-- Quotes Table -->
          <div v-else class="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">No. Quote</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Onsite Req.</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created Date</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="quote in filteredQuotes" :key="quote.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ quote.quoteNo }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ quote.customer?.name || '-' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ quote.customer?.phone || '-' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ quote.items?.length || 0 }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ quote.onsiteRequests?.length || 0 }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ new Date(quote.createdAt).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button
                      @click="editQuote(quote)"
                      class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      @click="handleDeleteQuote(quote.id)"
                      class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredQuotes.length === 0">
                  <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    No quotes found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <Modal
      :is-open="showCreateModal"
      :title="editingQuote ? 'Edit Quote' : 'Add New Quote'"
      submit-label="Save"
      cancel-label="Cancel"
      :is-loading="isLoading"
      @close="closeModal"
      @submit="submitForm"
    >
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Quote No</label>
          <input
            v-model="formData.quoteNo"
            type="text"
            required
            :disabled="!!editingQuote"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100"
            placeholder="001, 002, etc"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Customer</label>
          <select
            v-model="formData.customerId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select Customer</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }} ({{ customer.phone }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Items</label>
          <div class="space-y-3">
            <div v-for="(item, index) in formData.items" :key="index" class="flex gap-2">
              <input
                v-model="item.name"
                type="text"
                placeholder="Item name"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                v-model.number="item.qty"
                type="number"
                min="1"
                placeholder="Qty"
                class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                @click="removeItem(index)"
                class="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              @click="addItem"
              class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              + Add Item
            </button>
          </div>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import DataToolbar, { type FilterOption } from '@/components/DataToolbar.vue'
import Modal from '@/components/Modal.vue'
import { useQuote } from '@/composables/useQuote'
import { useCustomer } from '@/composables/useCustomer'
import type { Quote } from '@/types/quote'
import { apiClient } from '@/utils/api'

const { quotes, isLoading, errorMessage, successMessage, fetchAll, create, update, delete: deleteQuote } = useQuote()
const { customers, fetchAll: fetchAllCustomers } = useCustomer()

const searchQuery = ref('')
const currentPage = ref(1)
const activeFilters = ref<string[]>([])
const showCreateModal = ref(false)
const editingQuote = ref<Quote | null>(null)
const formData = ref({
  quoteNo: '',
  customerId: '',
  items: [{ name: '', qty: 1 }]
})

const filteredQuotes = computed(() => {
  if (!searchQuery.value) {
    return quotes.value
  }

  const query = searchQuery.value.toLowerCase()
  return quotes.value.filter(
    (quote) =>
      quote.quoteNo.toLowerCase().includes(query) ||
      quote.customer?.name.toLowerCase().includes(query) ||
      quote.customer?.phone.toLowerCase().includes(query)
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
  editingQuote.value = null
  formData.value = {
    quoteNo: '',
    customerId: '',
    items: [{ name: '', qty: 1 }]
  }
  showCreateModal.value = true
}

const editQuote = (quote: Quote) => {
  editingQuote.value = quote
  formData.value = {
    quoteNo: quote.quoteNo,
    customerId: quote.customerId,
    items: quote.items || [{ name: '', qty: 1 }]
  }
  showCreateModal.value = true
}

const handleExport = async () => {
  try {
    isLoading.value = true
    
    const blob = await apiClient.exportQuotesToExcel()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quotes-${new Date().toISOString().split('T')[0]}.xlsx`
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

const addItem = () => {
  formData.value.items.push({ name: '', qty: 1 })
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const closeModal = () => {
  showCreateModal.value = false
  editingQuote.value = null
  formData.value = {
    quoteNo: '',
    customerId: '',
    items: [{ name: '', qty: 1 }]
  }
}

const submitForm = async () => {
  try {
    // Clear previous error
    errorMessage.value = ''
    
    // Validate required fields
    if (!formData.value.quoteNo?.trim()) {
      errorMessage.value = 'Quote No is required'
      return
    }
    
    if (!formData.value.customerId) {
      errorMessage.value = 'Customer is required'
      return
    }
    
    // Filter and validate items
    const validItems = formData.value.items.filter((item) => item.name?.trim() && item.qty > 0)
    
    if (validItems.length === 0) {
      errorMessage.value = 'At least one item is required with name and quantity > 0'
      return
    }
    
    if (editingQuote.value) {
      // Update mode
      const updateData: any = {}
      
      if (formData.value.customerId !== editingQuote.value.customerId) {
        updateData.customerId = formData.value.customerId
      }
      
      const originalItemsStr = JSON.stringify(editingQuote.value.items)
      const currentItemsStr = JSON.stringify(validItems)
      if (originalItemsStr !== currentItemsStr) {
        updateData.items = validItems
      }
      
      if (Object.keys(updateData).length > 0) {
        await update(editingQuote.value.id, updateData)
        successMessage.value = 'Quote updated successfully'
      } else {
        successMessage.value = 'No changes made'
      }
    } else {
      // Create mode
      const createPayload = {
        quoteNo: formData.value.quoteNo.trim(),
        customerId: formData.value.customerId,
        items: validItems
      }
      
      await create(createPayload)
      successMessage.value = 'Quote created successfully'
    }
    
    closeModal()
  } catch (error: any) {
    console.error('Form submission error:', error)
    const message = error.response?.data?.message
    if (Array.isArray(message)) {
      errorMessage.value = message.join(', ')
    } else if (typeof message === 'string') {
      errorMessage.value = message
    } else {
      errorMessage.value = error.message || 'Error submitting form'
    }
  }
}

const handleDeleteQuote = async (id: string) => {
  if (confirm('Are you sure you want to delete this quote?')) {
    try {
      await deleteQuote(id)
    } catch (error) {
      console.error('Delete quote error:', error)
    }
  }
}

const filterOptions: FilterOption[] = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' }
]

onMounted(async () => {
  await fetchAll()
  await fetchAllCustomers()
})
</script>
