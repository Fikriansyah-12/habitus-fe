import { ref, computed } from 'vue'
import { customerApiClient } from '@/utils/customerApi'
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types/customer'

export const useCustomer = () => {
  const customers = ref<Customer[]>([])
  const currentCustomer = ref<Customer | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const totalCustomers = computed(() => customers.value.length)

  const fetchAll = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const data = await customerApiClient.findAll()
      customers.value = data
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to fetch customers'
    } finally {
      isLoading.value = false
    }
  }

  const fetchOne = async (id: string) => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const data = await customerApiClient.findOne(id)
      currentCustomer.value = data
      return data
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to fetch customer'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const create = async (customerData: CreateCustomerDto) => {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
      const newCustomer = await customerApiClient.create(customerData)
      customers.value.push(newCustomer)
      successMessage.value = 'Customer created successfully'
      return newCustomer
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to create customer'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const update = async (id: string, customerData: UpdateCustomerDto) => {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
      const updated = await customerApiClient.update(id, customerData)
      const index = customers.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        customers.value[index] = updated
      }
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = updated
      }
      successMessage.value = 'Customer updated successfully'
      return updated
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to update customer'
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
      await customerApiClient.delete(id)
      customers.value = customers.value.filter((c) => c.id !== id)
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = null
      }
      successMessage.value = 'Customer deleted successfully'
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Failed to delete customer'
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
    customers.value = []
    currentCustomer.value = null
    errorMessage.value = ''
    successMessage.value = ''
  }

  return {
    // State
    customers,
    currentCustomer,
    isLoading,
    errorMessage,
    successMessage,

    // Computed
    totalCustomers,

    // Methods
    fetchAll,
    fetchOne,
    create,
    update,
    delete: delete_,
    clearMessages,
    reset
  }
}
