import axios, { AxiosInstance } from 'axios'
import { BaseClient } from './base-client'
import { PaginationDto } from '../data/request/pagination'
import { ResponseDto } from '../data/request/response'

export class HttpBaseClient<T> implements BaseClient<T> {
  protected connection: AxiosInstance

  constructor (readonly baseUrl: string) {
    this.connection = axios.create({
      baseURL: process.env.BACK_END_URL + '/' + baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async insert (body: T): Promise<ResponseDto<T>> {
    const response = await this.connection.post<ResponseDto<T>>('/', body)
    return response.data
  }

  async findById (id: string): Promise<ResponseDto<T>> {
    const response = await this.connection.get<ResponseDto<T>>(`/${id}`)
    return response.data
  }

  async find (filter: Partial<T>): Promise<ResponseDto<T>> {
    const response = await this.connection.get<ResponseDto<T>>('/', { params: { ...filter, isMultipleResponse: false } })
    return response.data
  }

  async findAll (filter: Partial<T> & PaginationDto): Promise<ResponseDto<T[]>> {
    const response = await this.connection.get<ResponseDto<T[]>>('/', { params: { ...filter, isMultipleResponse: true } })
    return response.data
  }

  async update (id: string, body: Partial<T>): Promise<ResponseDto<T>> {
    const response = await this.connection.put<ResponseDto<T>>(`/${id}`, body)
    return response.data
  }

  async delete (id: string): Promise<void> {
    await this.connection.delete(`/${id}`)
  }
}
