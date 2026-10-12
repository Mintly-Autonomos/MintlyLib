import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { Restaurant } from '../core/data/restaurant/restaurant-entity'
import type { RestaurantProfileQuery, RestaurantProfileResponse, RestaurantUpdateRequest } from '../core/data/restaurant/restaurant-tax'

/**
 * Restaurante do usuário autenticado (fatia 3). COMPÕE o HttpBaseClient (A10):
 * antes estendia o CRUD genérico de /restaurants, mas essas rotas nunca
 * existiram — todo método dava 404. O restaurante vem do token, por isso `/me`.
 */
export class RestaurantClient {
  private readonly http = new HttpBaseClient<Restaurant>('restaurants')

  /** Restaurante + perfil tributário do mês (padrão: mês corrente). */
  async me (query: RestaurantProfileQuery, headers: Headers): Promise<ResponseDto<RestaurantProfileResponse>> {
    const response = await this.http.connection.get<ResponseDto<RestaurantProfileResponse>>('/me', withHeaders(headers, { params: query }))
    return response.data
  }

  /** Atualiza nome e/ou regime tributário. */
  async updateMe (body: RestaurantUpdateRequest, headers: Headers): Promise<ResponseDto<Restaurant>> {
    const response = await this.http.connection.patch<ResponseDto<Restaurant>>('/me', body, withHeaders(headers))
    return response.data
  }
}
