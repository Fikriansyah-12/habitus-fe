import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { StorageService } from './storage'
import type { Quote, CreateQuoteDto, UpdateQuoteDto } from '@/types/quote'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

class QuoteApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.client.interceptors.request.use((config) => {
      const token = StorageService.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

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

  async create(data: CreateQuoteDto): Promise<Quote> {
    const payload: any = {}
    
    if (data.quoteNo) payload.quoteNo = data.quoteNo
    if (data.customerId) payload.customerId = data.customerId
    if (data.items && data.items.length > 0) {
      payload.items = data.items.map((item) => ({
        name: item.name,
        qty: item.qty
      }))
    }
    
    
    try {
      const response = await this.client.post<Quote>('/quotes', payload)
      return response.data
    } catch (error: any) {
      console.error('❌ Quote creation failed:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        payload: payload
      })
      throw error
    }
  }

  async findAll(): Promise<Quote[]> {
    const response = await this.client.get<Quote[]>('/quotes')
    return response.data
  }

  async findOne(id: string): Promise<Quote> {
    const response = await this.client.get<Quote>(`/quotes/${id}`)
    return response.data
  }

  async getByQuoteNo(quoteNo: string): Promise<Quote> {
    const response = await this.client.get<Quote>(`/quotes/by-number/${quoteNo}`)
    return response.data
  }

  async update(id: string, data: UpdateQuoteDto): Promise<Quote> {
    const updatePayload: any = {}
    
    if (data.quoteNo !== undefined) updatePayload.quoteNo = data.quoteNo
    if (data.customerId !== undefined) updatePayload.customerId = data.customerId
    if (data.items !== undefined) updatePayload.items = data.items
    
    const response = await this.client.patch<Quote>(`/quotes/${id}`, updatePayload)
    return response.data
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/quotes/${id}`)
    return response.data
  }
}

export const quoteApiClient = new QuoteApiClient()
