import { PaginationResponseDto } from './pagination'

export type ResponseDto<T> = {
  payload?: T
  pagination?: PaginationResponseDto
}
