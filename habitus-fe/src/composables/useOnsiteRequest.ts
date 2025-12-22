import { ref, computed } from 'vue'
import { onsiteRequestApiClient } from '@/utils/onsiteRequestApi'
import type {
  OnsiteRequest,
  OnsiteRequestLog,
  CreateOnsiteRequestDto,
  UpdateOnsiteRequestDto,
  UpdateOnsiteRequestStatusDto
} from '@/types/onsite-request'

export const useOnsiteRequest = () => {
  const requests = ref<OnsiteRequest[]>([])
  const currentRequest = ref<OnsiteRequest | null>(null)
  const requestLogs = ref<OnsiteRequestLog[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const totalRequests = computed(() => requests.value.length)

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const fetchAll = async (filters?: { status?: string; quoteId?: string }) => {
    isLoading.value = true
    try {
      requests.value = await onsiteRequestApiClient.findAll(filters)
      clearMessages()
    } catch (error: any) {
      errorMessage.value = error.message || 'Failed to fetch requests'
    } finally {
      isLoading.value = false
    }
  }

  const fetchOne = async (id: string) => {
    isLoading.value = true
    try {
      currentRequest.value = await onsiteRequestApiClient.findOne(id)
      clearMessages()
    } catch (error: any) {
      errorMessage.value = error.message || 'Failed to fetch request'
    } finally {
      isLoading.value = false
    }
  }

  const create = async (data: CreateOnsiteRequestDto) => {
    isLoading.value = true
    try {
      const newRequest = await onsiteRequestApiClient.create(data)
      requests.value.unshift(newRequest)
      successMessage.value = 'Onsite request created successfully'
      return newRequest
    } catch (error: any) {
      errorMessage.value = error.message || 'Failed to create request'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const update = async (id: string, data: UpdateOnsiteRequestDto) => {
    isLoading.value = true
    try {
      const updated = await onsiteRequestApiClient.update(id, data)
      const index = requests.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        requests.value[index] = updated
      }
      currentRequest.value = updated
      successMessage.value = 'Onsite request updated successfully'
      return updated
    } catch (error: any) {
      errorMessage.value = error.message || 'Failed to update request'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (id: string, data: UpdateOnsiteRequestStatusDto) => {
    isLoading.value = true
    try {
      const updated = await onsiteRequestApiClient.updateStatus(id, data)
      const index = requests.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        requests.value[index] = updated
      }
      currentRequest.value = updated
      successMessage.value = 'Status updated successfully'
      return updated
    } catch (error: any) {
      errorMessage.value = error.message || 'Failed to update status'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const delete_ = async (id: string) => {
    isLoading.value = true
    try {
      await onsiteRequestApiClient.delete(id)
      requests.value = requests.value.filter((r) => r.id !== id)
      successMessage.value = 'Onsite request deleted successfully'
    } catch (error: any) {
      errorMessage.value = error.message || 'Failed to delete request'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchLogs = async (id: string, action?: string) => {
    try {
      requestLogs.value = await onsiteRequestApiClient.getLogs(id, action)
    } catch (error: any) {
      errorMessage.value = error.message || 'Failed to fetch logs'
    }
  }

  const fetchTimeline = async (id: string) => {
    try {
      const logs = await onsiteRequestApiClient.getTimeline(id)
      requestLogs.value = logs
    } catch (error: any) {
      console.error('Failed to fetch timeline:', error)
      errorMessage.value = error.message || 'Failed to fetch timeline'
    }
  }

  const reset = () => {
    requests.value = []
    currentRequest.value = null
    requestLogs.value = []
    clearMessages()
  }

  return {
    requests,
    currentRequest,
    requestLogs,
    isLoading,
    errorMessage,
    successMessage,
    totalRequests,
    fetchAll,
    fetchOne,
    create,
    update,
    updateStatus,
    delete: delete_,
    fetchLogs,
    fetchTimeline,
    clearMessages,
    reset
  }
}
