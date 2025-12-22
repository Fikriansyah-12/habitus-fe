export interface Customer {
  id: string
  name: string
  phone: string
  createdAt: string
  updatedAt: string
  quotes?: Quote[]
}

export interface Quote {
  id: string
  quoteNo: string
  customerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerDto {
  name: string
  phone: string
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}
