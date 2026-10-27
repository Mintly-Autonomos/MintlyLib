import { withHeaders } from '../core/client/request-config'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { ResponseDto } from '../core/data/request/response'
import type { Headers } from '../core/data/request/headers'
import type { Person } from '../core/data/person/person-entity'
import type { PersonAvatarResult } from '../core/data/person/person-avatar'

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
}
