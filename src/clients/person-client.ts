import { withHeaders } from '../core/client/request-config'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { ResponseDto } from '../core/data/request/response'
import type { Headers } from '../core/data/request/headers'
import type { Person } from '../core/data/person/person-entity'
import type { PersonAvatarResult, UpdateAvatarRequest } from '../core/data/person/person-avatar'

export class PersonClient extends HttpBaseClient<Person> {
  constructor () {
    super('people')
  }

  /**
   * Foto de perfil pelo nome de usuário (e-mail). Só devolve a de quem é do mesmo
   * restaurante do token; `avatar: null` quando não há foto (ou o usuário não é visível).
   */
  async getAvatarByUsername (username: string, headers: Headers): Promise<ResponseDto<PersonAvatarResult>> {
    const response = await this.connection.get<ResponseDto<PersonAvatarResult>>(
      `/avatar/${encodeURIComponent(username)}`,
      withHeaders(headers),
    )
    return response.data
  }

  /** Troca a foto de perfil do usuário autenticado (data URL JPG/PNG/WebP, até 1 MB). */
  async updateMyAvatar (body: UpdateAvatarRequest, headers: Headers): Promise<ResponseDto<PersonAvatarResult>> {
    const response = await this.connection.put<ResponseDto<PersonAvatarResult>>('/me/avatar', body, withHeaders(headers))
    return response.data
  }

  /** Remove a foto de perfil do usuário autenticado (volta pras iniciais). */
  async removeMyAvatar (headers: Headers): Promise<ResponseDto<PersonAvatarResult>> {
    const response = await this.connection.delete<ResponseDto<PersonAvatarResult>>('/me/avatar', withHeaders(headers))
    return response.data
  }
}
