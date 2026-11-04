import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { Restaurant } from '../core/data/restaurant/restaurant-entity'
import type { RestaurantProfileQuery, RestaurantProfileResponse, RestaurantUpdateRequest } from '../core/data/restaurant/restaurant-tax'
import type {
  DeletionRequest,
  DeletionStatus,
  MemberCreateRequest,
  MemberUpdateRequest,
  RestaurantMember,
} from '../core/data/account/account-schema'

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

  /**
   * Conclui o onboarding: o servidor grava a data do primeiro acesso (`firstAccessAt`). Sem corpo, e
   * repetir não muda a data (idempotente).
   */
  async completeFirstAccess (headers: Headers): Promise<ResponseDto<Restaurant>> {
    const response = await this.http.connection.post<ResponseDto<Restaurant>>('/me/first-access', {}, withHeaders(headers))
    return response.data
  }

  /** Atualiza nome e/ou regime tributário. Só o dono. */
  async updateMe (body: RestaurantUpdateRequest, headers: Headers): Promise<ResponseDto<Restaurant>> {
    const response = await this.http.connection.patch<ResponseDto<Restaurant>>('/me', body, withHeaders(headers))
    return response.data
  }

  /** Funcionários do restaurante (logins com papel `member`). Só o dono. */
  async listMembers (headers: Headers): Promise<ResponseDto<RestaurantMember[]>> {
    const response = await this.http.connection.get<ResponseDto<RestaurantMember[]>>('/me/members', withHeaders(headers))
    return response.data
  }

  /** Cria um login de funcionário (e-mail + senha). Só o dono. */
  async createMember (body: MemberCreateRequest, headers: Headers): Promise<ResponseDto<RestaurantMember>> {
    const response = await this.http.connection.post<ResponseDto<RestaurantMember>>('/me/members', body, withHeaders(headers))
    return response.data
  }

  /** Ativa/inativa um funcionário e/ou define uma senha nova para ele. Só o dono. */
  async updateMember (id: string, body: MemberUpdateRequest, headers: Headers): Promise<ResponseDto<RestaurantMember>> {
    const response = await this.http.connection.patch<ResponseDto<RestaurantMember>>(`/me/members/${id}`, body, withHeaders(headers))
    return response.data
  }

  /**
   * Pede a exclusão do restaurante (confirmada com a senha do dono). É só um PEDIDO: nada é apagado na hora;
   * o dado fica guardado até o pedido ser analisado e pode ser cancelado. Só o dono.
   */
  async requestDeletion (body: DeletionRequest, headers: Headers): Promise<ResponseDto<DeletionStatus>> {
    const response = await this.http.connection.post<ResponseDto<DeletionStatus>>('/me/deletion-request', body, withHeaders(headers))
    return response.data
  }

  /** Cancela o pedido de exclusão. Só o dono. */
  async cancelDeletion (headers: Headers): Promise<ResponseDto<DeletionStatus>> {
    const response = await this.http.connection.delete<ResponseDto<DeletionStatus>>('/me/deletion-request', withHeaders(headers))
    return response.data
  }
}
