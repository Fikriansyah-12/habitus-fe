<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useOnsiteRequest } from '@/composables/useOnsiteRequest'
import Modal from '@/components/Modal.vue'
import type { OnsiteStatus } from '@/types/onsite-request'

const route = useRoute()
const router = useRouter()
const id = route.query.id as string

const { currentRequest, requestLogs, isLoading, errorMessage, successMessage, fetchOne, fetchTimeline, updateStatus, delete: deleteRequest } = useOnsiteRequest()

const showStatusModal = ref(false)
const selectedStatus = ref('')


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateOnly = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goBack = () => {
  router.push('/request/list')
}

const openStatusModal = (status: string) => {
  selectedStatus.value = status
  showStatusModal.value = true
}
const submitStatusChange = async () => {
  try {
    await updateStatus(id, { status: selectedStatus.value as OnsiteStatus })
    showStatusModal.value = false
    await fetchOne(id)
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}


const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this onsite request?')) {
    try {
      await deleteRequest(id)
      router.push('/request/list')
    } catch (error) {
      console.error('Failed to delete request:', error)
    }
  }
}

const goToEdit = () => {
  router.push({ path: '/request/edit', query: { id } })
}

onMounted(async () => {
  if (!id) {
    errorMessage.value = 'Request ID not found'
    return
  }

  try {
    await fetchOne(id)
    await fetchTimeline(id)
  } catch (error) {
    console.error('Failed to load request:', error)
  }
})
</script>

<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <div class="bg-white shadow-sm sticky top-0 z-40">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Request Details</h1>
            <p class="text-sm text-gray-500 mt-1">View onsite request details and activity log</p>
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
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-8">
            <p class="text-gray-500">Loading request details...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="errorMessage" class="p-4 bg-red-100 text-red-700 rounded-lg">
            {{ errorMessage }}
            <button
              @click="goBack"
              class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Go Back
            </button>
          </div>

          <!-- Request Details -->
          <div v-else-if="currentRequest" class="space-y-6 max-w-5xl">
            <!-- Header Card -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h2 class="text-3xl font-bold text-gray-900">{{ currentRequest.quote?.quoteNo }}</h2>
                  <p class="text-gray-600 mt-2">📋 {{ currentRequest.purpose }}</p>
                </div>
                <div class="text-right">
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                      currentRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' : '',
                      currentRequest.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' : '',
                      currentRequest.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''
                    ]"
                  >
                    {{ currentRequest.status }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Requested By</p>
                  <p class="font-medium text-gray-900">{{ currentRequest.requestedBy?.name }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Created Date</p>
                  <p class="font-medium text-gray-900">{{ formatDateOnly(currentRequest.createdAt) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Onsite Date</p>
                  <p class="font-medium text-gray-900">{{ formatDateOnly(currentRequest.onsiteAt) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Onsite Time</p>
                  <p class="font-medium text-gray-900">{{ new Date(currentRequest.onsiteAt).toLocaleTimeString('id-ID') }}</p>
                </div>
              </div>
            </div>

            <!-- Customer & Quote Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white rounded-lg shadow p-6">
                <h3 class="font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div class="space-y-3">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Name</p>
                    <p class="text-sm font-medium text-gray-900">{{ currentRequest.quote?.customer?.name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Phone</p>
                    <p class="text-sm font-medium text-gray-900">{{ currentRequest.quote?.customer?.phone }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <h3 class="font-semibold text-gray-900 mb-4">Location</h3>
                <div class="space-y-3">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Address</p>
                    <p class="text-sm text-gray-900">{{ currentRequest.address }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div v-if="currentRequest.items?.length > 0" class="bg-white rounded-lg shadow p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Items</h3>
              <table class="w-full">
                <thead class="bg-gray-100 border-b">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Item Name</th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="item in currentRequest.items" :key="item.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.qty }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="font-semibold text-gray-900 mb-6">Activity Timeline</h3>
              <div v-if="requestLogs.length > 0" class="space-y-4">
                <div
                  v-for="(log, index) in requestLogs"
                  :key="log.id"
                  class="flex gap-4"
                >
                  <!-- Timeline Dot and Line -->
                  <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full bg-cyan-600 mt-2"></div>
                    <div
                      v-if="index < requestLogs.length - 1"
                      class="w-0.5 h-16 bg-gray-300 my-1"
                    ></div>
                  </div>

                  <!-- Timeline Content -->
                  <div class="pb-4 flex-1">
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <p class="font-semibold text-gray-900">{{ log.action }}</p>
                          <p class="text-sm text-gray-600 mt-1">{{ log.description }}</p>
                        </div>
                        <span class="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {{ formatDate(log.timestamp) }}
                        </span>
                      </div>

                      <div class="flex items-center gap-2 mt-3 text-xs">
                        <span class="text-gray-600">By:</span>
                        <span class="font-medium text-gray-900">{{ log.changedBy?.name }}</span>
                        <span class="text-gray-500">({{ log.changedBy?.email }})</span>
                      </div>

                      <!-- Status Change Info -->
                      <div
                        v-if="log.oldStatus || log.newStatus"
                        class="mt-3 text-xs bg-blue-50 p-2 rounded border border-blue-200"
                      >
                        <span class="text-gray-700">
                          Status:
                          <span class="font-medium text-gray-900">{{ log.oldStatus }}</span>
                          <span class="text-gray-600">→</span>
                          <span class="font-medium text-cyan-600">{{ log.newStatus }}</span>
                        </span>
                      </div>

                      <!-- Metadata -->
                      <div v-if="log.metadata && Object.keys(log.metadata).length > 0" class="mt-3">
                        <p class="text-xs text-gray-600 mb-1">Details:</p>
                        <div class="text-xs bg-white p-2 rounded border border-gray-200">
                          <div v-for="(value, key) in log.metadata" :key="key" class="text-gray-700">
                            <span class="font-medium">{{ key }}:</span>
                            <span class="text-gray-600">{{ value }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p class="text-gray-500">No activity logs yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Status Change Modal -->
    <Modal
      :is-open="showStatusModal"
      title="Change Request Status"
      submit-label="Confirm"
      cancel-label="Cancel"
      @close="showStatusModal = false"
      @submit="submitStatusChange"
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          Are you sure you want to change the status to <span class="font-semibold">{{ selectedStatus }}</span>?
        </p>
      </div>
    </Modal>
  </div>
</template>
