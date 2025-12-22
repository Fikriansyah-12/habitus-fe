import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { LoginDto, LoginResponseDto, LogoutResponseDto, OnsiteRequestDto, CreateOnsiteRequestDto, UpdateOnsiteRequestDto, UpdateOnsiteRequestStatusDto, QuoteDto, BackendOnsiteRequest, BackendQuote } from '../types'
import { StorageService } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const mapBackendOnsiteRequest = (item: BackendOnsiteRequest): OnsiteRequestDto => {
  const itemName = item.items?.[0]?.name || ''
  
  return {
    id: item.id,
    purpose: item.purpose,
    startDate: item.onsiteAt,
    onsiteAt: item.onsiteAt,
    endDate: item.onsiteAt,
    location: item.address,
    address: item.address,
    notes: '',
    quoteNo: item.quote?.quoteNo || '',
    quoteId: item.quoteId,
    userName: item.requestedBy?.name || '',
    itemName: itemName,
    customerName: item.quote?.customer?.name || '',
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    items: item.items,
    quote: item.quote,
    requestedBy: item.requestedBy
  }
}

const mapBackendQuote = (quote: any): QuoteDto => ({
  id: quote.id,
  quoteNo: quote.quoteNo,
  customerId: quote.customerId,
  customer: quote.customer || { id: '', name: '', phone: '' },
  items: quote.items || [],
  createdAt: quote.createdAt || '',
  updatedAt: quote.updatedAt || '',
  itemName: quote.itemName || quote.items?.[0]?.name || '',
  quantity: quote.quantity || quote.items?.[0]?.qty || 0,
  customerName: quote.customer?.name || quote.customerName || '',
  customerPhone: quote.customer?.phone || quote.customerPhone || ''
})

class ApiClient {
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
          // Only redirect if there's an auth token (meaning it expired/invalid)
          // If no token, let the app handle it (route guard will redirect)
          const token = StorageService.getToken()
          if (token) {
            console.warn('Token expired or invalid, clearing auth')
            StorageService.clear()
            // Don't use window.location.href to allow Vue Router to handle
            if (window.location.pathname !== '/') {
              window.location.href = '/'
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async login(credentials: LoginDto): Promise<LoginResponseDto> {
    const response = await this.client.post<any>('/auth/login', credentials)
    const data = response.data

    const token = data.token || data.accessToken || data.access_token || data.jwt
    
    if (!token) {
      console.error('No token found in login response. Available fields:', Object.keys(data));
      throw new Error('Login response missing token field');
    }
    
    return {
      user: data.user,
      token: token
    } as LoginResponseDto
  }

  async logout(): Promise<LogoutResponseDto> {
    const response = await this.client.post<LogoutResponseDto>('/auth/logout', {})
    return response.data
  }

  // Onsite Requests
  async getOnsiteRequests(page?: number, limit?: number): Promise<{ data: OnsiteRequestDto[]; total: number }> {
    const response = await this.client.get<any>('/onsite-requests', {
      params: { page, limit }
    })
    
    // Handle both array and paginated response formats
    const items = Array.isArray(response.data) ? response.data : (response.data?.data || [])
    const total = response.data?.total || items.length
    
    // Map backend response to frontend format
    const mappedData = items.map((item: BackendOnsiteRequest | OnsiteRequestDto) => {
      // Check if already mapped or is backend format
      if ('onsiteAt' in item) {
        return mapBackendOnsiteRequest(item as BackendOnsiteRequest)
      }
      return item as OnsiteRequestDto
    })
    
    return { data: mappedData, total }
  }

  async getOnsiteRequestById(id: string): Promise<OnsiteRequestDto> {
    const response = await this.client.get<any>(`/onsite-requests/${id}`)
    
    if ('onsiteAt' in response.data) {
      return mapBackendOnsiteRequest(response.data as BackendOnsiteRequest)
    }
    return response.data as OnsiteRequestDto
  }

  async createOnsiteRequest(data: CreateOnsiteRequestDto): Promise<OnsiteRequestDto> {
    try {
      const response = await this.client.post<any>('/onsite-requests', data)
      
      if ('onsiteAt' in response.data) {
        return mapBackendOnsiteRequest(response.data as BackendOnsiteRequest)
      }
      return response.data as OnsiteRequestDto
    } catch (error: any) {
      console.error('Request failed. Status:', error.response?.status)
      console.error('Response data:', error.response?.data)
      throw error
    }
  }

  async updateOnsiteRequest(id: string, data: UpdateOnsiteRequestDto): Promise<OnsiteRequestDto> {
    try {
      const response = await this.client.patch<any>(`/onsite-requests/${id}`, data)
      
      if ('onsiteAt' in response.data) {
        return mapBackendOnsiteRequest(response.data as BackendOnsiteRequest)
      }
      return response.data as OnsiteRequestDto
    } catch (error: any) {
      console.error('Update request failed. Status:', error.response?.status)
      console.error('Response data:', error.response?.data)
      throw error
    }
  }

  async updateOnsiteRequestStatus(id: string, data: UpdateOnsiteRequestStatusDto): Promise<OnsiteRequestDto> {
    const response = await this.client.patch<any>(`/onsite-requests/${id}/status`, data)
    
    if ('onsiteAt' in response.data) {
      return mapBackendOnsiteRequest(response.data as BackendOnsiteRequest)
    }
    return response.data as OnsiteRequestDto
  }

  async deleteOnsiteRequest(id: string): Promise<void> {
    await this.client.delete(`/onsite-requests/${id}`)
  }

  async getOnsiteRequestStatistics() {
    const response = await this.client.get('/onsite-requests/statistics')
    return response.data
  }

  async getQuotes(): Promise<QuoteDto[]> {
    const response = await this.client.get<any>('/quotes')
    const items = Array.isArray(response.data) ? response.data : (response.data?.data || [])
    
    return items.map((item: any) => {
      return mapBackendQuote(item)
    })
  }

  async getQuoteByNumber(quoteNo: string): Promise<QuoteDto> {
    const response = await this.client.get<any>(`/quotes/by-number/${quoteNo}`)
    return mapBackendQuote(response.data)
  }

  async createQuote(data: any): Promise<QuoteDto> {
    const response = await this.client.post<any>('/quotes', data)
    
    if ('customer' in response.data) {
      return mapBackendQuote(response.data as BackendQuote)
    }
    return response.data as QuoteDto
  }

  async exportOnsiteRequestsToExcel(params?: any): Promise<Blob> {
    const response = await this.client.get('/onsite-requests/export/excel', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  async exportQuotesToExcel(params?: any): Promise<Blob> {
    const response = await this.client.get('/quotes/export/excel', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  async exportCustomersToExcel(params?: any): Promise<Blob> {
    const response = await this.client.get('/customers/export/excel', {
      params,
      responseType: 'blob'
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
