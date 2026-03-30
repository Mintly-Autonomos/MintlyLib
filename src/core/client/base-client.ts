import { PaginationDto } from '../data/request/pagination'
import { ResponseDto } from '../data/request/response'

export interface BaseClient<T> {
  insert(body: T): Promise<ResponseDto<T>>
  findById(id: string): Promise<ResponseDto<T>>
  find(filter: Partial<T>): Promise<ResponseDto<T>>
  findAll(filter: Partial<T> & { pagination: PaginationDto }): Promise<ResponseDto<T[]>>
  update(id: string, body: Partial<T>): Promise<ResponseDto<T>>
  delete(id: string): Promise<void>
}
