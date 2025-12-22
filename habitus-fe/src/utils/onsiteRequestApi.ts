import axios from 'axios'
import { StorageService } from './storage'
import type {
  OnsiteRequest,
  OnsiteRequestLog,
  CreateOnsiteRequestDto,
  UpdateOnsiteRequestDto,
  UpdateOnsiteRequestStatusDto,
  OnsiteRequestStatistics
} from '@/types/onsite-request'

class OnsiteRequestApiClient {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
  private axiosInstance = axios.create({
    baseURL: this.baseURL
  })

  constructor() {
    this.axiosInstance.interceptors.request.use((config) => {
      const token = StorageService.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          StorageService.clear()
          window.location.href = '/login'
        }
        throw error
      }
    )
  }

  async create(data: CreateOnsiteRequestDto): Promise<OnsiteRequest> {
    try {
      const response = await this.axiosInstance.post<OnsiteRequest>(
        '/onsite-requests',
        data
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async findAll(filters?: { status?: string; quoteId?: string }): Promise<OnsiteRequest[]> {
    try {
      const response = await this.axiosInstance.get<OnsiteRequest[]>(
        '/onsite-requests',
        { params: filters }
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async findOne(id: string): Promise<OnsiteRequest> {
    try {
      const response = await this.axiosInstance.get<OnsiteRequest>(
        `/onsite-requests/${id}`
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async update(id: string, data: UpdateOnsiteRequestDto): Promise<OnsiteRequest> {
    try {
      const response = await this.axiosInstance.patch<OnsiteRequest>(
        `/onsite-requests/${id}`,
        data
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async updateStatus(
    id: string,
    data: UpdateOnsiteRequestStatusDto
  ): Promise<OnsiteRequest> {
    try {
      const response = await this.axiosInstance.patch<OnsiteRequest>(
        `/onsite-requests/${id}/status`,
        data
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await this.axiosInstance.delete<{ message: string }>(
        `/onsite-requests/${id}`
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getLogs(id: string, action?: string): Promise<OnsiteRequestLog[]> {
    try {
      const response = await this.axiosInstance.get<OnsiteRequestLog[]>(
        `/onsite-requests/${id}/logs`,
        { params: action ? { action } : undefined }
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getTimeline(id: string): Promise<OnsiteRequestLog[]> {
    try {
      const response = await this.axiosInstance.get<OnsiteRequestLog[]>(
        `/onsite-requests/${id}/timeline`
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getStatistics(): Promise<OnsiteRequestStatistics> {
    try {
      const response = await this.axiosInstance.get<OnsiteRequestStatistics>(
        '/onsite-requests/statistics'
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    if (error.response?.data) {
      const data = error.response.data
      if (Array.isArray(data)) {
        return new Error(data.join(', '))
      }
      if (typeof data === 'string') {
        return new Error(data)
      }
    }
    return error
  }
}

export const onsiteRequestApiClient = new OnsiteRequestApiClient()
