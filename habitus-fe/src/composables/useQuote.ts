import { ref, computed } from 'vue'
import { quoteApiClient } from '@/utils/quoteApi'
import type { Quote, CreateQuoteDto, UpdateQuoteDto } from '@/types/quote'

export const useQuote = () => {
  const quotes = ref<Quote[]>([])
  const currentQuote = ref<Quote | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const totalQuotes = computed(() => quotes.value.length)

  const fetchAll = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const data = await quoteApiClient.findAll()
      quotes.value = data
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to fetch quotes'
    } finally {
      isLoading.value = false
    }
  }

  const fetchOne = async (id: string) => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const data = await quoteApiClient.findOne(id)
      currentQuote.value = data
      return data
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to fetch quote'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchByQuoteNo = async (quoteNo: string) => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const data = await quoteApiClient.getByQuoteNo(quoteNo)
      currentQuote.value = data
      return data
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Quote not found'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const create = async (quoteData: CreateQuoteDto) => {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
      const newQuote = await quoteApiClient.create(quoteData)
      quotes.value.push(newQuote)
      successMessage.value = 'Quote created successfully'
      return newQuote
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to create quote'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const update = async (id: string, quoteData: UpdateQuoteDto) => {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
      const updated = await quoteApiClient.update(id, quoteData)
      const index = quotes.value.findIndex((q) => q.id === id)
      if (index !== -1) {
        quotes.value[index] = updated
      }
      if (currentQuote.value?.id === id) {
        currentQuote.value = updated
      }
      successMessage.value = 'Quote updated successfully'
      return updated
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to update quote'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const delete_ = async (id: string) => {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
      await quoteApiClient.delete(id)
      quotes.value = quotes.value.filter((q) => q.id !== id)
      if (currentQuote.value?.id === id) {
        currentQuote.value = null
      }
      successMessage.value = 'Quote deleted successfully'
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to delete quote'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const reset = () => {
    quotes.value = []
    currentQuote.value = null
    errorMessage.value = ''
    successMessage.value = ''
  }

  return {
    // State
    quotes,
    currentQuote,
    isLoading,
    errorMessage,
    successMessage,

    // Computed
    totalQuotes,

    // Methods
    fetchAll,
    fetchOne,
    fetchByQuoteNo,
    create,
    update,
    delete: delete_,
    clearMessages,
    reset
  }
}
