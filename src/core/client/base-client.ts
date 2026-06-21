import { FindAllRequestDto } from '../data/request/pagination'
import { ResponseDto } from '../data/request/response'
import { Headers } from '../data/request/headers'

export interface BaseClient<T> {
  insert(body: T, headers: Headers): Promise<ResponseDto<T>>
  findById(id: string, headers: Headers): Promise<ResponseDto<T>>
  find(filter: Partial<T>, headers: Headers): Promise<ResponseDto<T>>
  findAll(filter: FindAllRequestDto<T>, headers: Headers): Promise<ResponseDto<T[]>>
  update(id: string, body: Partial<T>, headers: Headers): Promise<ResponseDto<T>>
  delete(id: string, headers: Headers): Promise<void>
}
