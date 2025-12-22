import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { StorageService } from './storage'
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto
} from '@/types/customer'

const API_BASE_URL = import.meta.env.VITE_API_URL

class CustomerApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = StorageService.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle 401 responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const token = StorageService.getToken()
          if (token) {
            StorageService.clear()
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    const response = await this.client.post<Customer>('/customers', data)
    return response.data
  }

  async findAll(): Promise<Customer[]> {
    const response = await this.client.get<Customer[]>('/customers')
    return response.data
  }

  async findOne(id: string): Promise<Customer> {
    const response = await this.client.get<Customer>(`/customers/${id}`)
    return response.data
  }

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await this.client.patch<Customer>(`/customers/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/customers/${id}`)
    return response.data
  }
}

export const customerApiClient = new CustomerApiClient()
