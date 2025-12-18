// Backend Response Types (Raw from API)
export interface BackendOnsiteRequest {
  id: string
  requestedById: string
  purpose: string
  onsiteAt: string
  address: string
  status: string
  quoteId: string
  createdAt: string
  updatedAt: string
  requestedBy: {
    id: string
    name: string
    email: string
  }
  quote: {
    id: string
    quoteNo: string
    customerId: string
    customer: {
      id: string
      name: string
      phone: string
    }
  }
  items: Array<{
    id: string
    name: string
    qty: number
  }>
}

export interface BackendQuote {
  id: string
  quoteNo: string
  customerId: string
  customer: {
    id: string
    name: string
    phone: string
  }
  items?: Array<{
    id: string
    name: string
    qty: number
  }>
}

// API Response Types
export interface LoginDto {
  email: string
  password: string
}

export interface UserResponseDto {
  id: string
  email: string
  name: string
}

export interface LoginResponseDto {
  user: UserResponseDto
  token: string
}

export interface LogoutResponseDto {
  message: string
  timestamp?: Date
}

export interface CreateOnsiteRequestItemDto {
  itemId?: string
  name: string
  qty: number  // Backend expects 'qty' not 'quantity'
}

export interface CreateOnsiteRequestDto {
  purpose: string
  onsiteAt: string  // Backend expects single date, not startDate/endDate
  address: string   // Backend expects 'address' not 'location'
  quoteId: string   // Backend expects 'quoteId' not 'quoteNo'
  items?: CreateOnsiteRequestItemDto[]
  // Note: notes field removed as backend doesn't use it
}

export interface UpdateOnsiteRequestDto extends Partial<CreateOnsiteRequestDto> {
  status?: string
}

export interface OnsiteRequestDto {
  id: string
  purpose: string
  startDate?: string
  onsiteAt?: string
  endDate?: string
  location?: string
  address?: string
  notes?: string
  quoteNo?: string
  quoteId?: string
  userName?: string
  requestedBy?: { name: string }
  itemName?: string
  customerName?: string
  status: string
  createdAt: string
  updatedAt: string
  items?: Array<{
    name: string
    quantity?: number
    qty?: number
  }>
  quote?: {
    quoteNo: string
    customer: { name: string; phone: string }
  }
}

export interface UpdateOnsiteRequestStatusDto {
  status: string
}

export interface CreateQuoteDto {
  quoteNo: string
  itemName: string
  quantity: number
  customerName: string
  customerPhone: string
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {}

export interface QuoteDto {
  id: string
  quoteNo: string
  customerId: string
  customer: {
    id: string
    name: string
    phone: string
  }
  items: Array<{
    id: string
    name: string
    qty: number
  }>
  createdAt: string
  updatedAt: string
  // Legacy fields for backward compatibility
  itemName?: string
  quantity?: number
  customerName?: string
  customerPhone?: string
}

// UI Types
export const RequestPurposeValues = {
  PENAWARAN: 'Penawaran Barang',
  MEETING: 'Meeting',
  SURVEY: 'Survey',
  DOKUMENTASI: 'Dokumentasi'
} as const

export type RequestPurpose = typeof RequestPurposeValues[keyof typeof RequestPurposeValues]

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
