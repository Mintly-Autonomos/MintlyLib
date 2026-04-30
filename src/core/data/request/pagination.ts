export type PaginationDto = {
  page: number
  size: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  createdAtDirection?: 'asc' | 'desc'
}

export type PaginationResponseDto = {
  page: number
  size: number
  totalItems: number
  totalPages: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  createdAtDirection?: 'asc' | 'desc'
}

export type FindAllRequestDto<T> = Partial<T> & {
  pagination: PaginationDto
}