export type OnsiteStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED'

export interface OnsiteRequestItem {
  id: string
  name: string
  qty: number
  requestId: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface OnsiteRequest {
  id: string
  requestedById: string
  requestedBy: User
  purpose: string
  onsiteAt: string
  address: string
  quoteId: string
  quote: {
    id: string
    quoteNo: string
    customer: {
      id: string
      name: string
      phone: string
    }
    items: any[]
  }
  items: OnsiteRequestItem[]
  status: OnsiteStatus
  createdAt: string
  updatedAt: string
}

export interface OnsiteRequestLog {
  id: string
  requestId: string
  action: 'CREATED' | 'STATUS_CHANGED' | 'ITEMS_UPDATED' | 'UPDATED'
  changedById: string
  changedBy: User
  description: string
  oldStatus?: OnsiteStatus
  newStatus?: OnsiteStatus
  metadata?: Record<string, any>
  timestamp: string
}

export interface CreateOnsiteRequestDto {
  purpose: string
  onsiteAt: string
  address: string
  quoteId: string
  items?: OnsiteRequestItem[]
}

export interface UpdateOnsiteRequestDto {
  purpose?: string
  onsiteAt?: string
  address?: string
  items?: OnsiteRequestItem[]
}

export interface UpdateOnsiteRequestStatusDto {
  status: OnsiteStatus
  metadata?: Record<string, any>
}

export interface OnsiteRequestStatistics {
  total: number
  requested: number
  approved: number
  rejected: number
}
