import { AxiosInstance } from 'axios'
import { BaseClient } from './base-client'
import { createHttpConnection } from './create-connection'
import { withHeaders } from './request-config'
import { PaginationDto } from '../data/request/pagination'
import { ResponseDto } from '../data/request/response'
import { Headers } from '../data/request/headers'

/**
 * Caixa de ferramentas HTTP com todas as operações CRUD. Uso:
 *  - recurso com CRUD COMPLETO (ex.: /people) → ESTENDE (herda tudo, é o contrato);
 *  - recurso com CRUD PARCIAL (account/category/movement) → COMPÕE (`new
 *    HttpBaseClient(...)`) e re-expõe só o subconjunto válido — senão herdaria
 *    findById/delete inexistentes (404 em runtime).
 * `connection` é público p/ os endpoints próprios dos clients compostos.
 */
export class HttpBaseClient<T> implements BaseClient<T> {
  readonly connection: AxiosInstance

  constructor (readonly baseUrl: string) {
    this.connection = createHttpConnection(baseUrl)
  }

  async insert (body: T, headers: Headers): Promise<ResponseDto<T>> {
    const response = await this.connection.post<ResponseDto<T>>('/', body, withHeaders(headers))
    return response.data
  }

  async findById (id: string, headers: Headers): Promise<ResponseDto<T>> {
    const response = await this.connection.get<ResponseDto<T>>(`/${id}`, withHeaders(headers))
    return response.data
  }

  async find (filter: Partial<T>, headers: Headers): Promise<ResponseDto<T>> {
    const response = await this.connection.get<ResponseDto<T>>('/', withHeaders(headers, { params: { ...filter, isMultipleResponse: false } }))
    return response.data
  }

  async findAll (filter: Partial<T> & PaginationDto, headers: Headers): Promise<ResponseDto<T[]>> {
    const response = await this.connection.get<ResponseDto<T[]>>('/', withHeaders(headers, { params: { ...filter, isMultipleResponse: true } }))
    return response.data
  }

  async update (id: string, body: Partial<T>, headers: Headers): Promise<ResponseDto<T>> {
    const response = await this.connection.patch<ResponseDto<T>>(`/${id}`, body, withHeaders(headers))
    return response.data
  }

  async delete (id: string, headers: Headers): Promise<void> {
    await this.connection.delete(`/${id}`, withHeaders(headers))
  }
}
