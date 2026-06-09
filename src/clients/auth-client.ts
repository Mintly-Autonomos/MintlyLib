import axios, { AxiosInstance } from 'axios'
import type { ResponseDto } from '../core/data/request/response'
import type { SignupRequest } from '../core/data/auth/signup-schema'
import type { LoginRequest } from '../core/data/auth/login-schema'
import type { SignupResult, LoginResult, RefreshResult } from '../core/data/auth/auth-response'

/**
 * Cliente de autenticação (RPC, não CRUD): cadastro, login, refresh e logout.
 * Respostas seguem o mesmo envelope ResponseDto do restante da API.
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

  async signup (body: SignupRequest): Promise<ResponseDto<SignupResult>> {
    const response = await this.connection.post<ResponseDto<SignupResult>>('/signup', body)
    return response.data
  }

  async login (body: LoginRequest): Promise<ResponseDto<LoginResult>> {
    const response = await this.connection.post<ResponseDto<LoginResult>>('/login', body)
    return response.data
  }

  async refresh (refreshToken: string): Promise<ResponseDto<RefreshResult>> {
    const response = await this.connection.post<ResponseDto<RefreshResult>>('/refresh', { refreshToken })
    return response.data
  }

  async logout (refreshToken: string): Promise<void> {
    await this.connection.post('/logout', { refreshToken })
  }
}
