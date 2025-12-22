export interface QuoteItem {
  id: string
  name: string
  qty: number
  quoteId: string
}

export interface Quote {
  id: string
  quoteNo: string
  customerId: string
  customer: {
    id: string
    name: string
    phone: string
  }
  items: QuoteItem[]
  onsiteRequests?: any[]
  createdAt: string
  updatedAt: string
}

export interface CreateQuoteDto {
  quoteNo: string
  customerId: string
  items?: Array<{
    name: string
    qty: number
  }>
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {}
