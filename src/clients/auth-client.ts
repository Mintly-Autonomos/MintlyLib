import axios, { AxiosInstance } from 'axios'
import type { ResponseDto } from '../core/data/request/response'
import type { Headers } from '../core/data/request/headers'
import { withHeaders } from '../core/client/request-config'
import type { SignupRequest } from '../core/data/auth/signup-schema'
import type { LoginRequest } from '../core/data/auth/login-schema'
import type { SignupResult, LoginResult, RefreshResult, RecoveryMessageResult } from '../core/data/auth/auth-response'
import type { ResetPasswordRequest } from '../core/data/auth/reset-password-request'

/**
 * Cliente de autenticação (RPC, não CRUD): cadastro, login, refresh e logout.
 * Respostas seguem o mesmo envelope ResponseDto do restante da API. Todo método
 * recebe os headers de contexto (env obrigatório; authorization no logout).
 */
export class AuthClient {
  protected connection: AxiosInstance

  constructor () {
    this.connection = axios.create({
      baseURL: process.env.BACK_END_URL + '/auth',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async signup (body: SignupRequest, headers: Headers): Promise<ResponseDto<SignupResult>> {
    const response = await this.connection.post<ResponseDto<SignupResult>>('/signup', body, withHeaders(headers))
    return response.data
  }

  async login (body: LoginRequest, headers: Headers): Promise<ResponseDto<LoginResult>> {
    const response = await this.connection.post<ResponseDto<LoginResult>>('/login', body, withHeaders(headers))
    return response.data
  }

  async refresh (refreshToken: string, headers: Headers): Promise<ResponseDto<RefreshResult>> {
    const response = await this.connection.post<ResponseDto<RefreshResult>>('/refresh', { refreshToken }, withHeaders(headers))
    return response.data
  }

  // Logout exige Bearer válido (headers.authorization): é de onde saem
  // userId/restaurantId da auditoria (RN19).
  async logout (refreshToken: string, headers: Headers): Promise<void> {
    await this.connection.post('/logout', { refreshToken }, withHeaders(headers))
  }

  /** Dispara o e-mail de recuperação. Resposta é sempre genérica (não revela se o e-mail existe). */
  async forgotPassword (email: string, headers: Headers): Promise<ResponseDto<RecoveryMessageResult>> {
    const response = await this.connection.post<ResponseDto<RecoveryMessageResult>>('/forgot-password', { email }, withHeaders(headers))
    return response.data
  }

  /** Redefine a senha a partir do token recebido por e-mail. */
  async resetPassword (body: ResetPasswordRequest, headers: Headers): Promise<ResponseDto<RecoveryMessageResult>> {
    const response = await this.connection.post<ResponseDto<RecoveryMessageResult>>('/reset-password', body, withHeaders(headers))
    return response.data
  }
}
