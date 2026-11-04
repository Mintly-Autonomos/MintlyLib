import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type {
  AccountMessage,
  AccountUpdateRequest,
  ChangeEmailRequest,
  ChangePasswordRequest,
  MyAccount,
} from '../core/data/account/account-schema'

/**
 * Conta de quem está logado: ver e editar os próprios dados, trocar e-mail e senha. COMPÕE o HttpBaseClient
 * (como Restaurant): só expõe o que as rotas têm. O usuário vem do token, por isso tudo é `/me`.
 */
export class UserClient {
  private readonly http = new HttpBaseClient<unknown>('users')

  /** Nome, e-mail, telefone e papel (dono ou funcionário) de quem está logado. */
  async getMe (headers: Headers): Promise<ResponseDto<MyAccount>> {
    const response = await this.http.connection.get<ResponseDto<MyAccount>>('/me', withHeaders(headers))
    return response.data
  }

  /** Atualiza nome e/ou telefone. */
  async updateMe (body: AccountUpdateRequest, headers: Headers): Promise<ResponseDto<MyAccount>> {
    const response = await this.http.connection.patch<ResponseDto<MyAccount>>('/me', body, withHeaders(headers))
    return response.data
  }

  /** Troca o e-mail de login; exige a senha atual. */
  async changeEmail (body: ChangeEmailRequest, headers: Headers): Promise<ResponseDto<MyAccount>> {
    const response = await this.http.connection.patch<ResponseDto<MyAccount>>('/me/email', body, withHeaders(headers))
    return response.data
  }

  /**
   * Troca a senha estando logado (com a antiga). Encerra todas as sessões do usuário: depois disso é preciso
   * entrar de novo com a senha nova.
   */
  async changePassword (body: ChangePasswordRequest, headers: Headers): Promise<ResponseDto<AccountMessage>> {
    const response = await this.http.connection.post<ResponseDto<AccountMessage>>('/me/password', body, withHeaders(headers))
    return response.data
  }
}
